"use client";
import { useState, useEffect } from "react";
import {
  UserPlus,
  Users,
  Shield,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Building2,
  Activity,
  MapPin,
  Truck,
  Edit2,
  Flame,
} from "lucide-react";
import { api, registerUser, getHospitalsFull, registerResponder, updateUser, createHospital } from "@/lib/api";

import type { Hospital } from "@/lib/api";

const ROLES = [
  { value: "system_admin", label: "System Admin" },
  { value: "hospital_admin", label: "Hospital Admin" },
  { value: "police_admin", label: "Police Admin" },
  { value: "fire_admin", label: "Fire Admin" },
  { value: "ambulance_driver", label: "Ambulance Driver" },
  { value: "police_driver", label: "Police Driver" },
  { value: "fire_driver", label: "Fire Driver" },
];

const ROLE_COLORS: Record<
  string,
  { bg: string; border: string; text: string }
> = {
  system_admin: {
    bg: "var(--red-bg)",
    border: "var(--red-border)",
    text: "var(--red)",
  },
  hospital_admin: {
    bg: "var(--green-bg)",
    border: "var(--green-border)",
    text: "var(--green)",
  },
  police_admin: {
    bg: "var(--blue-bg)",
    border: "var(--blue-border)",
    text: "var(--blue)",
  },
  fire_admin: {
    bg: "var(--amber-bg)",
    border: "var(--amber-border)",
    text: "var(--amber)",
  },
  ambulance_driver: {
    bg: "var(--green-bg)",
    border: "var(--green-border)",
    text: "var(--green)",
  },
  police_driver: {
    bg: "var(--blue-bg)",
    border: "var(--blue-border)",
    text: "var(--blue)",
  },
  fire_driver: {
    bg: "var(--amber-bg)",
    border: "var(--amber-border)",
    text: "var(--amber)",
  },
};

const INSTITUTION_THEMES: Record<
  string,
  { label: string; icon: any; color: string; bg: string; border: string; unitLabel: string }
> = {
  hospital: {
    label: "Medical Center",
    icon: <Activity size={10} />,
    color: "var(--green)",
    bg: "var(--green-bg)",
    border: "var(--green-border)",
    unitLabel: "AMBULANCES",
  },
  police_station: {
    label: "Police Station",
    icon: <Shield size={10} />,
    color: "var(--blue)",
    bg: "var(--blue-bg)",
    border: "var(--blue-border)",
    unitLabel: "PATROL UNITS",
  },
  fire_station: {
    label: "Fire Station",
    icon: <Flame size={10} />, 
    color: "var(--amber)",
    bg: "var(--amber-bg)",
    border: "var(--amber-border)",
    unitLabel: "FIRE TRUCKS",
  },
};

interface User {
  user_id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  hospital_id?: string;
  created_at: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "hospital_admin",
    hospital_id: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showInstForm, setShowInstForm] = useState(false);
  const [instForm, setInstForm] = useState({
    name: "",
    type: "hospital" as "hospital" | "police_station" | "fire_station",
    latitude: "",
    longitude: "",
    total_beds: "0",
    available_beds: "0",
  });

  const [activeTab, setActiveTab] = useState<"users" | "resources">("users");
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [hospitalsLoading, setHospitalsLoading] = useState(false);

  // Unit registration states
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [selectedHospitalForUnit, setSelectedHospitalForUnit] = useState<Hospital | null>(null);
  const [unitForm, setUnitForm] = useState({
    name: "",
    contact_phone: "",
    region: "",
    latitude: "",
    longitude: "",
  });

  async function fetchHospitals() {
    setHospitalsLoading(true);
    try {
      let data = await getHospitalsFull();
      if (user?.role !== "system_admin" && user?.hospital_id) {
        data = data.filter((h) => h.hospital_id === user.hospital_id);
      }
      setHospitals(data);
    } catch (err) {
      console.error("Failed to fetch hospitals:", err);
    } finally {
      setHospitalsLoading(false);
    }
  }

  async function fetchUsers() {
    setLoading(true);
    try {
      const data: any = await api.get("/api/auth/users");
      if (data.success) setUsers(data.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    setError("");
    setSuccess("");
    try {
      await registerUser(form.name, form.email, form.password, form.role, form.hospital_id || undefined);
      setSuccess(`${form.name} registered successfully!`);
      setForm({ name: "", email: "", password: "", role: "hospital_admin", hospital_id: "" });
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register user");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleRegisterUnit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedHospitalForUnit) return;
    setFormLoading(true);
    setSuccess("");
    setError("");

    try {
      let rType = "ambulance";
      if (selectedHospitalForUnit.type === "police_station") rType = "police_car";
      if (selectedHospitalForUnit.type === "fire_station") rType = "fire_truck";

      await registerResponder({
        name: unitForm.name,
        type: rType,
        latitude: parseFloat(unitForm.latitude),
        longitude: parseFloat(unitForm.longitude),
        hospital_id: selectedHospitalForUnit.hospital_id,
        contact_phone: unitForm.contact_phone,
        region: unitForm.region,
      });

      setSuccess(`Unit registered successfully for ${selectedHospitalForUnit.name}!`);
      setShowUnitForm(false);
      fetchHospitals(); // Refresh to see new unit
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register unit");
    } finally {
      setFormLoading(false);
    }
  }
  async function handleLinkDriver(responderId: string, driverId: string | null) {
    try {
      await updateResponder(responderId, { driver_id: driverId || null });
      setSuccess("Crew assignment updated!");
      fetchHospitals(); // Refresh to see changes
    } catch (err) {
      setError("Failed to link driver.");
    }
  }

  async function handleRegisterInstitution(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    setError("");
    setSuccess("");
    try {
      await createHospital({
        name: instForm.name,
        type: instForm.type,
        latitude: parseFloat(instForm.latitude),
        longitude: parseFloat(instForm.longitude),
        total_beds: parseInt(instForm.total_beds),
        available_beds: parseInt(instForm.available_beds),
      });
      setSuccess(`${instForm.name} registered successfully!`);
      setInstForm({
        name: "",
        type: "hospital",
        latitude: "",
        longitude: "",
        total_beds: "0",
        available_beds: "0",
      });
      setShowInstForm(false);
      fetchHospitals();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register institution");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleUpdateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser) return;
    setFormLoading(true);
    try {
      await updateUser(editingUser.user_id, {
        name: editingUser.name,
        role: editingUser.role,
        hospital_id: editingUser.hospital_id || undefined,
      });
      setSuccess(`${editingUser.name} updated successfully!`);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDeactivate(userId: string, isActive: boolean) {
    try {
      await api.put(`/api/auth/users/${userId}`, { is_active: !isActive });
      fetchUsers();
    } catch (err) {
      console.error("Failed to update user:", err);
    }
  }

  useEffect(() => {
    fetchUsers();
    fetchHospitals();
  }, []);

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
  } as const;

  return (
    <div
      style={{
        height: "calc(100vh - 48px)",
        overflowY: "auto",
        padding: "24px",
      }}
    >
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
            System Administration
          </h1>
          <p style={{ fontSize: "13px", color: "var(--muted)" }}>
            Manage users and platform infrastructure
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => (activeTab === "users" ? fetchUsers() : fetchHospitals())}
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
              if (activeTab === "users") setShowForm(!showForm);
              else setShowInstForm(!showInstForm);
              setError("");
              setSuccess("");
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
            {activeTab === "users" ? (
              <><UserPlus size={12} /> Register User</>
            ) : (
              <><Building2 size={12} /> Register Institution</>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "24px",
          borderBottom: "1px solid var(--border)",
          marginBottom: "24px",
        }}
      >
        {[
          { id: "users", label: "User Management", icon: <Users size={14} /> },
          {
            id: "resources",
            label: "Infrastructure & Resources",
            icon: <Building2 size={14} />,
          },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 4px",
                background: "none",
                border: "none",
                borderBottom: isActive ? "2px solid var(--blue)" : "2px solid transparent",
                color: isActive ? "var(--blue)" : "var(--muted)",
                fontSize: "13px",
                fontWeight: isActive ? "600" : "500",
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: "var(--font-display)",
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "users" ? (
        <div className="animate-fade-in">
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
              <span style={{ fontSize: "13px", color: "var(--red)" }}>{error}</span>
            </div>
          )}

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
                  Register New User
                </span>
              </div>

              <form onSubmit={handleRegister}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                    marginBottom: "12px",
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
                      FULL NAME
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="John Doe"
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
                      EMAIL
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="user@emergency.gh"
                      value={form.email}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, email: e.target.value }))
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
                      PASSWORD
                    </label>
                    <input
                      required
                      type="password"
                      placeholder="Min 6 characters"
                      value={form.password}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, password: e.target.value }))
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
                      ROLE
                    </label>
                    <select
                      value={form.role}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, role: e.target.value }))
                      }
                      style={{ ...inputStyle, cursor: "pointer" }}
                      title="User role"
                    >
                      {ROLES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {form.role !== "system_admin" && (
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
                        ASSIGN INSTITUTION / WORKPLACE
                      </label>
                      <select
                        required={form.role !== "system_admin"}
                        value={form.hospital_id}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, hospital_id: e.target.value }))
                        }
                        style={{ ...inputStyle, cursor: "pointer" }}
                        title="Assigned institution"
                      >
                        <option value="">Select an institution...</option>
                        {hospitals.map((h) => (
                          <option key={h.hospital_id} value={h.hospital_id}>
                            {h.name} ({h.type?.replace("_", " ")})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
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
                    {formLoading ? "Registering…" : "Register User"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "12px",
              marginBottom: "24px",
            }}
          >
            {[
              { label: "Total Users", val: users.length, color: "var(--text)" },
              {
                label: "Active",
                val: users.filter((u) => u.is_active).length,
                color: "var(--green)",
              },
              {
                label: "Inactive",
                val: users.filter((u) => !u.is_active).length,
                color: "var(--red)",
              },
              {
                label: "Admins",
                val: users.filter((u) => u.role === "system_admin").length,
                color: "var(--amber)",
              },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: "var(--bg2)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  padding: "14px 16px",
                }}
              >
                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: "700",
                    color: s.color,
                    marginBottom: "3px",
                  }}
                >
                  {s.val}
                </div>
                <div style={{ fontSize: "11px", color: "var(--muted)" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Users table */}
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
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "14px 16px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <Users size={13} color="var(--muted)" />
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "500",
                  color: "var(--muted)",
                  letterSpacing: "0.06em",
                }}
              >
                PLATFORM USERS ({users.length})
              </span>
            </div>

            {loading ? (
              <div style={{ padding: "32px", textAlign: "center", color: "var(--muted)", fontSize: "13px" }}>
                Loading users…
              </div>
            ) : users.length === 0 ? (
              <div style={{ padding: "32px", textAlign: "center", color: "var(--muted)", fontSize: "13px" }}>
                No users found
              </div>
            ) : (
              <div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 2fr 1.5fr 1fr 1.5fr",
                    padding: "8px 16px",
                    borderBottom: "1px solid var(--border)",
                    background: "var(--bg3)",
                  }}
                >
                  {["NAME", "EMAIL", "ROLE", "STATUS", "ACTIONS"].map((h) => (
                    <span
                      key={h}
                      style={{
                        fontSize: "10px",
                        color: "var(--muted)",
                        letterSpacing: "0.07em",
                        fontWeight: "500",
                      }}
                    >
                      {h}
                    </span>
                  ))}
                </div>

                {users.map((u) => {
                  const rc = ROLE_COLORS[u.role] || ROLE_COLORS.system_admin;
                  return (
                    <div
                      key={u.user_id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 2fr 1.5fr 1fr 1.5fr",
                        padding: "12px 16px",
                        borderBottom: "1px solid var(--border)",
                        alignItems: "center",
                        transition: "background 0.12s",
                        opacity: u.is_active ? 1 : 0.5,
                      }}
                    >
                      <div style={{ fontSize: "13px", fontWeight: "500", color: "var(--text)" }}>
                        {u.name}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                        {u.email}
                      </div>
                      <div>
                        <span
                          style={{
                            fontSize: "10px",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            background: rc.bg,
                            color: rc.text,
                            border: `1px solid ${rc.border}`,
                            fontWeight: "500",
                          }}
                        >
                          {ROLES.find((r) => r.value === u.role)?.label || u.role}
                        </span>
                        {u.hospital_id && hospitals.length > 0 && (
                          <div style={{ fontSize: "10px", color: "var(--muted)", marginTop: "4px" }}>
                            at {hospitals.find(h => h.hospital_id === u.hospital_id)?.name || "Unknown Unit"}
                          </div>
                        )}
                      </div>
                      <div>
                        <span
                          style={{
                            fontSize: "10px",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            background: u.is_active ? "var(--green-bg)" : "var(--red-bg)",
                            color: u.is_active ? "var(--green)" : "var(--red)",
                            border: `1px solid ${u.is_active ? "var(--green-border)" : "var(--red-border)"}`,
                            fontWeight: "500",
                          }}
                        >
                          {u.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          onClick={() => setEditingUser(u)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "4px 8px",
                            borderRadius: "5px",
                            background: "var(--bg3)",
                            border: "1px solid var(--border)",
                            color: "var(--muted)",
                            fontSize: "10px",
                            cursor: "pointer",
                            fontFamily: "var(--font-display)",
                          }}
                        >
                          <Edit2 size={10} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeactivate(u.user_id, u.is_active)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "4px 8px",
                            borderRadius: "5px",
                            background: u.is_active ? "var(--red-bg)" : "var(--green-bg)",
                            border: `1px solid ${u.is_active ? "var(--red-border)" : "var(--green-border)"}`,
                            color: u.is_active ? "var(--red)" : "var(--green)",
                            fontSize: "10px",
                            cursor: "pointer",
                            fontFamily: "var(--font-display)",
                          }}
                        >
                          {u.is_active ? <Trash2 size={10} /> : <CheckCircle size={10} />}
                          {u.is_active ? "Disable" : "Enable"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="animate-fade-in">
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
              <span style={{ fontSize: "13px", color: "var(--green)" }}>{success}</span>
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
              <span style={{ fontSize: "13px", color: "var(--red)" }}>{error}</span>
            </div>
          )}

          {showInstForm && (
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
                <Building2 size={14} color="var(--blue)" />
                <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text)" }}>
                  Register New Institution
                </span>
              </div>

              <form onSubmit={handleRegisterInstitution}>
                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", color: "var(--muted2)", marginBottom: "5px", letterSpacing: "0.04em" }}>NAME</label>
                    <input
                      required
                      placeholder="e.g. Korle Bu Teaching Hospital"
                      value={instForm.name}
                      onChange={(e) => setInstForm(p => ({ ...p, name: e.target.value }))}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", color: "var(--muted2)", marginBottom: "5px", letterSpacing: "0.04em" }}>TYPE</label>
                    <select
                      value={instForm.type}
                      onChange={(e) => setInstForm(p => ({ ...p, type: e.target.value as any }))}
                      style={{ ...inputStyle, cursor: "pointer" }}
                    >
                      <option value="hospital">Hospital</option>
                      <option value="police_station">Police Station</option>
                      <option value="fire_station">Fire Station</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", color: "var(--muted2)", marginBottom: "5px", letterSpacing: "0.04em" }}>LATITUDE</label>
                    <input
                      required
                      type="number"
                      step="any"
                      placeholder="5.55"
                      value={instForm.latitude}
                      onChange={(e) => setInstForm(p => ({ ...p, latitude: e.target.value }))}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", color: "var(--muted2)", marginBottom: "5px", letterSpacing: "0.04em" }}>LONGITUDE</label>
                    <input
                      required
                      type="number"
                      step="any"
                      placeholder="-0.20"
                      value={instForm.longitude}
                      onChange={(e) => setInstForm(p => ({ ...p, longitude: e.target.value }))}
                      style={inputStyle}
                    />
                  </div>
                </div>

                {instForm.type === "hospital" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", color: "var(--muted2)", marginBottom: "5px", letterSpacing: "0.04em" }}>TOTAL BEDS</label>
                      <input
                        type="number"
                        value={instForm.total_beds}
                        onChange={(e) => setInstForm(p => ({ ...p, total_beds: e.target.value }))}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", color: "var(--muted2)", marginBottom: "5px", letterSpacing: "0.04em" }}>AVAILABLE BEDS</label>
                      <input
                        type="number"
                        value={instForm.available_beds}
                        onChange={(e) => setInstForm(p => ({ ...p, available_beds: e.target.value }))}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={() => setShowInstForm(false)}
                    style={{ padding: "8px 16px", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "7px", color: "var(--muted)", fontSize: "12px", cursor: "pointer", fontFamily: "var(--font-display)" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    style={{ padding: "8px 20px", background: "var(--blue)", border: "none", borderRadius: "7px", color: "#fff", fontSize: "12px", fontWeight: "500", cursor: formLoading ? "not-allowed" : "pointer", fontFamily: "var(--font-display)", opacity: formLoading ? 0.7 : 1 }}
                  >
                    {formLoading ? "Registering…" : "Register Institution"}
                  </button>
                </div>
              </form>
            </div>
          )}
          {hospitalsLoading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
              Loading resource data…
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
                gap: "20px",
              }}
            >
              {hospitals.map((h) => {
                const theme = INSTITUTION_THEMES[h.type || "hospital"] || INSTITUTION_THEMES.hospital;
                return (
                  <div
                    key={h.hospital_id}
                    style={{
                      background: "var(--bg2)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      style={{
                        padding: "16px",
                        borderBottom: "1px solid var(--border)",
                        background: "var(--bg3)",
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
                        <h3 style={{ fontSize: "15px", fontWeight: "600", color: "var(--text)" }}>
                          {h.name}
                        </h3>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "3px 8px",
                            borderRadius: "50px",
                            background: theme.bg,
                            border: `1px solid ${theme.border}`,
                            color: theme.color,
                            fontSize: "10px",
                            fontWeight: "600",
                          }}
                        >
                          {theme.icon}
                          {h.type === "hospital" ? `${h.available_beds} / ${h.total_beds} Beds` : theme.label}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          fontSize: "11px",
                          color: "var(--muted)",
                        }}
                      >
                        <MapPin size={11} />
                        {Number(h.latitude).toFixed(4)}, {Number(h.longitude).toFixed(4)}
                      </div>
                    </div>

                    <div style={{ padding: "16px", flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "12px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "10px",
                              fontWeight: "600",
                              color: "var(--muted)",
                              letterSpacing: "0.05em",
                            }}
                          >
                            LINKED {theme.unitLabel} ({h.responders?.length || 0})
                          </div>
                          <button
                            onClick={() => {
                              setSelectedHospitalForUnit(h);
                              setUnitForm({
                                name: "",
                                contact_phone: "",
                                region: h.region || "",
                                latitude: String(h.latitude),
                                longitude: String(h.longitude),
                              });
                              setShowUnitForm(true);
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              background: "none",
                              border: "none",
                              color: theme.color,
                              fontSize: "10px",
                              fontWeight: "600",
                              cursor: "pointer",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              backgroundColor: `${theme.color}15`,
                            }}
                          >
                            <Plus size={10} /> Register {theme.unitLabel.slice(0, -1)}
                          </button>
                        </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {h.responders && h.responders.length > 0 ? (
                          h.responders.map((r) => (
                            <div
                              key={r.responder_id}
                              style={{
                                padding: "10px",
                                background: "var(--bg3)",
                                border: "1px solid var(--border)",
                                borderRadius: "8px",
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
                                <span style={{ fontSize: "13px", fontWeight: "500", color: "var(--text)" }}>
                                  {r.name}
                                </span>
                                <span
                                  style={{
                                    fontSize: "9px",
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                    background: r.is_available ? "var(--green-bg)" : "var(--amber-bg)",
                                    color: r.is_available ? "var(--green)" : "var(--amber)",
                                    border: `1px solid ${r.is_available ? "var(--green-border)" : "var(--amber-border)"}`,
                                    fontWeight: "600",
                                  }}
                                >
                                  {r.is_available ? "AVAILABLE" : "ON MISSION"}
                                </span>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  fontSize: "11px",
                                  color: "var(--muted)",
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                                  <Truck size={10} /> {r.type.replace("_", " ")}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                                  {r.contact_phone}
                                </div>
                              </div>
                              <div 
                                style={{ 
                                  marginTop: "10px", 
                                  paddingTop: "10px", 
                                  borderTop: "1px solid var(--border)",
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "5px"
                                }}
                              >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <label style={{ fontSize: "10px", color: "var(--muted2)", fontWeight: "600" }}>ASSIGNED CREW</label>
                                  {r.driver_id && <CheckCircle size={10} color="var(--green)" />}
                                </div>
                                <select
                                  value={r.driver_id || ""}
                                  onChange={(e) => handleLinkDriver(r.responder_id, e.target.value)}
                                  style={{
                                    width: "100%",
                                    background: "var(--bg2)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "6px",
                                    color: "var(--text)",
                                    fontSize: "11px",
                                    padding: "6px 8px",
                                    outline: "none",
                                    cursor: "pointer"
                                  }}
                                >
                                  <option value="">No Driver Assigned</option>
                                  {users
                                    .filter(u => u.role.toLowerCase().includes("driver") || u.role.toLowerCase().includes("officer") || u.role.toLowerCase().includes("fighter"))
                                    .map(u => (
                                      <option key={u.user_id} value={u.user_id}>
                                        {u.name} ({u.role.replaceAll("_", " ")})
                                      </option>
                                    ))
                                  }
                                </select>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div
                            style={{
                              padding: "20px",
                              textAlign: "center",
                              fontSize: "12px",
                              color: "var(--muted2)",
                              background: "var(--bg3)",
                              border: "1px dashed var(--border)",
                              borderRadius: "8px",
                            }}
                          >
                            No units linked to this {theme.label.toLowerCase()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Unit Registration Modal */}
      {showUnitForm && selectedHospitalForUnit && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "480px",
              padding: "24px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
            }}
          >
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text)", marginBottom: "4px" }}>
                Register New Unit
              </h2>
              <p style={{ fontSize: "12px", color: "var(--muted)" }}>
                Adding to {selectedHospitalForUnit.name}
              </p>
            </div>

            <form onSubmit={handleRegisterUnit}>
              <div style={{ display: "grid", gap: "16px", marginBottom: "24px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "var(--muted2)", marginBottom: "6px", letterSpacing: "0.04em" }}>
                    UNIT NAME / CALLSIGN
                  </label>
                  <input
                    required
                    placeholder="e.g. Ambulance 01"
                    style={inputStyle}
                    value={unitForm.name}
                    onChange={(e) => setUnitForm(p => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "var(--muted2)", marginBottom: "6px", letterSpacing: "0.04em" }}>
                    CONTACT NUMBER / PLATE
                  </label>
                  <input
                    required
                    placeholder="+233..."
                    style={inputStyle}
                    value={unitForm.contact_phone}
                    onChange={(e) => setUnitForm(p => ({ ...p, contact_phone: e.target.value }))}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                   <div>
                    <label style={{ display: "block", fontSize: "11px", color: "var(--muted2)", marginBottom: "6px", letterSpacing: "0.04em" }}>
                      LATITUDE
                    </label>
                    <input
                      required
                      type="number"
                      step="any"
                      style={inputStyle}
                      value={unitForm.latitude}
                      onChange={(e) => setUnitForm(p => ({ ...p, latitude: e.target.value }))}
                    />
                  </div>
                   <div>
                    <label style={{ display: "block", fontSize: "11px", color: "var(--muted2)", marginBottom: "6px", letterSpacing: "0.04em" }}>
                      LONGITUDE
                    </label>
                    <input
                      required
                      type="number"
                      step="any"
                      style={inputStyle}
                      value={unitForm.longitude}
                      onChange={(e) => setUnitForm(p => ({ ...p, longitude: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setShowUnitForm(false)}
                  style={{
                    padding: "10px 20px",
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
                  disabled={formLoading}
                  style={{
                    padding: "10px 24px",
                    background: INSTITUTION_THEMES[selectedHospitalForUnit.type || "hospital"].color,
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: formLoading ? "not-allowed" : "pointer",
                    fontFamily: "var(--font-display)",
                    opacity: formLoading ? 0.7 : 1,
                  }}
                >
                  {formLoading ? "Registering..." : "Confirm Unit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              padding: "24px",
              width: "100%",
              maxWidth: "440px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
            }}
            className="animate-slide-in"
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <Edit2 size={18} color="var(--blue)" />
              <h2 style={{ fontSize: "16px", fontWeight: "600", color: "var(--text)" }}>Edit User Profile</h2>
            </div>

            <form onSubmit={handleUpdateUser}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "var(--muted2)", marginBottom: "6px", letterSpacing: "0.04em" }}>FULL NAME</label>
                  <input
                    required
                    value={editingUser.name}
                    onChange={(e) => setEditingUser(prev => prev ? { ...prev, name: e.target.value } : null)}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "var(--muted2)", marginBottom: "6px", letterSpacing: "0.04em" }}>ROLE</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser(prev => prev ? { ...prev, role: e.target.value } : null)}
                    style={{ ...inputStyle, cursor: "pointer" }}
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                {editingUser.role !== "system_admin" && (
                  <div>
                    <label style={{ display: "block", fontSize: "11px", color: "var(--muted2)", marginBottom: "6px", letterSpacing: "0.04em" }}>ASSIGNED INSTITUTION</label>
                    <select
                      required={editingUser.role !== "system_admin"}
                      value={editingUser.hospital_id || ""}
                      onChange={(e) => setEditingUser(prev => prev ? { ...prev, hospital_id: e.target.value } : null)}
                      style={{ ...inputStyle, cursor: "pointer" }}
                    >
                      <option value="">Select an institution...</option>
                      {hospitals.map((h) => (
                        <option key={h.hospital_id} value={h.hospital_id}>
                          {h.name} ({h.type?.replace("_", " ")})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  style={{
                    padding: "10px 18px",
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
                  disabled={formLoading}
                  style={{
                    padding: "10px 24px",
                    background: "var(--blue)",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: formLoading ? "not-allowed" : "pointer",
                    fontFamily: "var(--font-display)",
                    opacity: formLoading ? 0.7 : 1,
                  }}
                >
                  {formLoading ? "Saving Changes…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
