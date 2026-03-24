"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import {
  Shield,
  AlertTriangle,
  Eye,
  EyeOff,
  Check,
  Sun,
  Moon,
} from "lucide-react";

const DEMO_CREDENTIALS = [
  { label: "System Admin", role: "system_admin" },
  { label: "Hospital Admin", role: "hospital_admin" },
  { label: "Police Admin", role: "police_admin" },
  { label: "Fire Admin", role: "fire_admin" },
];








export default function LoginPage() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch {
      setError("Invalid credentials.");
    } finally {
      setLoading(false);
    }
  }


  return (
    <>
      <style>{`
        * { box-sizing: border-box; }

        .login-root {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: var(--bg);
          overflow: hidden;
        }

        .login-left {
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          padding: 32px 52px;
          position: relative;
          z-index: 2;
          border-right: 1px solid var(--border);
          overflow-y: auto;
        }

        .login-right {
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 32px 48px;
        }

        @keyframes orbit-cw {
          from { transform: rotate(0deg) translateX(130px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(130px) rotate(-360deg); }
        }
        @keyframes orbit-ccw {
          from { transform: rotate(0deg) translateX(190px) rotate(0deg); }
          to   { transform: rotate(-360deg) translateX(190px) rotate(360deg); }
        }
        @keyframes orbit-cw2 {
          from { transform: rotate(180deg) translateX(255px) rotate(-180deg); }
          to   { transform: rotate(540deg) translateX(255px) rotate(-540deg); }
        }
        @keyframes center-pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(226,75,74,0.3), 0 0 30px rgba(226,75,74,0.1); }
          50%      { box-shadow: 0 0 0 24px rgba(226,75,74,0.0), 0 0 60px rgba(226,75,74,0.15); }
        }
          @keyframes center-pulse-purple {
  0%,100% { box-shadow: 0 0 0 0 rgba(168,85,247,0.4), 0 0 30px rgba(168,85,247,0.1); }
  50%      { box-shadow: 0 0 0 24px rgba(168,85,247,0.0), 0 0 60px rgba(168,85,247,0.2); }
}
        @keyframes icon-pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(226,75,74,0.4); }
          50%      { box-shadow: 0 0 0 8px rgba(226,75,74,0.0); }
        }
          @keyframes icon-pulse-purple {
  0%,100% { box-shadow: 0 0 0 0 rgba(168,85,247,0.5); }
  50%      { box-shadow: 0 0 0 10px rgba(168,85,247,0.0); }
}
        @keyframes float-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-slow {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .orbit-wrap {
          position: absolute;
          top: 50%;
          left: 55%;
          transform: translate(-50%, -50%);
          width: 560px;
          height: 560px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fade-in-slow 1.5s ease both;
        }

        .orbit-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.04);
        }

        .orbit-icon {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }

        .hero-content {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 32px 48px;
          z-index: 3;
        }

        .hero-glass {
          background: rgba(18, 21, 31, 0.55);
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
          border-radius: 20px;
          padding: 28px 32px;
          border: 1px solid rgba(255,255,255,0.06);
          max-width: 360px;
          animation: float-in 0.8s 0.3s ease both;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(226,75,74,0.12);
          border: 1px solid rgba(226,75,74,0.25);
          border-radius: 20px;
          padding: 4px 12px;
          font-size: 10px;
          color: var(--red);
          font-weight: 600;
          letter-spacing: 0.06em;
          margin-bottom: 16px;
        }

        .hero-title {
          font-size: 34px;
          font-weight: 700;
          color: var(--text);
          line-height: 1.12;
          letter-spacing: -0.03em;
          margin-bottom: 12px;
        }

        .hero-title span { color: var(--red); }

        .hero-subtitle {
          font-size: 12px;
          color: var(--muted);
          line-height: 1.7;
        }

        .hero-stats {
          display: flex;
          gap: 0;
          animation: float-in 0.8s 0.5s ease both;
        }

        .hero-stat {
          padding: 12px 18px;
          background: rgba(18, 21, 31, 0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.06);
          text-align: center;
        }

        .hero-stat:first-child { border-radius: 10px 0 0 10px; }
        .hero-stat:last-child  { border-radius: 0 10px 10px 0; border-left: none; }
        .hero-stat:not(:first-child):not(:last-child) { border-left: none; }

        .hero-stat-val {
          font-size: 16px;
          font-weight: 700;
          color: var(--text);
          line-height: 1;
          margin-bottom: 3px;
        }

        .hero-stat-label {
          font-size: 9px;
          color: var(--muted);
          letter-spacing: 0.04em;
        }

        .login-input {
          width: 100%;
          padding: 10px 14px;
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text);
          font-size: 13px;
          outline: none;
          font-family: var(--font-display);
          transition: border-color 0.15s;
        }
        .login-input:focus { border-color: var(--blue-border); }

        .demo-btn {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-radius: 7px;
          padding: 8px 10px;
          cursor: pointer;
          transition: all 0.15s;
          width: 100%;
          text-align: left;
        }

        .submit-btn {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 8px;
          color: #fff;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          font-family: var(--font-display);
          transition: all 0.15s;
          background: var(--blue);
        }
        .submit-btn:disabled {
          background: var(--bg4);
          cursor: not-allowed;
          opacity: 0.7;
        }

        .theme-toggle {
          position: fixed;
          top: 16px;
          right: 16px;
          z-index: 100;
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 8px;
          cursor: pointer;
          color: var(--muted);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }

        .theme-toggle:hover {
          border-color: var(--border2);
          color: var(--text);
        }

        @media (max-width: 768px) {
          .login-root { grid-template-columns: 1fr; }
          .login-right { display: none; }
          .login-left { padding: 24px; border-right: none; }
        }
      `}</style>

      <div className="login-root">
        {/* Theme toggle — fixed top right */}
        <button
          onClick={toggleTheme}
          className="theme-toggle"
          aria-label="Toggle theme"
          title={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
        >
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* ── LEFT — Form ── */}
        <div className="login-left">
          <div style={{ width: "100%", maxWidth: "400px", margin: "0 auto" }}>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: "700",
                color: theme === "dark" ? "var(--text)" : "#1e1440",
                marginBottom: "4px",
              }}
            >
              Sign in
            </h2>
            <p
              style={{
                fontSize: "13px",
                color: theme === "dark" ? "var(--muted)" : "#6b7090",
                marginBottom: "20px",
              }}
            >
              Access the emergency coordination platform
            </p>

            {/* Demo accounts */}
            <div
              style={{
                background:
                  theme === "dark" ? "var(--bg2)" : "rgba(124,58,237,0.06)",
                border: `1px solid ${theme === "dark" ? "var(--border)" : "rgba(124,58,237,0.18)"}`,
                borderRadius: "12px",
                padding: "12px",
                marginBottom: "16px",
              }}
            >
              <p
                style={{
                  fontSize: "10px",
                  color:
                    theme === "dark" ? "var(--muted)" : "rgba(124,58,237,0.7)",
                  marginBottom: "8px",
                  letterSpacing: "0.06em",
                }}
              >
                SELECT ACCOUNT TYPE — then enter your credentials below
              </p>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                {DEMO_CREDENTIALS.map((c) => {
                  const isSelected = selectedRole === c.role;
                  return (
                    <button
                      key={c.role}
                      className="demo-btn"
                      onClick={() => {
                        setSelectedRole(c.role);
                        setEmail("");
                        setPassword("");
                      }}
                      style={{
                        background: isSelected
                          ? theme === "dark"
                            ? "var(--text)"
                            : "#7c3aed"
                          : theme === "dark"
                            ? "var(--bg3)"
                            : "rgba(124,58,237,0.06)",
                        border: `1px solid ${
                          isSelected
                            ? theme === "dark"
                              ? "var(--text)"
                              : "#7c3aed"
                            : theme === "dark"
                              ? "var(--border)"
                              : "rgba(124,58,237,0.18)"
                        }`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        {isSelected ? (
                          <div
                            style={{
                              width: "15px",
                              height: "15px",
                              borderRadius: "50%",
                              background:
                                theme === "dark" ? "var(--bg)" : "#ffffff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <Check
                              size={9}
                              color={theme === "dark" ? "var(--bg)" : "#7c3aed"}
                            />
                          </div>
                        ) : (
                          <div
                            style={{
                              width: "15px",
                              height: "15px",
                              borderRadius: "50%",
                              border: `1px solid ${theme === "dark" ? "var(--border2)" : "rgba(124,58,237,0.3)"}`,
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <span
                          style={{
                            fontSize: "12px",
                            color: isSelected
                              ? theme === "dark"
                                ? "var(--bg)"
                                : "#ffffff"
                              : theme === "dark"
                                ? "var(--text)"
                                : "#1e1440",
                            fontWeight: isSelected ? "600" : "400",
                          }}
                        >
                          {c.label}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "10px",
                          color: isSelected
                            ? theme === "dark"
                              ? "rgba(12,14,20,0.6)"
                              : "rgba(255,255,255,0.7)"
                            : theme === "dark"
                              ? "var(--muted)"
                              : "rgba(124,58,237,0.6)",
                        }}
                      >
                        {isSelected ? "✓ Selected" : "Select →"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              <div style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    color: theme === "dark" ? "var(--muted2)" : "#7c3aed",
                    marginBottom: "5px",
                    letterSpacing: "0.05em",
                  }}
                >
                  EMAIL ADDRESS
                </label>
                <input
                  className="login-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setSelectedRole(null);
                  }}
                  placeholder={
                    selectedRole
                      ? "Press Sign in or type your email"
                      : "name@yourdomain.com"
                  }
                  style={{
                    background: theme === "dark" ? "var(--bg2)" : "#ffffff",
                    border: `1px solid ${theme === "dark" ? "var(--border)" : "rgba(124,58,237,0.2)"}`,
                    color: theme === "dark" ? "var(--text)" : "#1e1440",
                  }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    color: theme === "dark" ? "var(--muted2)" : "#7c3aed",
                    marginBottom: "5px",
                    letterSpacing: "0.05em",
                  }}
                >
                  PASSWORD
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    className="login-input"
                    type={showPw ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    style={{
                      paddingRight: "40px",
                      background: theme === "dark" ? "var(--bg2)" : "#ffffff",
                      border: `1px solid ${theme === "dark" ? "var(--border)" : "rgba(124,58,237,0.2)"}`,
                      color: theme === "dark" ? "var(--text)" : "#1e1440",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    aria-label={showPw ? "Hide password" : "Show password"}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--muted)",
                      padding: "0",
                    }}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
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

              <button
                type="submit"
                disabled={loading}
                className="submit-btn"
                style={{
                  background: loading
                    ? "var(--bg4)"
                    : theme === "dark"
                      ? "var(--blue)"
                      : "#7c3aed",
                }}
              >
                {loading ? "Signing in…" : "Sign in →"}
              </button>
            </form>

            {selectedRole && (
              <p
                style={{
                  fontSize: "11px",
                  color: theme === "dark" ? "var(--muted)" : "#7c3aed",
                  textAlign: "center",
                  marginTop: "12px",
                }}
              >
                Account type selected — enter your email and password to
                continue
              </p>
            )}
          </div>
        </div>

        {/* ── RIGHT — Animated background + hero ── */}
        <div className="login-right">
          {/* Grid background */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              backgroundImage:
                theme === "dark"
                  ? "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)"
                  : "linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />

          {/* Glow top right */}
          <div
            style={{
              position: "absolute",
              top: "-100px",
              right: "-100px",
              width: "400px",
              height: "400px",
              borderRadius: "50%",
              background:
                theme === "dark"
                  ? "radial-gradient(circle, rgba(226,75,74,0.08) 0%, transparent 65%)"
                  : "radial-gradient(circle, rgba(214,59,58,0.12) 0%, transparent 65%)",
              pointerEvents: "none",
            }}
          />

          {/* Glow bottom left */}
          <div
            style={{
              position: "absolute",
              bottom: "-100px",
              left: "-60px",
              width: "350px",
              height: "350px",
              borderRadius: "50%",
              background:
                theme === "dark"
                  ? "radial-gradient(circle, rgba(55,138,221,0.07) 0%, transparent 65%)"
                  : "radial-gradient(circle, rgba(37,103,184,0.1) 0%, transparent 65%)",
              pointerEvents: "none",
            }}
          />
          {/* ── ORBITAL ANIMATION ── */}
          <div className="orbit-wrap">
            <div
              className="orbit-ring"
              style={{ width: "260px", height: "260px" }}
            />
            <div
              className="orbit-ring"
              style={{ width: "380px", height: "380px" }}
            />
            <div
              className="orbit-ring"
              style={{ width: "510px", height: "510px" }}
            />

            {/* Center shield */}
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background:
                  theme === "dark"
                    ? "rgba(226,75,74,0.12)"
                    : "rgba(168,85,247,0.15)",
                border: `2px solid ${theme === "dark" ? "rgba(226,75,74,0.3)" : "rgba(168,85,247,0.4)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2,
                animation: "center-pulse 3s ease-in-out infinite",
              }}
            >
              <Shield
                size={30}
                color={theme === "dark" ? "var(--red)" : "#a855f7"}
              />
            </div>

            {[
              {
                icon: "🚑",
                label: "Ambulance",
                c: "rgba(29,158,117,0.18)",
                b: "rgba(29,158,117,0.35)",
                d: "0s",
              },
              {
                icon: "🚔",
                label: "Police",
                c: "rgba(55,138,221,0.18)",
                b: "rgba(55,138,221,0.35)",
                d: "-5.5s",
              },
              {
                icon: "🚒",
                label: "Fire",
                c: "rgba(239,159,39,0.18)",
                b: "rgba(239,159,39,0.35)",
                d: "-11s",
              },
              {
                icon: "🏥",
                label: "Hospital",
                c: "rgba(226,75,74,0.18)",
                b: "rgba(226,75,74,0.35)",
                d: "-16.5s",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="orbit-icon"
                title={item.label}
                style={{
                  width: "46px",
                  height: "46px",
                  fontSize: "19px",
                  background: item.c,
                  border: `1px solid ${item.b}`,
                  animation: `orbit-cw 22s linear infinite`,
                  animationDelay: item.d,
                }}
              >
                {item.icon}
              </div>
            ))}

            {[
              {
                icon: "📡",
                label: "Dispatch",
                c: "rgba(55,138,221,0.14)",
                b: "rgba(55,138,221,0.28)",
                d: "0s",
              },
              {
                icon: "🗺️",
                label: "Map",
                c: "rgba(239,159,39,0.14)",
                b: "rgba(239,159,39,0.28)",
                d: "-10.5s",
              },
              {
                icon: "⚡",
                label: "Speed",
                c: "rgba(226,75,74,0.14)",
                b: "rgba(226,75,74,0.28)",
                d: "-21s",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="orbit-icon"
                title={item.label}
                style={{
                  width: "40px",
                  height: "40px",
                  fontSize: "16px",
                  background: item.c,
                  border: `1px solid ${item.b}`,
                  animation: `orbit-ccw 32s linear infinite`,
                  animationDelay: item.d,
                }}
              >
                {item.icon}
              </div>
            ))}

            {[
              {
                icon: "🔔",
                label: "Alert",
                c: "rgba(226,75,74,0.10)",
                b: "rgba(226,75,74,0.22)",
                d: "0s",
              },
              {
                icon: "📍",
                label: "Location",
                c: "rgba(29,158,117,0.10)",
                b: "rgba(29,158,117,0.22)",
                d: "-9s",
              },
              {
                icon: "👮",
                label: "Officer",
                c: "rgba(55,138,221,0.10)",
                b: "rgba(55,138,221,0.22)",
                d: "-18s",
              },
              {
                icon: "🩺",
                label: "Medical",
                c: "rgba(29,158,117,0.10)",
                b: "rgba(29,158,117,0.22)",
                d: "-27s",
              },
              {
                icon: "🔥",
                label: "Fire",
                c: "rgba(239,159,39,0.10)",
                b: "rgba(239,159,39,0.22)",
                d: "-36s",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="orbit-icon"
                title={item.label}
                style={{
                  width: "34px",
                  height: "34px",
                  fontSize: "13px",
                  background: item.c,
                  border: `1px solid ${item.b}`,
                  animation: `orbit-cw2 46s linear infinite`,
                  animationDelay: item.d,
                }}
              >
                {item.icon}
              </div>
            ))}
          </div>

          {/* ── HERO CONTENT ── */}
          <div className="hero-content">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  background: "rgba(226,75,74,0.15)",
                  border: "2px solid rgba(226,75,74,0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  animation:
                    theme === "dark"
                      ? "center-pulse 3s ease-in-out infinite"
                      : "center-pulse-purple 3s ease-in-out infinite",
                }}
              >
                <Shield size={16} color="var(--red)" />
              </div>
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "var(--text)",
                  }}
                >
                  GH Emergency Response
                </div>
                <div style={{ fontSize: "10px", color: "var(--muted)" }}>
                  National Dispatch Coordination Platform
                </div>
              </div>
            </div>

            <div className="hero-glass">
              <div className="hero-badge">
                <div
                  className="pulse-dot"
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    background: "var(--red)",
                  }}
                />
                LIVE SYSTEM
              </div>
              <h1 className="hero-title">
                Coordinating
                <br />
                Emergency
                <br />
                Response
                <br />
                <span>Across Ghana</span>
              </h1>
              <p className="hero-subtitle">
                Real-time dispatch coordination for police, fire service and
                ambulance units — connecting responders to citizens faster.
              </p>
            </div>

            <div className="hero-stats">
              {[
                { val: "4", label: "Services" },
                { val: "24/7", label: "Coverage" },
                { val: "Live", label: "Tracking" },
                { val: "GPS", label: "Dispatch" },
              ].map((s) => (
                <div key={s.label} className="hero-stat">
                  <div className="hero-stat-val">{s.val}</div>
                  <div className="hero-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
