"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ROLE_ROUTES } from "@/lib/auth-context";
import { Shield, LogOut, Bell, Activity, BarChart2, Users } from "lucide-react";
import Link from "next/link";

const ROLE_LABELS: Record<string, string> = {
  system_admin: "Dispatch Operator",
  hospital_admin: "Hospital Admin",
  police_admin: "Police Station Admin",
  fire_admin: "Fire Service Admin",
  ambulance_driver: "Ambulance Driver",
};

const ROLE_ACCENT: Record<string, string> = {
  system_admin: "var(--red)",
  hospital_admin: "var(--green)",
  police_admin: "var(--blue)",
  fire_admin: "var(--amber)",
  ambulance_driver: "var(--green)",
};

const ROLE_ACCENT_BG: Record<string, string> = {
  system_admin: "var(--red-bg)",
  hospital_admin: "var(--green-bg)",
  police_admin: "var(--blue-bg)",
  fire_admin: "var(--amber-bg)",
  ambulance_driver: "var(--green-bg)",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  if (!user)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "var(--muted)",
          }}
        >
          <Activity size={16} />
          <span style={{ fontSize: "13px" }}>Loading…</span>
        </div>
      </div>
    );

  const accent = ROLE_ACCENT[user.role];
  const accentBg = ROLE_ACCENT_BG[user.role];
  const homeRoute = ROLE_ROUTES[user.role];
  const initials = user.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2);

  const onHome = pathname === homeRoute;
  const onAnalytics = pathname === "/dashboard/analytics";
  const onAdmin = pathname === "/dashboard/admin";

  const navLinkStyle = (active: boolean, color: string, bg: string) => ({
    display: "flex" as const,
    alignItems: "center" as const,
    gap: "5px",
    padding: "5px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    textDecoration: "none",
    color: active ? color : "var(--muted)",
    background: active ? bg : "transparent",
    fontWeight: active ? "500" : "400",
    transition: "all 0.15s",
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Topbar */}
      <header
        style={{
          height: "48px",
          background: "var(--bg2)",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          position: "sticky",
          top: 0,
          zIndex: 50,
          flexShrink: 0,
        }}
      >
        {/* Left */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
            <div
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "6px",
                background: "rgba(226,75,74,0.12)",
                border: "1px solid rgba(226,75,74,0.22)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Shield size={13} color="var(--red)" />
            </div>
            <span
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "var(--text)",
                letterSpacing: "0.02em",
              }}
            >
              GH Emergency Response
            </span>
            <span
              style={{
                fontSize: "10px",
                padding: "2px 7px",
                background: "var(--green-bg)",
                border: "1px solid var(--green-border)",
                borderRadius: "4px",
                color: "var(--green)",
                letterSpacing: "0.05em",
                fontWeight: "500",
              }}
            >
              LIVE
            </span>
          </div>

          {/* Nav */}
          <nav style={{ display: "flex", gap: "2px" }}>
            <Link
              href={homeRoute}
              style={navLinkStyle(
                onHome && !onAnalytics && !onAdmin,
                accent,
                accentBg,
              )}
            >
              <Activity size={12} />
              Dashboard
            </Link>
            <Link
              href="/dashboard/analytics"
              style={navLinkStyle(
                onAnalytics,
                "var(--amber)",
                "var(--amber-bg)",
              )}
            >
              <BarChart2 size={12} />
              Analytics
            </Link>
            {user.role === "system_admin" && (
              <Link
                href="/dashboard/admin"
                style={navLinkStyle(onAdmin, "var(--red)", "var(--red-bg)")}
              >
                <Users size={12} />
                Admin
              </Link>
            )}
          </nav>
        </div>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            aria-label="Notifications"
            title="Notifications"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--muted)",
              padding: "4px",
              display: "flex",
            }}
          >
            <Bell size={15} />
          </button>

          <div
            style={{
              width: "1px",
              height: "16px",
              background: "var(--border)",
            }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "50%",
                background: "var(--bg4)",
                border: `1px solid ${accent}44`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                fontWeight: "600",
                color: accent,
              }}
            >
              {initials}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "500",
                  color: "var(--text)",
                  lineHeight: 1.2,
                }}
              >
                {user.name}
              </span>
              <span
                style={{
                  fontSize: "10px",
                  color: "var(--muted)",
                  lineHeight: 1.2,
                }}
              >
                {ROLE_LABELS[user.role]}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            title="Sign out"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              background: "none",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              padding: "5px 10px",
              cursor: "pointer",
              color: "var(--muted)",
              fontSize: "12px",
              fontFamily: "var(--font-display)",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--red-border)";
              e.currentTarget.style.color = "var(--red)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--muted)";
            }}
          >
            <LogOut size={12} /> Sign out
          </button>
        </div>
      </header>

      <main style={{ flex: 1, overflow: "hidden" }}>{children}</main>
    </div>
  );
}
