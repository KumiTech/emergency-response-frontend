"use client";
import { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Play,
  Square,
  AlertTriangle,
  Truck,
  Activity,
  CheckCircle,
  Shield,
  Flame,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getResponders, getOpenIncidents, createDriverSocket, assignDriverToVehicle } from "@/lib/api";
import type { Responder, Incident } from "@/lib/api";
import { useTheme } from "@/lib/theme-context";

export default function DriverDashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const [myVehicle, setMyVehicle] = useState<Responder | null>(null);
  const [availableVehicles, setAvailableVehicles] = useState<Responder[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState("");

  // Tracking state
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [currentCoords, setCurrentCoords] = useState<{
    lat: number;
    lng: number;
    speed: number;
  } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const watchIdRef = useRef<number | null>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Simulation Logic
  useEffect(() => {
    if (!isSimulating || !isBroadcasting || !myVehicle) return;

    const interval = setInterval(() => {
      const activeInc = incidents.find(i => i.incident_id === selectedIncidentId);
      if (!activeInc || !currentCoords) {
        // Just drift randomly if no target
        setCurrentCoords(p => p ? { ...p, lat: p.lat + 0.0001, lng: p.lng + 0.0001 } : { lat: 5.6037, lng: -0.187, speed: 45 });
        return;
      }

      const targetLat = Number(activeInc.latitude);
      const targetLng = Number(activeInc.longitude);
      const step = 0.0003; // Roughly 30-40 meters per step

      setCurrentCoords(prev => {
        if (!prev) return { lat: 5.6037, lng: -0.187, speed: 45 };
        
        const dLat = targetLat - prev.lat;
        const dLng = targetLng - prev.lng;
        const dist = Math.sqrt(dLat * dLat + dLng * dLng);

        if (dist < step) return { ...prev, lat: targetLat, lng: targetLng, speed: 0 };

        return {
          ...prev,
          lat: prev.lat + (dLat / dist) * step,
          lng: prev.lng + (dLng / dist) * step,
          speed: 60
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isSimulating, isBroadcasting, selectedIncidentId, incidents, myVehicle]);

  // Sync simulated coords to socket
  useEffect(() => {
    if (isSimulating && isBroadcasting && currentCoords && socketRef.current) {
      socketRef.current.emit("driver:location:push", {
        vehicle_id: myVehicle?.responder_id,
        incident_id: selectedIncidentId || null,
        lat: currentCoords.lat,
        lng: currentCoords.lng,
        speed_kmh: currentCoords.speed
      });
    }
  }, [currentCoords, isSimulating, isBroadcasting, myVehicle, selectedIncidentId]);

  async function fetchData() {
    try {
      const [allResponders, allIncidents] = await Promise.all([
        getResponders(),
        getOpenIncidents()
      ]);

      // 1. Filter by Institution (Hospital/Station)
      const institutionalVehicles = allResponders.filter(r => r.hospital_id === user?.hospital_id);
      
      // 2. Find MY vehicle (already linked by admin)
      const assigned = institutionalVehicles.find(v => v.driver_id === user?.user_id);
      
      setMyVehicle(assigned || null);
      setIncidents(allIncidents);
    } catch (err) {
      console.error("Failed to load generic data", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [user]);

  useEffect(() => {
    return () => {
      stopBroadcasting();
    };
  }, []);


  async function startBroadcasting() {
    setLocationError("");
    if (!myVehicle) {
      setLocationError("Please link to a vehicle first.");
      return;
    }

    try {
      // Use createDriverSocket which uses internal driver: namespace
      const socket = await createDriverSocket();
      socketRef.current = socket;

      setIsBroadcasting(true);

      if (isSimulating) {
        // Simulation is handled by the useEffect timer
        if (!currentCoords) setCurrentCoords({ lat: 5.6037, lng: -0.187, speed: 0 });
        return;
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const speed =
            position.coords.speed !== null
              ? position.coords.speed * 3.6 
              : 0;

          setCurrentCoords({ lat, lng, speed });

          if (socket) {
            socket.emit("driver:location:push", {
              vehicle_id: myVehicle.responder_id,
              incident_id: selectedIncidentId || null,
              lat,
              lng,
              speed_kmh: speed,
            });
          }
        },
        (error) => {
          setLocationError("GPS signal lost. Please ensure location is enabled.");
          stopBroadcasting();
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );
    } catch (err) {
      setLocationError("Failed to connect to tracking server.");
      setIsBroadcasting(false);
    }
  }

  function stopBroadcasting() {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsBroadcasting(false);
    setCurrentCoords(null);
  }

  if (loading) {
    return (
      <div style={{ 
        height: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "var(--bg)", color: "var(--muted)", fontSize: "12px", letterSpacing: "0.1em"
      }}>
        INITIALIZING CONSOLE...
      </div>
    );
  }

  const roleStyles = {
    ambulance_driver: { icon: <Activity className="animate-pulse" size={48} />, color: "var(--green)", label: "MEDICAL UNIT" },
    police_driver: { icon: <Shield size={48} />, color: "var(--blue)", label: "POLICE RESPONSE" },
    fire_driver: { icon: <Flame size={48} />, color: "var(--amber)", label: "FIRE SQUAD" },
  };

  const currentRole = (user?.role as keyof typeof roleStyles) || 'ambulance_driver';
  const themeData = roleStyles[currentRole] || roleStyles.ambulance_driver;

  const cardStyle: React.CSSProperties = {
    background: "var(--bg2)",
    border: "1px solid var(--border)",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "20px",
    transition: "all 0.3s ease",
  };

  return (
    <div
      style={{
        height: "calc(100vh - 48px)",
        overflowY: "auto",
        padding: isMobile ? "16px" : "32px",
        background: "var(--bg)",
      }}
    >
      <div style={{ maxWidth: "540px", margin: "0 auto" }}>
        {/* Profile Identity */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
           <div style={{ 
             width: "64px", height: "64px", borderRadius: "16px", background: "var(--bg2)",
             border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center",
             color: themeData.color, boxShadow: `0 8px 16px -4px ${themeData.color}22`
           }}>
             {themeData.icon}
           </div>
           <div>
             <h4 style={{ fontSize: "11px", color: "var(--muted)", letterSpacing: "0.15em", marginBottom: "4px" }}>{themeData.label}</h4>
             <h1 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text)" }}>{user?.name}</h1>
           </div>
        </div>

        {locationError && (
          <div style={{ 
            background: "var(--red-bg)", border: "1px solid var(--red-border)", padding: "12px 16px", 
            borderRadius: "12px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px",
            color: "var(--red)", fontSize: "13px"
          }}>
            <AlertTriangle size={16} /> {locationError}
          </div>
        )}

        {/* Vehicle Assignment State */}
        {!myVehicle ? (
          <div style={cardStyle}>
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <Truck size={48} color="var(--muted2)" style={{ marginBottom: "16px", opacity: 0.3 }} />
              <h2 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px", color: "var(--text)" }}>No Vehicle Assigned</h2>
              <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: "1.6" }}>
                Your institutional admin has not assigned a vehicle to your account yet. 
                Please contact your supervisor to be linked to a unit.
              </p>
              <button 
                onClick={fetchData}
                style={{ 
                  marginTop: "24px", padding: "10px 20px", background: "var(--bg3)", border: "1px solid var(--border)",
                  borderRadius: "8px", color: "var(--text)", fontSize: "12px", cursor: "pointer"
                }}
              >
                CHECK FOR ASSIGNMENT
              </button>
            </div>
          </div>
        ) : (
          /* Active Console */
          <>
            <div style={{ ...cardStyle, borderColor: isBroadcasting ? "var(--green-border)" : "var(--border)" }}>
               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                 <div>
                    <h2 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text)" }}>{myVehicle.name}</h2>
                    <div style={{ fontSize: "12px", color: "var(--muted)" }}>Linked as Primary Operator</div>
                 </div>
               </div>

             <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg3)", padding: "12px", borderRadius: "12px", border: "1px solid var(--border)" }}>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: "600", color: "var(--text)" }}>Simulation Mode</div>
                  <div style={{ fontSize: "10px", color: "var(--muted)" }}>Auto-drive toward incident</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={isSimulating}
                  disabled={isBroadcasting}
                  onChange={(e) => setIsSimulating(e.target.checked)}
                  style={{ width: "20px", height: "20px", cursor: "pointer" }}
                />
             </div>

             <div style={{ marginBottom: "24px" }}>
                  <label style={{ display: "block", fontSize: "11px", color: "var(--muted2)", marginBottom: "8px", letterSpacing: "0.04em" }}>ACTIVE MISSION (OPTIONAL)</label>
                  <select
                    disabled={isBroadcasting}
                    value={selectedIncidentId}
                    onChange={(e) => setSelectedIncidentId(e.target.value)}
                    style={{
                      width: "100%", padding: "12px", background: "var(--bg3)", border: "1px solid var(--border)",
                      borderRadius: "10px", color: "var(--text)", fontSize: "13px", outline: "none",
                      opacity: isBroadcasting ? 0.7 : 1
                    }}
                  >
                    <option value="">Status: PATROLLING</option>
                    {incidents.filter(i => i.status !== 'resolved').map((i) => (
                      <option key={i.incident_id} value={i.incident_id}>
                        TASK: {i.incident_type.toUpperCase()} ({i.incident_id.slice(0,6)})
                      </option>
                    ))}
                  </select>
               </div>

               <div style={{ borderTop: "1px solid var(--border)", paddingTop: "24px" }}>
                  {!isBroadcasting ? (
                    <button
                      onClick={startBroadcasting}
                      style={{
                        width: "100%", padding: "16px", background: themeData.color, color: "#fff",
                        border: "none", borderRadius: "30px", fontSize: "14px", fontWeight: "700",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                        boxShadow: `0 8px 24px -6px ${themeData.color}66`, cursor: "pointer"
                      }}
                    >
                      <Play size={18} fill="white" /> BEGIN TRANSMISSION
                    </button>
                  ) : (
                    <div style={{ textAlign: "center" }}>
                       <div style={{ color: "var(--green)", marginBottom: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                         <Activity className="animate-pulse" />
                         <span style={{ fontSize: "14px", fontWeight: "700", letterSpacing: "0.05em" }}>LIVE TELEMETRY ACTIVE</span>
                       </div>

                       {currentCoords && (
                         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                            <div style={{ background: "var(--bg3)", padding: "12px", borderRadius: "12px" }}>
                               <div style={{ fontSize: "10px", color: "var(--muted)", marginBottom: "4px" }}>SPEED</div>
                               <div style={{ fontSize: "18px", fontWeight: "700", color: "var(--text)" }}>{currentCoords.speed.toFixed(1)} <small>km/h</small></div>
                            </div>
                            <div style={{ background: "var(--bg3)", padding: "12px", borderRadius: "12px" }}>
                               <div style={{ fontSize: "10px", color: "var(--muted)", marginBottom: "4px" }}>MISSION</div>
                               <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text)" }}>{selectedIncidentId ? "ACTIVE" : "PATROL"}</div>
                            </div>
                         </div>
                       )}

                       <button
                        onClick={stopBroadcasting}
                        style={{
                          width: "100%", padding: "14px 24px", background: "var(--red)", color: "#fff",
                          border: "none", borderRadius: "30px", fontSize: "13px", fontWeight: "700",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer"
                        }}
                      >
                        <Square size={16} fill="white" /> END TRANSMISSION
                      </button>
                    </div>
                  )}
               </div>
            </div>
            
            {/* Status Guide */}
            <div style={{ textAlign: "center", color: "var(--muted)", fontSize: "11px", padding: "0 20px" }}>
               Live GPS data is shared with the central dispatch map. Avoid closing this tab while en route to a mission.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
