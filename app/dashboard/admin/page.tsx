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
} from "lucide-react";
import { api, registerUser } from "@/lib/api";

import type { AuthUser } from "@/lib/api";

const ROLES = [
  { value: "hospital_admin", label: "Hospital Admin" },
  { value: "police_admin", label: "Police Admin" },
  { value: "fire_admin", label: "Fire Admin" },
  { value: "ambulance_driver", label: "Ambulance Driver" },
  { value: "system_admin", label: "System Admin" },
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
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
   "https://emergency-api-gateway-hq5m.onrender.com";


interface User {
  user_id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
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
  });
  const [formLoading, setFormLoading] = useState(false);

  async function fetchUsers() {
    setLoading(true);
    try {
      // Using 'api.get' automatically attaches the token AND uses our retry/wake-up logic!
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
      await registerUser(form.name, form.email, form.password, form.role);
      setSuccess(`${form.name} registered successfully!`);
      setForm({ name: "", email: "", password: "", role: "hospital_admin" });
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register user");
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
  };

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
            User Management
          </h1>
          <p style={{ fontSize: "13px", color: "var(--muted)" }}>
            Register and manage all platform users
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={fetchUsers}
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
            <UserPlus size={12} /> Register User
          </button>
        </div>
      </div>

      {/* Success / Error banners */}
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
            ALL USERS ({users.length})
          </span>
        </div>

        {loading ? (
          <div
            style={{
              padding: "32px",
              textAlign: "center",
              color: "var(--muted)",
              fontSize: "13px",
            }}
          >
            Loading users…
          </div>
        ) : users.length === 0 ? (
          <div
            style={{
              padding: "32px",
              textAlign: "center",
              color: "var(--muted)",
              fontSize: "13px",
            }}
          >
            No users found
          </div>
        ) : (
          <div>
            {/* Table header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 2fr 1.5fr 1fr 1fr",
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

            {/* Rows */}
            {users.map((u) => {
              const rc = ROLE_COLORS[u.role] || ROLE_COLORS.system_admin;
              return (
                <div
                  key={u.user_id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 2fr 1.5fr 1fr 1fr",
                    padding: "12px 16px",
                    borderBottom: "1px solid var(--border)",
                    alignItems: "center",
                    transition: "background 0.12s",
                    opacity: u.is_active ? 1 : 0.5,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--bg3)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: "500",
                      color: "var(--text)",
                    }}
                  >
                    {u.name}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--muted)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
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
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: "10px",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        background: u.is_active
                          ? "var(--green-bg)"
                          : "var(--red-bg)",
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
                      onClick={() => handleDeactivate(u.user_id, u.is_active)}
                      title={u.is_active ? "Deactivate user" : "Activate user"}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "4px 8px",
                        borderRadius: "5px",
                        background: u.is_active
                          ? "var(--red-bg)"
                          : "var(--green-bg)",
                        border: `1px solid ${u.is_active ? "var(--red-border)" : "var(--green-border)"}`,
                        color: u.is_active ? "var(--red)" : "var(--green)",
                        fontSize: "10px",
                        cursor: "pointer",
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      {u.is_active ? (
                        <>
                          <Trash2 size={10} /> Deactivate
                        </>
                      ) : (
                        <>
                          <CheckCircle size={10} /> Activate
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
