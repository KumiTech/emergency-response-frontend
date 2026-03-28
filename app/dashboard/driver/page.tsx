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
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getResponders, getOpenIncidents, createDriverSocket } from "@/lib/api";
import type { Responder, Incident } from "@/lib/api";
import { useTheme } from "@/lib/theme-context";

export default function DriverDashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [responders, setResponders] = useState<Responder[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);

  // Selection state (since backend lacks 1-to-1 auth mapping)
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedIncidentId, setSelectedIncidentId] = useState("");

  // Tracking state
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [currentCoords, setCurrentCoords] = useState<{
    lat: number;
    lng: number;
    speed: number;
  } | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const [r, i] = await Promise.all([getResponders(), getOpenIncidents()]);
        setResponders(r);
        setIncidents(i);

        if (r.length > 0) setSelectedVehicleId(r[0].responder_id);
      } catch (err) {
        console.error("Failed to load generic data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    return () => {
      stopBroadcasting();
    };
  }, []);

  async function startBroadcasting() {
    setLocationError("");
    if (!selectedVehicleId) {
      setLocationError("Please select an ambulance unit first.");
      return;
    }

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    try {
      const socket = await createDriverSocket();
      socketRef.current = socket;

      setIsBroadcasting(true);

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const speed =
            position.coords.speed !== null
              ? position.coords.speed * 3.6 // Convert m/s to km/h
              : 0;

          setCurrentCoords({ lat, lng, speed });

          if (socket) {
            socket.emit("driver:location:push", {
              vehicle_id: selectedVehicleId,
              incident_id: selectedIncidentId || null,
              lat,
              lng,
              speed_kmh: speed,
            });
          }
        },
        (error) => {
          console.error("GPS Error:", error);
          setLocationError("Failed to access GPS. Please ensure Location permissions are granted.");
          stopBroadcasting();
        },
        {
          enableHighAccuracy: false,
          maximumAge: 10000,
          timeout: 10000,
        },
      );
    } catch (err) {
      setLocationError("Failed to connect to Dispatch tracking server.");
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
      <div style={{ padding: "40px", color: "var(--muted)", fontSize: "13px" }}>
        Loading Driver Profile…
      </div>
    );
  }

  const baseCardStyle: React.CSSProperties = {
    background: "var(--bg2)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "20px",
  };

  return (
    <div
      style={{
        height: "calc(100vh - 48px)",
        overflowY: "auto",
        padding: isMobile ? "16px" : "24px",
        background: "var(--bg)",
      }}
    >
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        {/* Header Summary */}
        <div style={{ marginBottom: "24px" }}>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: "700",
              color: "var(--text)",
              marginBottom: "8px",
            }}
          >
            Driver Console
          </h1>
          <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: 1.5 }}>
            Welcome, <strong>{user?.name}</strong>. Assign yourself to a vehicle
            and an active dispatch to begin streaming live GPS telemetry to HQ.
          </p>
        </div>

        {locationError && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "var(--red-bg)",
              border: "1px solid var(--red-border)",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "20px",
            }}
          >
            <AlertTriangle size={16} color="var(--red)" />
            <span style={{ fontSize: "13px", color: "var(--red)" }}>
              {locationError}
            </span>
          </div>
        )}

        {/* Demo Assignment Form */}
        <div style={{ ...baseCardStyle, opacity: isBroadcasting ? 0.6 : 1, pointerEvents: isBroadcasting ? "none" : "auto" }}>
          <h2 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Truck size={16} color="var(--amber)" /> Assignment
          </h2>
          
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "11px", color: "var(--muted2)", marginBottom: "6px", letterSpacing: "0.04em" }}>
              YOUR VEHICLE
            </label>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              style={{
                width: "100%", padding: "10px 12px", background: "var(--bg3)",
                border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text)",
                fontSize: "13px", outline: "none", fontFamily: "var(--font-display)"
              }}
            >
              <option value="" disabled>Select Vehicle...</option>
              {responders.map((r) => (
                <option key={r.responder_id} value={r.responder_id}>
                  {r.name} ({r.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "11px", color: "var(--muted2)", marginBottom: "6px", letterSpacing: "0.04em" }}>
              ASSIGNED INCIDENT (Optional)
            </label>
            <select
              value={selectedIncidentId}
              onChange={(e) => setSelectedIncidentId(e.target.value)}
              style={{
                width: "100%", padding: "10px 12px", background: "var(--bg3)",
                border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text)",
                fontSize: "13px", outline: "none", fontFamily: "var(--font-display)"
              }}
            >
              <option value="">No Active Incident (Patrol)</option>
              {incidents.map((i) => (
                <option key={i.incident_id} value={i.incident_id}>
                  {i.incident_type.toUpperCase()} - {i.citizen_name}
                </option>
              ))}
            </select>
            <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: "6px" }}>
              Selecting an incident will broadcast your location directly to HQ's Incident Dispatch Map.
            </p>
          </div>
        </div>

        {/* Action Panel */}
        <div style={{
           display: "flex", flexDirection: "column", gap: "16px",
           background: isBroadcasting ? "var(--green-bg)" : "var(--bg2)",
           border: `1px solid ${isBroadcasting ? "var(--green-border)" : "var(--border)"}`,
           borderRadius: "12px", padding: "24px", textAlign: "center", transition: "all 0.3s"
        }}>
          {!isBroadcasting ? (
            <>
              <div style={{ color: "var(--muted)", marginBottom: "8px" }}>
                <MapPin size={32} opacity={0.6} />
              </div>
              <p style={{ fontSize: "14px", color: "var(--text)", fontWeight: "500", marginBottom: "16px" }}>
                Ready to transmit GPS telemetry.
              </p>
              <button
                onClick={startBroadcasting}
                style={{
                  background: "var(--green)", color: "#fff", border: "none",
                  padding: "14px 24px", borderRadius: "30px", fontSize: "14px", fontWeight: "600",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  cursor: "pointer", boxShadow: "0 4px 14px rgba(29, 158, 117, 0.4)",
                  width: "100%", maxWidth: "300px", margin: "0 auto", transition: "transform 0.1s"
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
                onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <Play size={16} fill="white" />
                START BROADCASTING
              </button>
            </>
          ) : (
            <>
              <div style={{ color: "var(--green)", marginBottom: "8px" }}>
                <Activity size={32} className="animate-pulse" />
              </div>
              <p style={{ fontSize: "16px", color: "var(--green)", fontWeight: "700", marginBottom: "8px" }}>
                Signal Active • En Route
              </p>
              
              {currentCoords && (
                <div style={{ 
                  background: theme === 'dark' ? "rgba(0,0,0,0.2)" : "#fff", 
                  borderRadius: "8px", padding: "12px", 
                  display: "flex", justifyContent: "space-around", marginBottom: "16px" 
                }}>
                  <div>
                    <span style={{ display: "block", fontSize: "10px", color: "var(--muted)" }}>SPEED</span>
                    <span style={{ fontSize: "16px", fontWeight: "600", color: "var(--text)", fontFamily: "var(--font-mono)" }}>
                      {currentCoords.speed.toFixed(1)} km/h
                    </span>
                  </div>
                  <div>
                    <span style={{ display: "block", fontSize: "10px", color: "var(--muted)" }}>LAT / LNG</span>
                    <span style={{ fontSize: "16px", fontWeight: "600", color: "var(--text)", fontFamily: "var(--font-mono)" }}>
                      {currentCoords.lat.toFixed(4)}, {currentCoords.lng.toFixed(4)}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={stopBroadcasting}
                style={{
                  background: "var(--red)", color: "#fff", border: "none",
                  padding: "14px 24px", borderRadius: "30px", fontSize: "14px", fontWeight: "600",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  cursor: "pointer", boxShadow: "0 4px 14px rgba(226, 75, 74, 0.4)",
                  width: "100%", maxWidth: "300px", margin: "0 auto", transition: "transform 0.1s"
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
                onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <Square size={16} fill="white" />
                END BROADCAST
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
