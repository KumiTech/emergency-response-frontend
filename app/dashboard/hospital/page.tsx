'use client'
import { useState, useEffect } from 'react'
import { Bed, Activity, Truck, User } from 'lucide-react'
import { getHospital } from '@/lib/api'
import type { Hospital, Ambulance } from '@/lib/mock-data'

const AMB_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  available:   { bg: 'var(--green-bg)',  border: 'var(--green-border)',  text: 'var(--green)' },
  dispatched:  { bg: 'var(--red-bg)',    border: 'var(--red-border)',    text: 'var(--red)' },
  maintenance: { bg: 'var(--amber-bg)',  border: 'var(--amber-border)',  text: 'var(--amber)' },
  returning:   { bg: 'var(--blue-bg)',   border: 'var(--blue-border)',   text: 'var(--blue)' },
}

function CapacityBar({ used, total, color }: { used: number; total: number; color: string }) {
  const pct = total > 0 ? ((total - used) / total) * 100 : 0
  return (
    <div style={{ marginTop: '6px' }}>
      <div style={{ height: '5px', background: 'var(--bg4)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '3px', transition: 'width 0.4s' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
        <span style={{ fontSize: '10px', color: 'var(--muted)' }}>{used} available</span>
        <span style={{ fontSize: '10px', color: 'var(--muted)' }}>{total} total</span>
      </div>
    </div>
  )
}

export default function HospitalDashboard() {
  const [hospital, setHospital] = useState<Hospital | null>(null)
  const [ambulances, setAmbulances] = useState<Ambulance[]>([])

  useEffect(() => {
    getHospital().then(h => {
      setHospital(h)
      setAmbulances(h.ambulances)
    })
  }, [])

  if (!hospital) return <div style={{ padding: '40px', color: 'var(--muted)', fontSize: '13px' }}>Loading…</div>

  const statCards = [
    { label: 'Available Beds',  val: hospital.availableBeds,  total: hospital.totalBeds, color: 'var(--green)', icon: <Bed size={16} /> },
    { label: 'ICU Available',   val: hospital.icuAvailable,   total: hospital.icuTotal,  color: 'var(--amber)', icon: <Activity size={16} /> },
    { label: 'Ambulances Ready', val: ambulances.filter(a => a.status === 'available').length, total: ambulances.length, color: 'var(--blue)', icon: <Truck size={16} /> },
    { label: 'Dispatched Now',  val: ambulances.filter(a => a.status === 'dispatched').length, total: ambulances.length, color: 'var(--red)', icon: <Activity size={16} /> },
  ]

  return (
    <div style={{ height: 'calc(100vh - 48px)', overflowY: 'auto', padding: '24px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>{hospital.name}</h1>
          <p style={{ fontSize: '12px', color: 'var(--muted)' }}>Hospital capacity and ambulance management</p>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '28px' }}>
          {statCards.map(s => (
            <div key={s.label} style={{
              background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: '12px', padding: '16px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.04em' }}>{s.label.toUpperCase()}</span>
                <span style={{ color: s.color, opacity: 0.7 }}>{s.icon}</span>
              </div>
              <div style={{ fontSize: '26px', fontWeight: '700', color: s.color }}>{s.val}</div>
              <CapacityBar used={s.val} total={s.total} color={s.color} />
            </div>
          ))}
        </div>

        {/* Ambulance table */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden', marginBottom: '24px' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text)' }}>Ambulance Fleet</span>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{ambulances.length} units</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Unit ID', 'Plate Number', 'Driver', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 18px', textAlign: 'left', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.06em', fontWeight: '500' }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ambulances.map(amb => {
                const c = AMB_COLORS[amb.status] || AMB_COLORS.available
                return (
                  <tr key={amb.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.12s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg3)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '11px 18px', fontSize: '12px', color: 'var(--muted2)', fontFamily: 'var(--font-mono)' }}>{amb.id}</td>
                    <td style={{ padding: '11px 18px', fontSize: '12px', color: 'var(--text)' }}>{amb.plateNumber}</td>
                    <td style={{ padding: '11px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--bg4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={11} color="var(--muted)" />
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--text)' }}>{amb.driverName}</span>
                      </div>
                    </td>
                    <td style={{ padding: '11px 18px' }}>
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: c.bg, color: c.text, border: `1px solid ${c.border}`, fontWeight: '500', textTransform: 'capitalize' }}>
                        {amb.status}
                      </span>
                    </td>
                    <td style={{ padding: '11px 18px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {amb.status !== 'available' && (
                          <button
                            onClick={() => setAmbulances(prev => prev.map(a => a.id === amb.id ? { ...a, status: 'available' } : a))}
                            style={{ fontSize: '11px', padding: '3px 8px', background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: '4px', color: 'var(--green)', cursor: 'pointer', fontFamily: 'var(--font-display)' }}>
                            Set available
                          </button>
                        )}
                        {amb.status === 'available' && (
                          <button
                            onClick={() => setAmbulances(prev => prev.map(a => a.id === amb.id ? { ...a, status: 'maintenance' } : a))}
                            style={{ fontSize: '11px', padding: '3px 8px', background: 'var(--amber-bg)', border: '1px solid var(--amber-border)', borderRadius: '4px', color: 'var(--amber)', cursor: 'pointer', fontFamily: 'var(--font-display)' }}>
                            Maintenance
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Bed capacity update */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '18px' }}>
          <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text)', marginBottom: '16px' }}>Update Bed Capacity</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              { label: 'General Ward Available', key: 'availableBeds', val: hospital.availableBeds, total: hospital.totalBeds, color: 'var(--green)' },
              { label: 'ICU Available', key: 'icuAvailable', val: hospital.icuAvailable, total: hospital.icuTotal, color: 'var(--amber)' },
            ].map(f => (
              <div key={f.key} style={{ background: 'var(--bg3)', borderRadius: '10px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{f.label}</span>
                  <span style={{ fontSize: '18px', fontWeight: '600', color: f.color }}>{f.val} / {f.total}</span>
                </div>
                <CapacityBar used={f.val} total={f.total} color={f.color} />
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <button
                    onClick={() => setHospital(p => p ? { ...p, [f.key]: Math.max(0, (p as unknown as Record<string, number>)[f.key] - 1) } : p)}
                    style={{ flex: 1, padding: '5px', background: 'var(--bg4)', border: '1px solid var(--border)', borderRadius: '5px', color: 'var(--text)', cursor: 'pointer', fontSize: '16px' }}>−</button>
                  <button
                    onClick={() => setHospital(p => p ? { ...p, [f.key]: Math.min(f.total, (p as unknown as Record<string, number>)[f.key] + 1) } : p)}
                    style={{ flex: 1, padding: '5px', background: 'var(--bg4)', border: '1px solid var(--border)', borderRadius: '5px', color: 'var(--text)', cursor: 'pointer', fontSize: '16px' }}>+</button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
