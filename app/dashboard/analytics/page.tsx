"use client";
import { useState, useEffect } from "react";
import {
  TrendingUp,
  Activity,
  MapPin,
  Clock,
  RefreshCw,
  Users,
} from "lucide-react";
import {
  getAnalyticsSummary,
  getIncidentsByRegion,
  getResponseTimes,
  getResourceUtilization,
  getTopResponders,
} from "@/lib/api";
import type {
  AnalyticsSummary,
  RegionMetric,
  ResponseTimeMetric,
  ResourceUtilization,
} from "@/lib/api";

function BarChart({
  data,
  colorVar,
}: {
  data: { label: string; val: number }[];
  colorVar: string;
}) {
  const max = Math.max(...data.map((d) => d.val), 1);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: "8px",
        height: "80px",
      }}
    >
      {data.map((d) => (
        <div
          key={d.label}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              color: "var(--muted)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {d.val}
          </span>
          <div
            style={{
              width: "100%",
              borderRadius: "3px 3px 0 0",
              background: colorVar,
              opacity: 0.8,
              height: `${(d.val / max) * 52}px`,
              transition: "height 0.4s ease",
              minHeight: d.val > 0 ? "4px" : "0",
            }}
          />
          <span
            style={{
              fontSize: "9px",
              color: "var(--muted)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "100%",
              textAlign: "center",
              textTransform: "capitalize",
            }}
          >
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function formatDuration(seconds: number): string {
  if (!seconds) return "—";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

export default function AnalyticsDashboard() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [byRegion, setByRegion] = useState<RegionMetric[]>([]);
  const [responseTimes, setResponseTimes] = useState<ResponseTimeMetric[]>([]);
  const [utilization, setUtilization] = useState<ResourceUtilization[]>([]);
  const [topResponders, setTopResponders] = useState<ResourceUtilization[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchAll() {
    setLoading(true);
    try {
      const [s, r, rt, u, tr] = await Promise.all([
        getAnalyticsSummary(),
        getIncidentsByRegion(),
        getResponseTimes(),
        getResourceUtilization(),
        getTopResponders(),
      ]);
      setSummary(s);
      setByRegion(r);
      setResponseTimes(rt);
      setUtilization(u);
      setTopResponders(tr);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  if (loading)
    return (
      <div style={{ padding: "40px", color: "var(--muted)", fontSize: "13px" }}>
        Loading analytics…
      </div>
    );

  const incidentTypeData = summary
    ? [
        { label: "Medical", val: parseInt(summary.medical) || 0 },
        { label: "Fire", val: parseInt(summary.fire) || 0 },
        { label: "Crime", val: parseInt(summary.crime) || 0 },
        { label: "Accident", val: parseInt(summary.accident) || 0 },
        { label: "Other", val: parseInt(summary.other) || 0 },
      ]
    : [];

  const statusData = summary
    ? [
        { label: "Created", val: parseInt(summary.created) || 0 },
        { label: "Dispatched", val: parseInt(summary.dispatched) || 0 },
        { label: "In Progress", val: parseInt(summary.in_progress) || 0 },
        { label: "Resolved", val: parseInt(summary.resolved) || 0 },
      ]
    : [];

  const maxRegion = Math.max(...byRegion.map((r) => parseInt(r.total) || 0), 1);

  return (
    <div
      style={{
        height: "calc(100vh - 48px)",
        overflowY: "auto",
        padding: "24px",
      }}
    >
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "24px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "var(--text)",
                marginBottom: "4px",
              }}
            >
              Analytics & Monitoring
            </h1>
            <p style={{ fontSize: "12px", color: "var(--muted)" }}>
              System-wide operational insights
            </p>
          </div>
          <button
            onClick={fetchAll}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: "7px",
              padding: "8px 12px",
              color: "var(--muted)",
              fontSize: "12px",
              cursor: "pointer",
              fontFamily: "var(--font-display)",
            }}
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        {/* Summary stat cards */}
        {summary && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "12px",
              marginBottom: "24px",
            }}
          >
            {[
              {
                label: "Total Incidents",
                val: parseInt(summary.total) || 0,
                color: "var(--text)",
                icon: <Activity size={15} />,
              },
              {
                label: "Resolved",
                val: parseInt(summary.resolved) || 0,
                color: "var(--green)",
                icon: <TrendingUp size={15} />,
              },
              {
                label: "Active",
                val:
                  parseInt(summary.dispatched) +
                    parseInt(summary.in_progress) || 0,
                color: "var(--red)",
                icon: <Clock size={15} />,
              },
              {
                label: "Created",
                val: parseInt(summary.created) || 0,
                color: "var(--amber)",
                icon: <MapPin size={15} />,
              },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: "var(--bg2)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "10px",
                      color: "var(--muted)",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {s.label.toUpperCase()}
                  </span>
                  <span style={{ color: s.color, opacity: 0.6 }}>{s.icon}</span>
                </div>
                <span
                  style={{
                    fontSize: "28px",
                    fontWeight: "700",
                    color: s.color,
                  }}
                >
                  {s.val}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Charts row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginBottom: "16px",
          }}
        >
          {/* Incidents by type */}
          <div
            style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: "14px",
              padding: "18px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: "500",
                color: "var(--text)",
                marginBottom: "16px",
              }}
            >
              Incidents by Type
            </div>
            {incidentTypeData.every((d) => d.val === 0) ? (
              <div
                style={{
                  height: "80px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--muted)",
                  fontSize: "12px",
                }}
              >
                No data yet
              </div>
            ) : (
              <BarChart data={incidentTypeData} colorVar="var(--blue)" />
            )}
          </div>

          {/* Incidents by status */}
          <div
            style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: "14px",
              padding: "18px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: "500",
                color: "var(--text)",
                marginBottom: "16px",
              }}
            >
              Incidents by Status
            </div>
            {statusData.every((d) => d.val === 0) ? (
              <div
                style={{
                  height: "80px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--muted)",
                  fontSize: "12px",
                }}
              >
                No data yet
              </div>
            ) : (
              <BarChart data={statusData} colorVar="var(--amber)" />
            )}
          </div>
        </div>

        {/* Response times */}
        {responseTimes.length > 0 && (
          <div
            style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: "14px",
              padding: "18px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: "500",
                color: "var(--text)",
                marginBottom: "14px",
              }}
            >
              Average Response Times by Incident Type
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {[
                    "Type",
                    "Region",
                    "Total",
                    "Avg Duration",
                    "Min",
                    "Max",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "8px 12px",
                        textAlign: "left",
                        fontSize: "10px",
                        color: "var(--muted)",
                        letterSpacing: "0.06em",
                        fontWeight: "500",
                      }}
                    >
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {responseTimes.map((rt, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom: "1px solid var(--border)",
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--bg3)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <td
                      style={{
                        padding: "10px 12px",
                        fontSize: "12px",
                        color: "var(--text)",
                        textTransform: "capitalize",
                        fontWeight: "500",
                      }}
                    >
                      {rt.incident_type}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontSize: "12px",
                        color: "var(--muted)",
                      }}
                    >
                      {rt.region || "—"}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontSize: "12px",
                        color: "var(--text)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {rt.total_incidents}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontSize: "12px",
                        color: "var(--amber)",
                        fontWeight: "500",
                      }}
                    >
                      {formatDuration(rt.avg_duration_sec)}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontSize: "12px",
                        color: "var(--green)",
                      }}
                    >
                      {formatDuration(rt.min_duration_sec)}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontSize: "12px",
                        color: "var(--red)",
                      }}
                    >
                      {formatDuration(rt.max_duration_sec)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Incidents by region */}
        {byRegion.length > 0 && (
          <div
            style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: "14px",
              padding: "18px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: "500",
                color: "var(--text)",
                marginBottom: "14px",
              }}
            >
              Incidents by Region
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {byRegion.map((r, i) => {
                const total = parseInt(r.total) || 0;
                const pct = (total / maxRegion) * 100;
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        color: "var(--muted2)",
                        minWidth: "140px",
                        textTransform: "capitalize",
                      }}
                    >
                      {r.region}{" "}
                      <span style={{ color: "var(--muted)", fontSize: "10px" }}>
                        ({r.incident_type})
                      </span>
                    </span>
                    <div
                      style={{
                        flex: 1,
                        height: "6px",
                        background: "var(--bg4)",
                        borderRadius: "3px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: "var(--blue)",
                          borderRadius: "3px",
                          transition: "width 0.5s ease",
                        }}
                      />
                    </div>
                    <div
                      style={{ display: "flex", gap: "8px", minWidth: "120px" }}
                    >
                      <span style={{ fontSize: "11px", color: "var(--green)" }}>
                        {r.resolved} resolved
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--red)" }}>
                        {r.active} active
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "500",
                        color: "var(--text)",
                        minWidth: "24px",
                        textAlign: "right",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {total}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Top responders */}
        {topResponders.length > 0 && (
          <div
            style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: "14px",
              padding: "18px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "14px",
              }}
            >
              <Users size={13} color="var(--muted)" />
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "500",
                  color: "var(--text)",
                }}
              >
                Top Responders
              </span>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {topResponders.map((r, i) => {
                const maxDeploy =
                  parseInt(topResponders[0].total_deployments) || 1;
                const pct = (parseInt(r.total_deployments) / maxDeploy) * 100;
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: "700",
                        color: "var(--muted)",
                        minWidth: "20px",
                        textAlign: "center",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      #{i + 1}
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "var(--text)",
                        minWidth: "160px",
                        fontWeight: "500",
                      }}
                    >
                      {r.responder_name}
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        padding: "1px 6px",
                        borderRadius: "3px",
                        background:
                          r.responder_type === "ambulance"
                            ? "var(--green-bg)"
                            : r.responder_type === "police"
                              ? "var(--blue-bg)"
                              : "var(--amber-bg)",
                        color:
                          r.responder_type === "ambulance"
                            ? "var(--green)"
                            : r.responder_type === "police"
                              ? "var(--blue)"
                              : "var(--amber)",
                        border: `1px solid ${r.responder_type === "ambulance" ? "var(--green-border)" : r.responder_type === "police" ? "var(--blue-border)" : "var(--amber-border)"}`,
                        minWidth: "60px",
                        textAlign: "center",
                        textTransform: "capitalize",
                      }}
                    >
                      {r.responder_type}
                    </span>
                    <div
                      style={{
                        flex: 1,
                        height: "5px",
                        background: "var(--bg4)",
                        borderRadius: "3px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: "var(--blue)",
                          borderRadius: "3px",
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "var(--text)",
                        fontFamily: "var(--font-mono)",
                        minWidth: "30px",
                        textAlign: "right",
                      }}
                    >
                      {r.total_deployments}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Resource utilization */}
        {utilization.length > 0 && (
          <div
            style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: "14px",
              padding: "18px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: "500",
                color: "var(--text)",
                marginBottom: "14px",
              }}
            >
              Resource Utilization
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {[
                    "Responder",
                    "Type",
                    "Total Deployments",
                    "Last Active",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "8px 12px",
                        textAlign: "left",
                        fontSize: "10px",
                        color: "var(--muted)",
                        letterSpacing: "0.06em",
                        fontWeight: "500",
                      }}
                    >
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {utilization.map((u, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom: "1px solid var(--border)",
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--bg3)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <td
                      style={{
                        padding: "10px 12px",
                        fontSize: "12px",
                        color: "var(--text)",
                        fontWeight: "500",
                      }}
                    >
                      {u.responder_name}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span
                        style={{
                          fontSize: "10px",
                          padding: "1px 6px",
                          borderRadius: "3px",
                          textTransform: "capitalize",
                          background:
                            u.responder_type === "ambulance"
                              ? "var(--green-bg)"
                              : u.responder_type === "police"
                                ? "var(--blue-bg)"
                                : "var(--amber-bg)",
                          color:
                            u.responder_type === "ambulance"
                              ? "var(--green)"
                              : u.responder_type === "police"
                                ? "var(--blue)"
                                : "var(--amber)",
                          border: `1px solid ${u.responder_type === "ambulance" ? "var(--green-border)" : u.responder_type === "police" ? "var(--blue-border)" : "var(--amber-border)"}`,
                        }}
                      >
                        {u.responder_type}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontSize: "12px",
                        color: "var(--text)",
                        fontFamily: "var(--font-mono)",
                        fontWeight: "600",
                      }}
                    >
                      {u.total_deployments}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontSize: "11px",
                        color: "var(--muted)",
                      }}
                    >
                      {u.last_active
                        ? new Date(u.last_active).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty state */}
        {!summary && byRegion.length === 0 && (
          <div
            style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              padding: "48px",
              textAlign: "center",
              color: "var(--muted)",
              fontSize: "13px",
            }}
          >
            No analytics data yet. Create some incidents to start seeing data
            here.
          </div>
        )}
      </div>
    </div>
  );
}
