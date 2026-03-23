"use client";
import { useState, useEffect } from "react";
import {
  Bed,
  Activity,
  Truck,
  Plus,
  RefreshCw,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  getHospitals,
  createHospital,
  updateHospitalCapacity,
  getResponders,
  registerResponder,
  updateResponder,
} from "@/lib/api";
import type { Hospital, Responder } from "@/lib/api";

const VEHICLE_STATUS_COLORS: Record<
  string,
  { bg: string; border: string; text: string }
> = {
  idle: {
    bg: "var(--green-bg)",
    border: "var(--green-border)",
    text: "var(--green)",
  },
  dispatched: {
    bg: "var(--red-bg)",
    border: "var(--red-border)",
    text: "var(--red)",
  },
  en_route: {
    bg: "var(--blue-bg)",
    border: "var(--blue-border)",
    text: "var(--blue)",
  },
  on_scene: {
    bg: "var(--amber-bg)",
    border: "var(--amber-border)",
    text: "var(--amber)",
  },
  returning: {
    bg: "var(--blue-bg)",
    border: "var(--blue-border)",
    text: "var(--blue)",
  },
};

function CapacityBar({
  val,
  total,
  color,
}: {
  val: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? (val / total) * 100 : 0;
  return (
    <div style={{ marginTop: "6px" }}>
      <div
        style={{
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
            background: color,
            borderRadius: "3px",
            transition: "width 0.4s",
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "4px",
        }}
      >
        <span style={{ fontSize: "10px", color: "var(--muted)" }}>
          {val} available
        </span>
        <span style={{ fontSize: "10px", color: "var(--muted)" }}>
          {total} total
        </span>
      </div>
    </div>
  );
}

export default function HospitalDashboard() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [responders, setResponders] = useState<Responder[]>([]);
  const [selected, setSelected] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewHosp, setShowNewHosp] = useState(false);
  const [showNewAmb, setShowNewAmb] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [hospForm, setHospForm] = useState({
    name: "",
    latitude: "",
    longitude: "",
    total_beds: "",
    available_beds: "",
  });

  const [ambForm, setAmbForm] = useState({
    name: "",
    contact_phone: "",
    region: "",
    latitude: "",
    longitude: "",
  });

  const [capacityEdit, setCapacityEdit] = useState<{
    total: string;
    available: string;
  } | null>(null);
  const [capLoading, setCapLoading] = useState(false);

  async function fetchData() {
    setLoading(true);
    try {
      const [h, r] = await Promise.all([getHospitals(), getResponders()]);
      setHospitals(h);
      setResponders(r.filter((r: Responder) => r.type === "ambulance"));
      if (h.length > 0 && !selected) setSelected(h[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleCreateHospital(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await createHospital({
        name: hospForm.name,
        latitude: parseFloat(hospForm.latitude),
        longitude: parseFloat(hospForm.longitude),
        total_beds: parseInt(hospForm.total_beds),
        available_beds: parseInt(hospForm.available_beds),
      });
      setSuccess("Hospital created successfully!");
      setShowNewHosp(false);
      setHospForm({
        name: "",
        latitude: "",
        longitude: "",
        total_beds: "",
        available_beds: "",
      });
      fetchData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create hospital",
      );
    }
  }

  async function handleRegisterAmbulance(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!selected) return;
    try {
      await registerResponder({
        name: ambForm.name,
        type: "ambulance",
        latitude: parseFloat(ambForm.latitude),
        longitude: parseFloat(ambForm.longitude),
        hospital_id: selected.hospital_id,
        contact_phone: ambForm.contact_phone,
        region: ambForm.region,
      });
      setSuccess("Ambulance registered successfully!");
      setShowNewAmb(false);
      setAmbForm({
        name: "",
        contact_phone: "",
        region: "",
        latitude: "",
        longitude: "",
      });
      fetchData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to register ambulance",
      );
    }
  }

  async function handleUpdateCapacity() {
    if (!selected || !capacityEdit) return;
    setCapLoading(true);
    setError("");
    try {
      await updateHospitalCapacity(
        selected.hospital_id,
        parseInt(capacityEdit.total),
        parseInt(capacityEdit.available),
      );
      setSuccess("Bed capacity updated!");
      setCapacityEdit(null);
      fetchData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update capacity",
      );
    } finally {
      setCapLoading(false);
    }
  }

  async function handleToggleAmbulance(
    responderId: string,
    isAvailable: boolean,
  ) {
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

  const selectedAmbulances = selected
    ? responders.filter((r) => r.hospital_id === selected.hospital_id)
    : [];

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
              Hospital Management
            </h1>
            <p style={{ fontSize: "12px", color: "var(--muted)" }}>
              Manage hospital capacity and ambulance fleet
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
                setShowNewHosp(!showNewHosp);
                setError("");
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                background: "var(--green)",
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
              <Plus size={12} /> New Hospital
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

        {/* New Hospital Form */}
        {showNewHosp && (
          <div
            style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "20px",
            }}
            className="animate-slide-in"
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "var(--text)",
                marginBottom: "14px",
              }}
            >
              Register New Hospital
            </div>
            <form onSubmit={handleCreateHospital}>
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
                    HOSPITAL NAME
                  </label>
                  <input
                    required
                    placeholder="e.g. Korle Bu Teaching Hospital"
                    value={hospForm.name}
                    onChange={(e) =>
                      setHospForm((p) => ({ ...p, name: e.target.value }))
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
                    placeholder="5.5364"
                    value={hospForm.latitude}
                    onChange={(e) =>
                      setHospForm((p) => ({ ...p, latitude: e.target.value }))
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
                    placeholder="-0.2273"
                    value={hospForm.longitude}
                    onChange={(e) =>
                      setHospForm((p) => ({ ...p, longitude: e.target.value }))
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
                    TOTAL BEDS
                  </label>
                  <input
                    required
                    type="number"
                    placeholder="200"
                    value={hospForm.total_beds}
                    onChange={(e) =>
                      setHospForm((p) => ({ ...p, total_beds: e.target.value }))
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
                    AVAILABLE BEDS
                  </label>
                  <input
                    required
                    type="number"
                    placeholder="50"
                    value={hospForm.available_beds}
                    onChange={(e) =>
                      setHospForm((p) => ({
                        ...p,
                        available_beds: e.target.value,
                      }))
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
                  onClick={() => setShowNewHosp(false)}
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
                  style={{
                    padding: "8px 20px",
                    background: "var(--green)",
                    border: "none",
                    borderRadius: "7px",
                    color: "#fff",
                    fontSize: "12px",
                    fontWeight: "500",
                    cursor: "pointer",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  Create Hospital
                </button>
              </div>
            </form>
          </div>
        )}

        {hospitals.length === 0 ? (
          <div
            style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              padding: "40px",
              textAlign: "center",
              color: "var(--muted)",
              fontSize: "13px",
            }}
          >
            No hospitals registered yet. Click &quot;New Hospital&quot; to add
            one.
          </div>
        ) : (
          <>
            {/* Hospital selector */}
            {hospitals.length > 1 && (
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginBottom: "20px",
                  flexWrap: "wrap",
                }}
              >
                {hospitals.map((h) => (
                  <button
                    key={h.hospital_id}
                    onClick={() => setSelected(h)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontFamily: "var(--font-display)",
                      background:
                        selected?.hospital_id === h.hospital_id
                          ? "var(--green-bg)"
                          : "var(--bg2)",
                      border: `1px solid ${selected?.hospital_id === h.hospital_id ? "var(--green-border)" : "var(--border)"}`,
                      color:
                        selected?.hospital_id === h.hospital_id
                          ? "var(--green)"
                          : "var(--muted)",
                      fontWeight:
                        selected?.hospital_id === h.hospital_id ? "500" : "400",
                    }}
                  >
                    {h.name}
                  </button>
                ))}
              </div>
            )}

            {selected && (
              <>
                {/* Stat cards */}
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
                      label: "Available Beds",
                      val: selected.available_beds,
                      total: selected.total_beds,
                      color: "var(--green)",
                      icon: <Bed size={16} />,
                    },
                    {
                      label: "Occupied Beds",
                      val: selected.total_beds - selected.available_beds,
                      total: selected.total_beds,
                      color: "var(--red)",
                      icon: <Activity size={16} />,
                    },
                    {
                      label: "Ambulance Units",
                      val: selectedAmbulances.filter((a) => a.is_available)
                        .length,
                      total: selectedAmbulances.length,
                      color: "var(--blue)",
                      icon: <Truck size={16} />,
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
                          alignItems: "flex-start",
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
                        <span style={{ color: s.color, opacity: 0.7 }}>
                          {s.icon}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "26px",
                          fontWeight: "700",
                          color: s.color,
                        }}
                      >
                        {s.val}
                      </div>
                      <CapacityBar
                        val={s.val}
                        total={s.total}
                        color={s.color}
                      />
                    </div>
                  ))}
                </div>

                {/* Bed capacity update */}
                <div
                  style={{
                    background: "var(--bg2)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    padding: "18px",
                    marginBottom: "24px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "14px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: "500",
                        color: "var(--text)",
                      }}
                    >
                      Update Bed Capacity
                    </span>
                    {capacityEdit ? (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => setCapacityEdit(null)}
                          style={{
                            padding: "6px 12px",
                            background: "var(--bg3)",
                            border: "1px solid var(--border)",
                            borderRadius: "6px",
                            color: "var(--muted)",
                            fontSize: "11px",
                            cursor: "pointer",
                            fontFamily: "var(--font-display)",
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleUpdateCapacity}
                          disabled={capLoading}
                          style={{
                            padding: "6px 12px",
                            background: "var(--green)",
                            border: "none",
                            borderRadius: "6px",
                            color: "#fff",
                            fontSize: "11px",
                            cursor: "pointer",
                            fontFamily: "var(--font-display)",
                            fontWeight: "500",
                          }}
                        >
                          {capLoading ? "Saving…" : "Save"}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() =>
                          setCapacityEdit({
                            total: String(selected.total_beds),
                            available: String(selected.available_beds),
                          })
                        }
                        style={{
                          padding: "6px 12px",
                          background: "var(--bg3)",
                          border: "1px solid var(--border)",
                          borderRadius: "6px",
                          color: "var(--muted)",
                          fontSize: "11px",
                          cursor: "pointer",
                          fontFamily: "var(--font-display)",
                        }}
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  {capacityEdit ? (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "12px",
                      }}
                    >
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
                          TOTAL BEDS
                        </label>
                        <input
                          type="number"
                          title="Total beds"
                          placeholder="Enter total beds"
                          value={capacityEdit.total}
                          onChange={(e) =>
                            setCapacityEdit((p) =>
                              p ? { ...p, total: e.target.value } : p,
                            )
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
                          AVAILABLE BEDS
                        </label>
                        <input
                          type="number"
                          title="Available beds"
                          placeholder="Enter available beds"
                          value={capacityEdit.available}
                          onChange={(e) =>
                            setCapacityEdit((p) =>
                              p ? { ...p, available: e.target.value } : p,
                            )
                          }
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "12px",
                      }}
                    >
                      {[
                        {
                          label: "Total Beds",
                          val: selected.total_beds,
                          color: "var(--text)",
                        },
                        {
                          label: "Available Beds",
                          val: selected.available_beds,
                          color: "var(--green)",
                        },
                      ].map((f) => (
                        <div
                          key={f.label}
                          style={{
                            background: "var(--bg3)",
                            borderRadius: "8px",
                            padding: "12px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "11px",
                              color: "var(--muted)",
                              marginBottom: "4px",
                            }}
                          >
                            {f.label}
                          </div>
                          <div
                            style={{
                              fontSize: "22px",
                              fontWeight: "700",
                              color: f.color,
                            }}
                          >
                            {f.val}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Ambulance fleet */}
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
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: "500",
                        color: "var(--text)",
                      }}
                    >
                      Ambulance Fleet ({selectedAmbulances.length})
                    </span>
                    <button
                      onClick={() => {
                        setShowNewAmb(!showNewAmb);
                        setError("");
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        background: "var(--green-bg)",
                        border: "1px solid var(--green-border)",
                        borderRadius: "6px",
                        padding: "5px 10px",
                        color: "var(--green)",
                        fontSize: "11px",
                        cursor: "pointer",
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      <Plus size={11} /> Register Ambulance
                    </button>
                  </div>

                  {showNewAmb && (
                    <div
                      style={{
                        padding: "14px 18px",
                        borderBottom: "1px solid var(--border)",
                        background: "var(--bg3)",
                      }}
                      className="animate-slide-in"
                    >
                      <form onSubmit={handleRegisterAmbulance}>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr",
                            gap: "10px",
                            marginBottom: "10px",
                          }}
                        >
                          <div>
                            <label
                              style={{
                                display: "block",
                                fontSize: "10px",
                                color: "var(--muted)",
                                marginBottom: "4px",
                              }}
                            >
                              UNIT NAME
                            </label>
                            <input
                              required
                              placeholder="e.g. Korle Bu Ambulance 1"
                              value={ambForm.name}
                              onChange={(e) =>
                                setAmbForm((p) => ({
                                  ...p,
                                  name: e.target.value,
                                }))
                              }
                              style={inputStyle}
                            />
                          </div>
                          <div>
                            <label
                              style={{
                                display: "block",
                                fontSize: "10px",
                                color: "var(--muted)",
                                marginBottom: "4px",
                              }}
                            >
                              CONTACT PHONE
                            </label>
                            <input
                              placeholder="0302123456"
                              value={ambForm.contact_phone}
                              onChange={(e) =>
                                setAmbForm((p) => ({
                                  ...p,
                                  contact_phone: e.target.value,
                                }))
                              }
                              style={inputStyle}
                            />
                          </div>
                          <div>
                            <label
                              style={{
                                display: "block",
                                fontSize: "10px",
                                color: "var(--muted)",
                                marginBottom: "4px",
                              }}
                            >
                              REGION
                            </label>
                            <input
                              placeholder="Greater Accra"
                              value={ambForm.region}
                              onChange={(e) =>
                                setAmbForm((p) => ({
                                  ...p,
                                  region: e.target.value,
                                }))
                              }
                              style={inputStyle}
                            />
                          </div>
                          <div>
                            <label
                              style={{
                                display: "block",
                                fontSize: "10px",
                                color: "var(--muted)",
                                marginBottom: "4px",
                              }}
                            >
                              LATITUDE
                            </label>
                            <input
                              required
                              type="number"
                              step="any"
                              placeholder="5.5364"
                              value={ambForm.latitude}
                              onChange={(e) =>
                                setAmbForm((p) => ({
                                  ...p,
                                  latitude: e.target.value,
                                }))
                              }
                              style={inputStyle}
                            />
                          </div>
                          <div>
                            <label
                              style={{
                                display: "block",
                                fontSize: "10px",
                                color: "var(--muted)",
                                marginBottom: "4px",
                              }}
                            >
                              LONGITUDE
                            </label>
                            <input
                              required
                              type="number"
                              step="any"
                              placeholder="-0.2273"
                              value={ambForm.longitude}
                              onChange={(e) =>
                                setAmbForm((p) => ({
                                  ...p,
                                  longitude: e.target.value,
                                }))
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
                            onClick={() => setShowNewAmb(false)}
                            style={{
                              padding: "7px 14px",
                              background: "var(--bg4)",
                              border: "1px solid var(--border)",
                              borderRadius: "6px",
                              color: "var(--muted)",
                              fontSize: "11px",
                              cursor: "pointer",
                              fontFamily: "var(--font-display)",
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            style={{
                              padding: "7px 14px",
                              background: "var(--green)",
                              border: "none",
                              borderRadius: "6px",
                              color: "#fff",
                              fontSize: "11px",
                              fontWeight: "500",
                              cursor: "pointer",
                              fontFamily: "var(--font-display)",
                            }}
                          >
                            Register
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {selectedAmbulances.length === 0 ? (
                    <div
                      style={{
                        padding: "24px",
                        textAlign: "center",
                        color: "var(--muted)",
                        fontSize: "12px",
                      }}
                    >
                      No ambulances registered for this hospital yet
                    </div>
                  ) : (
                    <table
                      style={{ width: "100%", borderCollapse: "collapse" }}
                    >
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
                            "Availability",
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
                        {selectedAmbulances.map((amb) => (
                          <tr
                            key={amb.responder_id}
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
                                padding: "11px 18px",
                                fontSize: "12px",
                                color: "var(--text)",
                                fontWeight: "500",
                              }}
                            >
                              {amb.name}
                            </td>
                            <td
                              style={{
                                padding: "11px 18px",
                                fontSize: "12px",
                                color: "var(--muted)",
                              }}
                            >
                              {amb.region || "—"}
                            </td>
                            <td
                              style={{
                                padding: "11px 18px",
                                fontSize: "12px",
                                color: "var(--muted)",
                                fontFamily: "var(--font-mono)",
                              }}
                            >
                              {amb.contact_phone || "—"}
                            </td>
                            <td style={{ padding: "11px 18px" }}>
                              <span
                                style={{
                                  fontSize: "11px",
                                  padding: "2px 8px",
                                  borderRadius: "4px",
                                  fontWeight: "500",
                                  background: amb.is_available
                                    ? "var(--green-bg)"
                                    : "var(--red-bg)",
                                  color: amb.is_available
                                    ? "var(--green)"
                                    : "var(--red)",
                                  border: `1px solid ${amb.is_available ? "var(--green-border)" : "var(--red-border)"}`,
                                }}
                              >
                                {amb.is_available ? "Available" : "Unavailable"}
                              </span>
                            </td>
                            <td style={{ padding: "11px 18px" }}>
                              <button
                                onClick={() =>
                                  handleToggleAmbulance(
                                    amb.responder_id,
                                    amb.is_available,
                                  )
                                }
                                style={{
                                  fontSize: "11px",
                                  padding: "3px 8px",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  fontFamily: "var(--font-display)",
                                  background: amb.is_available
                                    ? "var(--red-bg)"
                                    : "var(--green-bg)",
                                  border: `1px solid ${amb.is_available ? "var(--red-border)" : "var(--green-border)"}`,
                                  color: amb.is_available
                                    ? "var(--red)"
                                    : "var(--green)",
                                }}
                              >
                                {amb.is_available
                                  ? "Mark Unavailable"
                                  : "Mark Available"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
