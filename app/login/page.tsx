"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Shield, AlertTriangle, Eye, EyeOff, Check } from "lucide-react";

const DEMO_CREDENTIALS = [
  {
    label: "System Admin",
    email: "admin@emergency.gh",
    role: "Dispatch Operator",
  },
  {
    label: "Hospital Admin",
    email: "korlebu@emergency.gh",
    role: "Hospital Admin",
  },
  {
    label: "Police Admin",
    email: "police@emergency.gh",
    role: "Police Station Admin",
  },
  {
    label: "Fire Admin",
    email: "fire@emergency.gh",
    role: "Fire Service Admin",
  },
];

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch {
      setError("Invalid email or password.");
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
          padding: 32px 52px 32px 52px;
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
        @keyframes icon-pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(226,75,74,0.4); }
          50%      { box-shadow: 0 0 0 24px rgba(226,75,74,0.0); }
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

        @media (max-width: 768px) {
          .login-root { grid-template-columns: 1fr; }
          .login-right { display: none; }
          .login-left { padding: 24px; border-right: none; }
        }
      `}</style>

      <div className="login-root">
        {/* ── LEFT — Form ── */}
        <div className="login-left">
          <div style={{ width: "100%", maxWidth: "400px", margin: "0 auto" }}>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: "700",
                color: "var(--text)",
                marginBottom: "4px",
              }}
            >
              Sign in
            </h2>
            <p
              style={{
                fontSize: "13px",
                color: "var(--muted)",
                marginBottom: "20px",
              }}
            >
              Access the emergency coordination platform
            </p>

            {/* Demo accounts */}
            <div
              style={{
                background: "var(--bg2)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                padding: "12px",
                marginBottom: "16px",
              }}
            >
              <p
                style={{
                  fontSize: "10px",
                  color: "var(--muted)",
                  marginBottom: "8px",
                  letterSpacing: "0.06em",
                }}
              >
                SELECT ACCOUNT — then enter password below
              </p>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                {DEMO_CREDENTIALS.map((c) => {
                  const isSelected = selectedDemo === c.email;
                  return (
                    <button
                      key={c.email}
                      className="demo-btn"
                      onClick={() => {
                        setSelectedDemo(c.email);
                        setEmail(c.email);
                        setPassword("");
                      }}
                      style={{
                        background: isSelected ? "var(--text)" : "var(--bg3)",
                        border: `1px solid ${isSelected ? "var(--text)" : "var(--border)"}`,
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
                              background: "var(--bg)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <Check size={9} color="var(--text)" />
                          </div>
                        ) : (
                          <div
                            style={{
                              width: "15px",
                              height: "15px",
                              borderRadius: "50%",
                              border: "1px solid var(--border2)",
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <span
                          style={{
                            fontSize: "12px",
                            color: isSelected ? "var(--bg)" : "var(--text)",
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
                            ? "rgba(12,14,20,0.6)"
                            : "var(--muted)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {c.email}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    color: "var(--muted2)",
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
                    setSelectedDemo(null);
                  }}
                  placeholder="Select an account above or type manually"
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    color: "var(--muted2)",
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
                    style={{ paddingRight: "40px" }}
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

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? "Signing in…" : "Sign in →"}
              </button>
            </form>
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
                "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />

          {/* Glow effects */}
          <div
            style={{
              position: "absolute",
              top: "-100px",
              right: "-100px",
              width: "400px",
              height: "400px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(226,75,74,0.08) 0%, transparent 65%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-100px",
              left: "-60px",
              width: "350px",
              height: "350px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(55,138,221,0.07) 0%, transparent 65%)",
              pointerEvents: "none",
            }}
          />

          {/* ── ORBITAL ANIMATION (background) ── */}
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
                background: "rgba(226,75,74,0.12)",
                border: "2px solid rgba(226,75,74,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2,
                animation: "center-pulse 3s ease-in-out infinite",
              }}
            >
              <Shield size={30} color="var(--red)" />
            </div>

            {/* Inner orbit CW 22s */}
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

            {/* Middle orbit CCW 32s */}
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

            {/* Outer orbit CW 46s */}
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

          {/* ── HERO CONTENT (foreground) ── */}
          <div className="hero-content">
            {/* Top brand — animated icon */}
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
                  animation: "icon-pulse 3s ease-in-out infinite",
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

            {/* Center: Hero glass card */}
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

            {/* Bottom: stats only — no footer text */}
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
