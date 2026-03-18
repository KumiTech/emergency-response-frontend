'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { ROLE_ROUTES } from '@/lib/auth-context'
import { Shield, LogOut, Bell, Activity, BarChart2 } from 'lucide-react'
import Link from 'next/link'

const ROLE_LABELS: Record<string, string> = {
  system_admin:   'Dispatch Operator',
  hospital_admin: 'Hospital Admin',
  police_admin:   'Police Station Admin',
  fire_admin:     'Fire Service Admin',
}

const ROLE_ACCENT: Record<string, string> = {
  system_admin:   'var(--red)',
  hospital_admin: 'var(--green)',
  police_admin:   'var(--blue)',
  fire_admin:     'var(--amber)',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth()
  const router   = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login')
  }, [user, isLoading, router])

  if (isLoading || !user) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--muted)' }}>
        <Activity size={16} />
        <span style={{ fontSize: '13px' }}>Loading…</span>
      </div>
    </div>
  )

  const accent      = ROLE_ACCENT[user.role]
  const homeRoute   = ROLE_ROUTES[user.role]
  const onAnalytics = pathname === '/dashboard/analytics'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Topbar */}
      <header style={{
        height: '48px', background: 'var(--bg2)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 20px',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        {/* Left: logo + nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <div style={{
              width: '26px', height: '26px', borderRadius: '6px',
              background: 'rgba(226,75,74,0.12)', border: '1px solid rgba(226,75,74,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Shield size={13} color="var(--red)" />
            </div>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', letterSpacing: '0.02em' }}>
              GH Emergency Response
            </span>
            <span style={{
              fontSize: '10px', padding: '2px 7px',
              background: 'var(--green-bg)', border: '1px solid var(--green-border)',
              borderRadius: '4px', color: 'var(--green)',
              letterSpacing: '0.05em', fontWeight: '500',
            }}>LIVE</span>
          </div>

          {/* Nav links */}
          <nav style={{ display: 'flex', gap: '2px' }}>
            <Link href={homeRoute} style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '5px 10px', borderRadius: '6px', fontSize: '12px',
              textDecoration: 'none',
              color: !onAnalytics ? accent : 'var(--muted)',
              background: !onAnalytics ? `rgba(${accent === 'var(--red)' ? '226,75,74' : accent === 'var(--green)' ? '29,158,117' : accent === 'var(--blue)' ? '55,138,221' : '239,159,39'},0.08)` : 'transparent',
              fontWeight: !onAnalytics ? '500' : '400',
            }}>
              <Activity size={12} />
              Dashboard
            </Link>
            <Link href="/dashboard/analytics" style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '5px 10px', borderRadius: '6px', fontSize: '12px',
              textDecoration: 'none',
              color: onAnalytics ? 'var(--amber)' : 'var(--muted)',
              background: onAnalytics ? 'var(--amber-bg)' : 'transparent',
              fontWeight: onAnalytics ? '500' : '400',
            }}>
              <BarChart2 size={12} />
              Analytics
            </Link>
          </nav>
        </div>

        {/* Right: user info + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '4px', display: 'flex' }}>
            <Bell size={15} />
          </button>
          <div style={{ width: '1px', height: '16px', background: 'var(--border)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '26px', height: '26px', borderRadius: '50%',
              background: 'var(--bg4)', border: `1px solid ${accent}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '10px', fontWeight: '600', color: accent,
            }}>
              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text)', lineHeight: 1.2 }}>{user.name}</span>
              <span style={{ fontSize: '10px', color: 'var(--muted)', lineHeight: 1.2 }}>{ROLE_LABELS[user.role]}</span>
            </div>
          </div>
          <button
            onClick={logout}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              background: 'none', border: '1px solid var(--border)',
              borderRadius: '6px', padding: '5px 10px', cursor: 'pointer',
              color: 'var(--muted)', fontSize: '12px', fontFamily: 'var(--font-display)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red-border)'; e.currentTarget.style.color = 'var(--red)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}
          >
            <LogOut size={12} /> Sign out
          </button>
        </div>
      </header>

      <main style={{ flex: 1, overflow: 'hidden' }}>
        {children}
      </main>
    </div>
  )
}
