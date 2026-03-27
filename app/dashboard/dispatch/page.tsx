"use client";
import { useState, useEffect } from "react";
import {
  Plus,
  MapPin,
  Clock,
  User,
  Truck,
  ChevronRight,
  X,
  AlertTriangle,
} from "lucide-react";
import {
  getOpenIncidents,
  getVehicles,
  createIncident,
  updateIncidentStatus,
} from "@/lib/api";
import type { Incident, Vehicle } from "@/lib/api";

import dynamic from "next/dynamic";
import { useTheme } from "@/lib/theme-context";

const LeafletMap = dynamic(() => import("./MapView"), { ssr: false });


const TYPE_COLORS: Record<
  string,
  { bg: string; border: string; text: string; label: string }
> = {
  crime: {
    bg: "var(--red-bg)",
    border: "var(--red-border)",
    text: "var(--red)",
    label: "Crime",
  },
  fire: {
    bg: "var(--amber-bg)",
    border: "var(--amber-border)",
    text: "var(--amber)",
    label: "Fire",
  },
  medical: {
    bg: "var(--green-bg)",
    border: "var(--green-border)",
    text: "var(--green)",
    label: "Medical",
  },
  accident: {
    bg: "var(--blue-bg)",
    border: "var(--blue-border)",
    text: "var(--blue)",
    label: "Accident",
  },
  other: {
    bg: "var(--red-bg)",
    border: "var(--red-border)",
    text: "var(--red)",
    label: "Other",
  },
};

const STATUS_COLORS: Record<string, string> = {
  created: "var(--muted)",
  dispatched: "var(--red)",
  in_progress: "var(--amber)",
  resolved: "var(--green)",
};

const STATUS_LABELS: Record<string, string> = {
  created: "Created",
  dispatched: "Dispatched",
  in_progress: "In Progress",
  resolved: "Resolved",
};

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff < 1) return "just now";
  if (diff < 60) return `${diff}m ago`;
  return `${Math.floor(diff / 60)}h ago`;
}

// ── New Incident Modal ───────────────────────
function NewIncidentModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (i: Incident) => void;
}) {
  const [form, setForm] = useState({
    citizen_name: "",
    incident_type: "medical",
    latitude: "",
    longitude: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await createIncident({
        citizen_name: form.citizen_name,
        incident_type: form.incident_type,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        notes: form.notes,
      });
      onCreated(result.incident);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create incident",
      );
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "9px 12px",
    background: "var(--bg3)",
    border: "1px solid var(--border)",
    borderRadius: "7px",
    color: "var(--text)",
    fontSize: "13px",
    outline: "none",
    fontFamily: "var(--font-display)",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "var(--bg2)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          padding: "24px",
          width: "100%",
          maxWidth: "440px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        className="animate-slide-in"
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              fontSize: "15px",
              fontWeight: "600",
              color: "var(--text)",
            }}
          >
            Log New Incident
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--muted)",
            }}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "var(--red-bg)",
              border: "1px solid var(--red-border)",
              borderRadius: "8px",
              padding: "10px 12px",
              marginBottom: "14px",
            }}
          >
            <AlertTriangle size={14} color="var(--red)" />
            <span style={{ fontSize: "13px", color: "var(--red)" }}>
              {error}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "14px" }}>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                color: "var(--muted2)",
                marginBottom: "5px",
                letterSpacing: "0.04em",
              }}
            >
              CALLER NAME
            </label>
            <input
              required
              type="text"
              placeholder="Name of person reporting"
              value={form.citizen_name}
              onChange={(e) =>
                setForm((p) => ({ ...p, citizen_name: e.target.value }))
              }
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                color: "var(--muted2)",
                marginBottom: "5px",
                letterSpacing: "0.04em",
              }}
            >
              INCIDENT TYPE
            </label>
            <select
              value={form.incident_type}
              onChange={(e) =>
                setForm((p) => ({ ...p, incident_type: e.target.value }))
              }
              style={{ ...inputStyle, cursor: "pointer" }}
              title="Incident type"
            >
              <option value="medical">Medical Emergency</option>
              <option value="fire">Fire</option>
              <option value="crime">Crime</option>
              <option value="accident">Road Accident</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              marginBottom: "14px",
            }}
          >
            {[
              { label: "LATITUDE", key: "latitude", placeholder: "5.6037" },
              { label: "LONGITUDE", key: "longitude", placeholder: "-0.1870" },
            ].map((f) => (
              <div key={f.key}>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    color: "var(--muted2)",
                    marginBottom: "5px",
                    letterSpacing: "0.04em",
                  }}
                >
                  {f.label}
                </label>
                <input
                  required
                  type="number"
                  step="any"
                  placeholder={f.placeholder}
                  value={(form as Record<string, string>)[f.key]}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [f.key]: e.target.value }))
                  }
                  style={inputStyle}
                />
              </div>
            ))}
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                color: "var(--muted2)",
                marginBottom: "5px",
                letterSpacing: "0.04em",
              }}
            >
              NOTES
            </label>
            <textarea
              rows={3}
              placeholder="Additional details about the incident…"
              value={form.notes}
              onChange={(e) =>
                setForm((p) => ({ ...p, notes: e.target.value }))
              }
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: "10px",
                background: "var(--bg3)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                color: "var(--muted)",
                fontSize: "13px",
                cursor: "pointer",
                fontFamily: "var(--font-display)",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 2,
                padding: "10px",
                background: "var(--red)",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "13px",
                fontWeight: "500",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "var(--font-display)",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Logging…" : "Log Incident"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Map placeholder ──────────────────────────
// function MapView({
//   incidents,
//   vehicles,
//   selectedId,
// }: {
//   incidents: Incident[];
//   vehicles: Vehicle[];
//   selectedId: string | null;
// }) {
//   return (
//     <div
//       style={{
//         width: "100%",
//         height: "100%",
//         background: "#0d1020",
//         position: "relative",
//         overflow: "hidden",
//       }}
//     >
//       <div
//         style={{
//           position: "absolute",
//           inset: 0,
//           backgroundImage:
//             "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
//           backgroundSize: "50px 50px",
//         }}
//       />
//       {[
//         { left: "0", top: "38%", width: "100%", height: "3px" },
//         { left: "0", top: "63%", width: "100%", height: "2px" },
//         { left: "28%", top: "0", width: "2px", height: "100%" },
//         { left: "66%", top: "0", width: "3px", height: "100%" },
//       ].map((r, i) => (
//         <div
//           key={i}
//           style={{
//             position: "absolute",
//             background: "rgba(255,255,255,0.05)",
//             borderRadius: "2px",
//             ...r,
//           }}
//         />
//       ))}

//       {incidents
//         .filter((i) => i.status !== "resolved")
//         .map((inc, idx) => {
//           const c = TYPE_COLORS[inc.incident_type] || TYPE_COLORS.other;
//           const positions = [
//             { left: "42%", top: "30%" },
//             { left: "70%", top: "55%" },
//             { left: "22%", top: "60%" },
//             { left: "50%", top: "70%" },
//           ];
//           const pos = positions[idx % positions.length];
//           const isSelected = inc.incident_id === selectedId;
//           return (
//             <div
//               key={inc.incident_id}
//               style={{
//                 position: "absolute",
//                 ...pos,
//                 transform: "translate(-50%, -50%)",
//                 display: "flex",
//                 flexDirection: "column",
//                 alignItems: "center",
//                 zIndex: isSelected ? 10 : 5,
//               }}
//             >
//               {isSelected && (
//                 <div
//                   className="ping-ring"
//                   style={{
//                     position: "absolute",
//                     width: "28px",
//                     height: "28px",
//                     borderRadius: "50%",
//                     border: `2px solid ${c.text}`,
//                     top: "50%",
//                     left: "50%",
//                     transform: "translate(-50%, -50%)",
//                   }}
//                 />
//               )}
//               <div
//                 style={{
//                   width: "28px",
//                   height: "28px",
//                   borderRadius: "50%",
//                   background: c.bg,
//                   border: `2px solid ${c.text}`,
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                 }}
//               >
//                 <AlertTriangle size={12} color={c.text} />
//               </div>
//               <div
//                 style={{
//                   marginTop: "3px",
//                   fontSize: "9px",
//                   padding: "1px 5px",
//                   background: c.bg,
//                   color: c.text,
//                   borderRadius: "3px",
//                   border: `1px solid ${c.border}`,
//                   whiteSpace: "nowrap",
//                   fontWeight: "500",
//                 }}
//               >
//                 {inc.incident_id.slice(0, 8)}
//               </div>
//             </div>
//           );
//         })}

//       {vehicles
//         .filter((v) => v.status === "dispatched")
//         .map((v, idx) => {
//           const vPositions = [
//             { left: "36%", top: "44%" },
//             { left: "62%", top: "48%" },
//             { left: "18%", top: "54%" },
//           ];
//           const pos = vPositions[idx % vPositions.length];
//           return (
//             <div
//               key={v.vehicle_id}
//               style={{
//                 position: "absolute",
//                 ...pos,
//                 background: "rgba(12,14,20,0.9)",
//                 border: "1px solid var(--border2)",
//                 borderRadius: "5px",
//                 padding: "3px 8px",
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "5px",
//                 fontSize: "10px",
//                 color: "var(--text)",
//                 zIndex: 6,
//               }}
//             >
//               <div
//                 className="pulse-dot"
//                 style={{
//                   width: "6px",
//                   height: "6px",
//                   borderRadius: "50%",
//                   background:
//                     v.vehicle_type === "police"
//                       ? "var(--blue)"
//                       : v.vehicle_type === "fire_truck"
//                         ? "var(--amber)"
//                         : "var(--green)",
//                 }}
//               />
//               {v.plate_number}
//             </div>
//           );
//         })}

//       <div
//         style={{
//           position: "absolute",
//           bottom: "12px",
//           right: "12px",
//           background: "rgba(12,14,20,0.85)",
//           border: "1px solid var(--border)",
//           borderRadius: "6px",
//           padding: "7px 10px",
//           fontSize: "10px",
//           color: "var(--muted)",
//         }}
//       >
//         Google Maps integration coming soon
//       </div>

//       <div
//         style={{
//           position: "absolute",
//           bottom: "12px",
//           left: "12px",
//           background: "rgba(12,14,20,0.85)",
//           border: "1px solid var(--border)",
//           borderRadius: "6px",
//           padding: "7px 10px",
//           display: "flex",
//           gap: "12px",
//         }}
//       >
//         {[
//           { color: "var(--red)", label: "Crime" },
//           { color: "var(--amber)", label: "Fire" },
//           { color: "var(--green)", label: "Medical" },
//           { color: "var(--blue)", label: "Accident" },
//         ].map((l) => (
//           <div
//             key={l.label}
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: "5px",
//               fontSize: "10px",
//               color: "var(--muted)",
//             }}
//           >
//             <div
//               style={{
//                 width: "7px",
//                 height: "7px",
//                 borderRadius: "50%",
//                 background: l.color,
//               }}
//             />
//             {l.label}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// ── Main Dispatch Dashboard ──────────────────
export default function DispatchDashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selected, setSelected] = useState<Incident | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false); // <--- ADD THIS

  useEffect(() => {
    // --- ADD THIS BLOCK ---
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const { theme } = useTheme();


  useEffect(() => {
    getOpenIncidents().then(setIncidents).catch(console.error);
    getVehicles().then(setVehicles).catch(console.error);
  }, []);

  async function handleResolve(id: string) {
    try {
      await updateIncidentStatus(id, "resolved");
      setIncidents((prev) => prev.filter((i) => i.incident_id !== id));
      setSelected(null);
    } catch (err) {
      console.error("Failed to resolve:", err);
    }
  }

  const stats = {
    active: incidents.filter((i) => i.status !== "resolved").length,
    dispatched: incidents.filter((i) => i.status === "dispatched").length,
    resolved: incidents.filter((i) => i.status === "resolved").length,
  };

  return (
    <div
      style={{
        height: "calc(100vh - 48px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Stats bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg2)",
          padding: isMobile ? "0 12px" : "0 20px",
          height: "40px",
          overflowX: "auto",
          scrollbarWidth: "none", // Keeps it strictly scrollable
          WebkitOverflowScrolling: "touch",
        }}
      >
        {[
          { label: "Active", val: stats.active, color: "var(--red)", mobileLabel: "Act" },
          { label: "Dispatched", val: stats.dispatched, color: "var(--amber)", mobileLabel: "Disp" },
          { label: "Resolved", val: stats.resolved, color: "var(--green)", mobileLabel: "Res" },
          {
            label: "Vehicles out",
            val: vehicles.filter((v) => v.status === "dispatched").length,
            color: "var(--blue)",
            mobileLabel: "Cars",
          },
        ].map((s, i) => (
          <div
            key={s.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: isMobile ? "4px" : "8px",
              paddingRight: isMobile ? "8px" : "16px",
              paddingLeft: i === 0 ? 0 : (isMobile ? "8px" : "16px"), // Safely replaces the shorthand conflict!
              borderRight: "1px solid var(--border)",
              height: "100%",
              flexShrink: 0, // Prevents elements from squishing together on small screens!
            }}
          >
            <span
              style={{ fontSize: isMobile ? "14px" : "16px", fontWeight: "600", color: s.color }}
            >
              {s.val}
            </span>
            <span style={{ fontSize: isMobile ? "10px" : "11px", color: "var(--muted)" }}>
              {isMobile ? s.mobileLabel : s.label}
            </span>
          </div>
        ))}
        
        <div style={{ flex: 1, minWidth: isMobile ? "10px" : "auto" }} />
        
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            background: "var(--red)",
            border: "none",
            borderRadius: "6px",
            padding: isMobile ? "5px 8px" : "5px 12px",
            color: "#fff",
            fontSize: "12px",
            fontWeight: "500",
            cursor: "pointer",
            flexShrink: 0, // Prevents button from squishing!
            fontFamily: "var(--font-display)",
          }}
        >
          <Plus size={12} /> {!isMobile && "New Incident"}
        </button>
      </div>




      {/* Main 3-panel layout */}
      <div 
        style={
          isMobile 
            ? { flex: 1, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }
            : { flex: 1, display: "grid", gridTemplateColumns: "280px 1fr 260px", overflow: "hidden" }
        }
      >

        {/* LEFT: Incident list */}
        <div
          style={{
            ...(isMobile 
                 ? { height: "35%", width: "100%", order: 2, borderTop: "1px solid var(--border)" } 
                 : { borderRight: "1px solid var(--border)" }),
            background: "var(--bg2)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 20
          }}
        >


          <div
            style={{
              padding: "10px 14px",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <span
              style={{
                fontSize: "10px",
                fontWeight: "500",
                color: "var(--muted)",
                letterSpacing: "0.07em",
              }}
            >
              OPEN INCIDENTS ({incidents.length})
            </span>
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {incidents.length === 0 ? (
              <div
                style={{
                  padding: "20px 14px",
                  textAlign: "center",
                  color: "var(--muted)",
                  fontSize: "12px",
                }}
              >
                No open incidents
              </div>
            ) : (
              incidents.map((inc) => {
                const c = TYPE_COLORS[inc.incident_type] || TYPE_COLORS.other;
                const isActive = selected?.incident_id === inc.incident_id;
                return (
                  <div
                    key={inc.incident_id}
                    onClick={() => setSelected(isActive ? null : inc)}
                    style={{
                      padding: "10px 14px",
                      borderBottom: "1px solid var(--border)",
                      cursor: "pointer",
                      transition: "background 0.12s",
                      background: isActive ? "var(--bg3)" : "transparent",
                      borderLeft: isActive
                        ? `2px solid ${c.text}`
                        : "2px solid transparent",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "4px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "10px",
                          color: "var(--muted)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {inc.incident_id.slice(0, 8)}
                      </span>
                      <span
                        style={{
                          fontSize: "10px",
                          padding: "1px 6px",
                          borderRadius: "3px",
                          background: c.bg,
                          color: c.text,
                          border: `1px solid ${c.border}`,
                          fontWeight: "500",
                        }}
                      >
                        {c.label}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: "500",
                        color: "var(--text)",
                        marginBottom: "3px",
                      }}
                    >
                      {inc.citizen_name}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <div
                          style={{
                            width: "5px",
                            height: "5px",
                            borderRadius: "50%",
                            background: STATUS_COLORS[inc.status],
                          }}
                        />
                        <span
                          style={{ fontSize: "11px", color: "var(--muted)" }}
                        >
                          {STATUS_LABELS[inc.status]}
                        </span>
                      </div>
                      <span style={{ fontSize: "10px", color: "var(--muted)" }}>
                        {timeAgo(inc.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* CENTER: Map */}
        <div 
           style={isMobile ? { order: 1, height: "65%", position: "relative", zIndex: 0 } : { position: "relative", flex: 1 }}
        >
          <LeafletMap
            incidents={incidents}



          vehicles={vehicles}
          selectedId={selected?.incident_id || null}
          theme={theme}
          onSelectIncident={(id) => {
            const inc = incidents.find((i) => i.incident_id === id);
            setSelected(inc || null);
          }}
        /></div>


        {/* RIGHT: Detail panel */}
        <div
          style={{
            ...(isMobile 
                ? { position: "absolute", bottom: 0, left: 0, width: "100%", height: "55%", zIndex: 30, boxShadow: "0 -10px 40px rgba(0,0,0,0.5)" } 
                : { borderLeft: "1px solid var(--border)" }),
            display: selected || !isMobile ? "flex" : "none",
            background: "var(--bg2)",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >


          {selected ? (
            <>
              <div
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "var(--muted)",
                        fontFamily: "var(--font-mono)",
                        marginBottom: "4px",
                      }}
                    >
                      {selected.incident_id.slice(0, 8)}
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "var(--text)",
                        marginBottom: "2px",
                      }}
                    >
                      {
                        (
                          TYPE_COLORS[selected.incident_type] ||
                          TYPE_COLORS.other
                        ).label
                      }
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "10px",
                      padding: "2px 7px",
                      background: (
                        TYPE_COLORS[selected.incident_type] || TYPE_COLORS.other
                      ).bg,
                      color: (
                        TYPE_COLORS[selected.incident_type] || TYPE_COLORS.other
                      ).text,
                      border: `1px solid ${(TYPE_COLORS[selected.incident_type] || TYPE_COLORS.other).border}`,
                      borderRadius: "4px",
                      fontWeight: "500",
                    }}
                  >
                    {STATUS_LABELS[selected.status]}
                  </span>                {/* --- PASTE THIS MOBILE CLOSE BUTTON HERE --- */}
                <button 
                  className="md:hidden ml-2 p-1 bg-[var(--bg3)] text-[var(--muted)] border border-[var(--border)] rounded-md cursor-pointer" 
                  onClick={() => setSelected(null)}
                >
                  <X size={14} />
                </button>
                </div>
              </div>

              <div
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                {[
                  {
                    icon: <User size={11} />,
                    label: "Caller",
                    val: selected.citizen_name,
                  },
                  {
                    icon: <MapPin size={11} />,
                    label: "Location",
                    val: `${Number(selected.latitude).toFixed(4)}, ${Number(selected.longitude).toFixed(4)}`,
                  },
                  {
                    icon: <Truck size={11} />,
                    label: "Unit",
                    val: selected.responder_name || "Pending",
                  },
                  {
                    icon: <Clock size={11} />,
                    label: "Logged",
                    val: timeAgo(selected.created_at),
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        color: "var(--muted)",
                        minWidth: "70px",
                      }}
                    >
                      {row.icon}
                      <span style={{ fontSize: "11px" }}>{row.label}</span>
                    </div>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "var(--text)",
                        fontWeight: "500",
                        textAlign: "right",
                        maxWidth: "130px",
                      }}
                    >
                      {row.val}
                    </span>
                  </div>
                ))}
                {selected.notes && (
                  <div
                    style={{
                      marginTop: "4px",
                      padding: "8px",
                      background: "var(--bg3)",
                      borderRadius: "6px",
                      fontSize: "11px",
                      color: "var(--muted2)",
                      lineHeight: 1.5,
                    }}
                  >
                    {selected.notes}
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div style={{ padding: "12px 14px", flex: 1, overflowY: "auto" }}>
                <div
                  style={{
                    fontSize: "10px",
                    color: "var(--muted)",
                    letterSpacing: "0.07em",
                    marginBottom: "10px",
                  }}
                >
                  ACTIVITY
                </div>
                {[
                  selected.responder_name
                    ? {
                        dot: "var(--blue)",
                        title: "Unit dispatched",
                        sub: `${selected.responder_name} en route`,
                      }
                    : null,
                  selected.assigned_unit_id
                    ? {
                        dot: "var(--amber)",
                        title: "Auto-assigned",
                        sub: "Nearest available unit selected",
                      }
                    : null,
                  {
                    dot: "var(--muted)",
                    title: "Incident created",
                    sub: timeAgo(selected.created_at),
                  },
                ]
                  .filter(Boolean)
                  .map(
                    (item, i, arr) =>
                      item && (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            gap: "10px",
                            marginBottom: "10px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                            }}
                          >
                            <div
                              style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                background: item.dot,
                                marginTop: "2px",
                                flexShrink: 0,
                              }}
                            />
                            {i < arr.length - 1 && (
                              <div
                                style={{
                                  width: "1px",
                                  flex: 1,
                                  background: "var(--border)",
                                  marginTop: "3px",
                                }}
                              />
                            )}
                          </div>
                          <div style={{ paddingBottom: "4px" }}>
                            <div
                              style={{
                                fontSize: "12px",
                                fontWeight: "500",
                                color: "var(--text)",
                                marginBottom: "1px",
                              }}
                            >
                              {item.title}
                            </div>
                            <div
                              style={{
                                fontSize: "11px",
                                color: "var(--muted)",
                              }}
                            >
                              {item.sub}
                            </div>
                          </div>
                        </div>
                      ),
                  )}
              </div>

              {selected.status !== "resolved" && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderTop: "1px solid var(--border)",
                    display: "flex",
                    gap: "8px",
                  }}
                >
                  <button
                    onClick={() => handleResolve(selected.incident_id)}
                    style={{
                      flex: 1,
                      padding: "7px",
                      background: "var(--green-bg)",
                      border: "1px solid var(--green-border)",
                      borderRadius: "6px",
                      color: "var(--green)",
                      fontSize: "11px",
                      fontWeight: "500",
                      cursor: "pointer",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    Mark resolved
                  </button>
                  <button
                    style={{
                      flex: 1,
                      padding: "7px",
                      background: "var(--bg3)",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      color: "var(--muted)",
                      fontSize: "11px",
                      cursor: "pointer",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    Reassign
                  </button>
                </div>
              )}
            </>
          ) : (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--muted)",
                gap: "8px",
              }}
            >
              <ChevronRight size={24} style={{ opacity: 0.3 }} />
              <span style={{ fontSize: "12px" }}>Select an incident</span>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <NewIncidentModal
          onClose={() => setShowModal(false)}
          onCreated={(inc) => setIncidents((prev) => [inc, ...prev])}
        />
      )}
    </div>
  );
}
