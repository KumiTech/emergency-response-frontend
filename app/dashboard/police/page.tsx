"use client";
import { useState, useEffect } from "react";
import {
  Plus,
  User,
  Car,
  Shield,
  RefreshCw,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { getResponders, registerResponder, updateResponder } from "@/lib/api";
import type { Responder } from "@/lib/api";

const AVAILABILITY_COLORS = {
  available: {
    bg: "var(--green-bg)",
    border: "var(--green-border)",
    text: "var(--green)",
  },
  unavailable: {
    bg: "var(--red-bg)",
    border: "var(--red-border)",
    text: "var(--red)",
  },
};

export default function PoliceDashboard() {
  const [responders, setResponders] = useState<Responder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    contact_phone: "",
    region: "",
    latitude: "",
    longitude: "",
  });
  const [formLoading, setFormLoading] = useState(false);

  async function fetchData() {
    setLoading(true);
    try {
      const all = await getResponders();
      setResponders(all.filter((r: Responder) => r.type === "police"));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    setError("");
    setSuccess("");
    try {
      await registerResponder({
        name: form.name,
        type: "police",
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        contact_phone: form.contact_phone,
        region: form.region,
      });
      setSuccess(`${form.name} registered successfully!`);
      setForm({
        name: "",
        contact_phone: "",
        region: "",
        latitude: "",
        longitude: "",
      });
      setShowForm(false);
      fetchData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to register responder",
      );
    } finally {
      setFormLoading(false);
    }
  }

  async function handleToggle(responderId: string, isAvailable: boolean) {
    try {
      await updateResponder(responderId, { is_available: !isAvailable });
      fetchData();
    } catch (err) {
      console.error(err);
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

  const available = responders.filter((r) => r.is_available).length;
  const unavailable = responders.filter((r) => !r.is_available).length;

  if (loading)
    return (
      <div style={{ padding: "40px", color: "var(--muted)", fontSize: "13px" }}>
        Loading…
      </div>
    );

  return (
    <div
      style={{
        height: "calc(100vh - 48px)",
        overflowY: "auto",
        padding: "24px",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
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
              Police Station Management
            </h1>
            <p style={{ fontSize: "12px", color: "var(--muted)" }}>
              Manage police responder units and availability
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={fetchData}
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
            <button
              onClick={() => {
                setShowForm(!showForm);
                setError("");
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                background: "var(--blue)",
                border: "none",
                borderRadius: "7px",
                padding: "8px 14px",
                color: "#fff",
                fontSize: "12px",
                fontWeight: "500",
                cursor: "pointer",
                fontFamily: "var(--font-display)",
              }}
            >
              <Plus size={12} /> Register Unit
            </button>
          </div>
        </div>

        {/* Banners */}
        {success && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "var(--green-bg)",
              border: "1px solid var(--green-border)",
              borderRadius: "8px",
              padding: "10px 14px",
              marginBottom: "16px",
            }}
          >
            <CheckCircle size={14} color="var(--green)" />
            <span style={{ fontSize: "13px", color: "var(--green)" }}>
              {success}
            </span>
          </div>
        )}
        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "var(--red-bg)",
              border: "1px solid var(--red-border)",
              borderRadius: "8px",
              padding: "10px 14px",
              marginBottom: "16px",
            }}
          >
            <XCircle size={14} color="var(--red)" />
            <span style={{ fontSize: "13px", color: "var(--red)" }}>
              {error}
            </span>
          </div>
        )}

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          {[
            {
              label: "Total Units",
              val: responders.length,
              color: "var(--text)",
              icon: <Shield size={16} />,
            },
            {
              label: "Available",
              val: available,
              color: "var(--green)",
              icon: <Car size={16} />,
            },
            {
              label: "Unavailable",
              val: unavailable,
              color: "var(--red)",
              icon: <User size={16} />,
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
                  marginBottom: "8px",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    color: "var(--muted)",
                    letterSpacing: "0.04em",
                  }}
                >
                  {s.label.toUpperCase()}
                </span>
                <span style={{ color: s.color, opacity: 0.7 }}>{s.icon}</span>
              </div>
              <span
                style={{ fontSize: "28px", fontWeight: "700", color: s.color }}
              >
                {s.val}
              </span>
            </div>
          ))}
        </div>

        {/* Register form */}
        {showForm && (
          <div
            style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "24px",
            }}
            className="animate-slide-in"
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "16px",
              }}
            >
              <Shield size={14} color="var(--blue)" />
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "var(--text)",
                }}
              >
                Register Police Unit
              </span>
            </div>
            <form onSubmit={handleRegister}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "12px",
                  marginBottom: "12px",
                }}
              >
                <div style={{ gridColumn: "1 / -1" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      color: "var(--muted2)",
                      marginBottom: "5px",
                      letterSpacing: "0.04em",
                    }}
                  >
                    UNIT NAME
                  </label>
                  <input
                    required
                    placeholder="e.g. Accra Central Police Station"
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      color: "var(--muted2)",
                      marginBottom: "5px",
                      letterSpacing: "0.04em",
                    }}
                  >
                    CONTACT PHONE
                  </label>
                  <input
                    placeholder="0302123456"
                    title="Contact phone"
                    value={form.contact_phone}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, contact_phone: e.target.value }))
                    }
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      color: "var(--muted2)",
                      marginBottom: "5px",
                      letterSpacing: "0.04em",
                    }}
                  >
                    REGION
                  </label>
                  <input
                    placeholder="Greater Accra"
                    title="Region"
                    value={form.region}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, region: e.target.value }))
                    }
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      color: "var(--muted2)",
                      marginBottom: "5px",
                      letterSpacing: "0.04em",
                    }}
                  >
                    LATITUDE
                  </label>
                  <input
                    required
                    type="number"
                    step="any"
                    placeholder="5.5500"
                    title="Latitude"
                    value={form.latitude}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, latitude: e.target.value }))
                    }
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      color: "var(--muted2)",
                      marginBottom: "5px",
                      letterSpacing: "0.04em",
                    }}
                  >
                    LONGITUDE
                  </label>
                  <input
                    required
                    type="number"
                    step="any"
                    placeholder="-0.2000"
                    title="Longitude"
                    value={form.longitude}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, longitude: e.target.value }))
                    }
                    style={inputStyle}
                  />
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setError("");
                  }}
                  style={{
                    padding: "8px 16px",
                    background: "var(--bg3)",
                    border: "1px solid var(--border)",
                    borderRadius: "7px",
                    color: "var(--muted)",
                    fontSize: "12px",
                    cursor: "pointer",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  style={{
                    padding: "8px 20px",
                    background: "var(--blue)",
                    border: "none",
                    borderRadius: "7px",
                    color: "#fff",
                    fontSize: "12px",
                    fontWeight: "500",
                    cursor: formLoading ? "not-allowed" : "pointer",
                    fontFamily: "var(--font-display)",
                    opacity: formLoading ? 0.7 : 1,
                  }}
                >
                  {formLoading ? "Registering…" : "Register Unit"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Responders table */}
        <div
          style={{
            background: "var(--bg2)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "14px 18px",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                fontWeight: "500",
                color: "var(--muted)",
                letterSpacing: "0.06em",
              }}
            >
              POLICE UNITS ({responders.length})
            </span>
          </div>

          {responders.length === 0 ? (
            <div
              style={{
                padding: "32px",
                textAlign: "center",
                color: "var(--muted)",
                fontSize: "12px",
              }}
            >
              No police units registered yet. Click &quot;Register Unit&quot; to
              add one.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid var(--border)",
                    background: "var(--bg3)",
                  }}
                >
                  {[
                    "Unit Name",
                    "Region",
                    "Contact",
                    "Location",
                    "Status",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "9px 18px",
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
                {responders.map((r) => {
                  const c = r.is_available
                    ? AVAILABILITY_COLORS.available
                    : AVAILABILITY_COLORS.unavailable;
                  return (
                    <tr
                      key={r.responder_id}
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
                      <td style={{ padding: "11px 18px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <div
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "50%",
                              background: "var(--blue-bg)",
                              border: "1px solid var(--blue-border)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Shield size={12} color="var(--blue)" />
                          </div>
                          <span
                            style={{
                              fontSize: "12px",
                              color: "var(--text)",
                              fontWeight: "500",
                            }}
                          >
                            {r.name}
                          </span>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "11px 18px",
                          fontSize: "12px",
                          color: "var(--muted)",
                        }}
                      >
                        {r.region || "—"}
                      </td>
                      <td
                        style={{
                          padding: "11px 18px",
                          fontSize: "12px",
                          color: "var(--muted)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {r.contact_phone || "—"}
                      </td>
                      <td
                        style={{
                          padding: "11px 18px",
                          fontSize: "11px",
                          color: "var(--muted)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {Number(r.latitude).toFixed(4)},{" "}
                        {Number(r.longitude).toFixed(4)}
                      </td>
                      <td style={{ padding: "11px 18px" }}>
                        <span
                          style={{
                            fontSize: "11px",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontWeight: "500",
                            background: c.bg,
                            color: c.text,
                            border: `1px solid ${c.border}`,
                          }}
                        >
                          {r.is_available ? "Available" : "Unavailable"}
                        </span>
                      </td>
                      <td style={{ padding: "11px 18px" }}>
                        <button
                          onClick={() =>
                            handleToggle(r.responder_id, r.is_available)
                          }
                          style={{
                            fontSize: "11px",
                            padding: "3px 8px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontFamily: "var(--font-display)",
                            background: r.is_available
                              ? "var(--red-bg)"
                              : "var(--green-bg)",
                            border: `1px solid ${r.is_available ? "var(--red-border)" : "var(--green-border)"}`,
                            color: r.is_available
                              ? "var(--red)"
                              : "var(--green)",
                          }}
                        >
                          {r.is_available
                            ? "Mark Unavailable"
                            : "Mark Available"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
