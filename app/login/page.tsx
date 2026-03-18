'use client'
import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { loginUser } from '@/lib/api'
import { Shield, AlertTriangle, Eye, EyeOff } from 'lucide-react'

const DEMO_CREDENTIALS = [
  { label: 'System Admin',    email: 'dispatch@ghana.gov', role: 'Dispatch Operator' },
  { label: 'Hospital Admin',  email: 'hospital@korle.gh',  role: 'Hospital Admin' },
  { label: 'Police Admin',    email: 'police@accra.gh',    role: 'Police Station Admin' },
  { label: 'Fire Admin',      email: 'fire@accra.gh',      role: 'Fire Service Admin' },
]

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { token, user } = await loginUser(email, password)
      login(user, token)
    } catch {
      setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      {/* Background grid */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }} className="animate-slide-in">

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px',
            background: 'var(--red-bg)', border: '1px solid var(--red-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Shield size={24} color="var(--red)" />
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '6px' }}>
            GH Emergency Response
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5 }}>
            National Dispatch Coordination Platform<br />
            University of Ghana
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: '16px', padding: '28px',
        }}>
          <h2 style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text)', marginBottom: '20px' }}>
            Sign in to your account
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--muted2)', marginBottom: '6px', letterSpacing: '0.04em' }}>
                EMAIL ADDRESS
              </label>
              <input
                type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@ghana.gov"
                style={{
                  width: '100%', padding: '10px 14px',
                  background: 'var(--bg3)', border: '1px solid var(--border)',
                  borderRadius: '8px', color: 'var(--text)', fontSize: '14px',
                  outline: 'none', fontFamily: 'var(--font-display)',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--blue-border)'}
                onBlur={e  => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--muted2)', marginBottom: '6px', letterSpacing: '0.04em' }}>
                PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'} required value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%', padding: '10px 40px 10px 14px',
                    background: 'var(--bg3)', border: '1px solid var(--border)',
                    borderRadius: '8px', color: 'var(--text)', fontSize: '14px',
                    outline: 'none', fontFamily: 'var(--font-display)',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--blue-border)'}
                  onBlur={e  => e.target.style.borderColor = 'var(--border)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '0',
                  }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'var(--red-bg)', border: '1px solid var(--red-border)',
                borderRadius: '8px', padding: '10px 12px', marginBottom: '16px',
              }}>
                <AlertTriangle size={14} color="var(--red)" />
                <span style={{ fontSize: '13px', color: 'var(--red)' }}>{error}</span>
              </div>
            )}

            <button
              type="submit" disabled={loading}
              style={{
                width: '100%', padding: '11px',
                background: loading ? 'var(--bg4)' : 'var(--blue)',
                border: 'none', borderRadius: '8px',
                color: '#fff', fontSize: '14px', fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-display)',
                transition: 'background 0.15s, opacity 0.15s',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        {/* Demo credentials hint */}
        <div style={{
          marginTop: '20px', background: 'var(--bg2)',
          border: '1px solid var(--border)', borderRadius: '12px', padding: '16px',
        }}>
          <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '10px', letterSpacing: '0.04em' }}>
            DEMO ACCOUNTS — password: <span style={{ color: 'var(--muted2)', fontFamily: 'var(--font-mono)' }}>admin123</span>
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {DEMO_CREDENTIALS.map(c => (
              <button
                key={c.email}
                onClick={() => { setEmail(c.email); setPassword('admin123') }}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'var(--bg3)', border: '1px solid var(--border)',
                  borderRadius: '6px', padding: '7px 10px', cursor: 'pointer',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border2)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <span style={{ fontSize: '12px', color: 'var(--text)' }}>{c.label}</span>
                <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{c.email}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
