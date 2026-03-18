'use client'
import { useState, useEffect } from 'react'
import { Plus, User, Car, Shield } from 'lucide-react'
import { getPoliceStation } from '@/lib/api'
import type { PoliceStation, Officer, PoliceVehicle } from '@/lib/mock-data'

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  on_duty:    { bg: 'var(--green-bg)',  border: 'var(--green-border)',  text: 'var(--green)' },
  off_duty:   { bg: 'var(--bg4)',       border: 'var(--border)',        text: 'var(--muted)' },
  deployed:   { bg: 'var(--red-bg)',    border: 'var(--red-border)',    text: 'var(--red)' },
  available:  { bg: 'var(--green-bg)',  border: 'var(--green-border)',  text: 'var(--green)' },
  maintenance:{ bg: 'var(--amber-bg)',  border: 'var(--amber-border)',  text: 'var(--amber)' },
}

export default function PoliceDashboard() {
  const [station, setStation] = useState<PoliceStation | null>(null)
  const [tab, setTab] = useState<'officers' | 'vehicles'>('officers')
  const [showAddOfficer, setShowAddOfficer] = useState(false)
  const [newOfficer, setNewOfficer] = useState({ name: '', rank: 'Constable', badge: '' })

  useEffect(() => { getPoliceStation().then(setStation) }, [])

  if (!station) return <div style={{ padding: '40px', color: 'var(--muted)', fontSize: '13px' }}>Loading…</div>

  const onDuty   = station.officers.filter(o => o.status === 'on_duty').length
  const deployed = station.officers.filter(o => o.status === 'deployed').length
  const available = station.vehicles.filter(v => v.status === 'available').length

  function addOfficer() {
    if (!newOfficer.name || !newOfficer.badge) return
    const officer: Officer = { id: `O-${Date.now()}`, ...newOfficer, status: 'on_duty' }
    setStation(p => p ? { ...p, officers: [...p.officers, officer] } : p)
    setNewOfficer({ name: '', rank: 'Constable', badge: '' })
    setShowAddOfficer(false)
  }

  const inputStyle = { width: '100%', padding: '8px 12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '7px', color: 'var(--text)', fontSize: '13px', outline: 'none', fontFamily: 'var(--font-display)' }

  return (
    <div style={{ height: 'calc(100vh - 48px)', overflowY: 'auto', padding: '24px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>{station.name}</h1>
          <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{station.location}</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Officers on duty', val: onDuty,    color: 'var(--green)', icon: <User size={16} /> },
            { label: 'Officers deployed', val: deployed, color: 'var(--red)',   icon: <Shield size={16} /> },
            { label: 'Vehicles available', val: available, color: 'var(--blue)', icon: <Car size={16} /> },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{s.label.toUpperCase()}</span>
                <span style={{ color: s.color, opacity: 0.7 }}>{s.icon}</span>
              </div>
              <span style={{ fontSize: '28px', fontWeight: '700', color: s.color }}>{s.val}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--border)', marginBottom: '20px' }}>
          {(['officers', 'vehicles'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontFamily: 'var(--font-display)',
              color: tab === t ? 'var(--text)' : 'var(--muted)',
              borderBottom: tab === t ? '2px solid var(--blue)' : '2px solid transparent',
              fontWeight: tab === t ? '500' : '400',
              textTransform: 'capitalize',
            }}>{t}</button>
          ))}
        </div>

        {/* Officers tab */}
        {tab === 'officers' && (
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text)' }}>{station.officers.length} Officers</span>
              <button onClick={() => setShowAddOfficer(!showAddOfficer)} style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                background: 'var(--blue-bg)', border: '1px solid var(--blue-border)',
                borderRadius: '6px', padding: '5px 10px', color: 'var(--blue)',
                fontSize: '11px', cursor: 'pointer', fontFamily: 'var(--font-display)',
              }}>
                <Plus size={11} /> Add Officer
              </button>
            </div>

            {showAddOfficer && (
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '10px', color: 'var(--muted)', marginBottom: '4px' }}>FULL NAME</label>
                    <input value={newOfficer.name} onChange={e => setNewOfficer(p => ({ ...p, name: e.target.value }))} placeholder="Officer name" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '10px', color: 'var(--muted)', marginBottom: '4px' }}>RANK</label>
                    <select value={newOfficer.rank} onChange={e => setNewOfficer(p => ({ ...p, rank: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                      {['Constable', 'Corporal', 'Sergeant', 'Inspector', 'Chief Inspector'].map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '10px', color: 'var(--muted)', marginBottom: '4px' }}>BADGE NO.</label>
                    <input value={newOfficer.badge} onChange={e => setNewOfficer(p => ({ ...p, badge: e.target.value }))} placeholder="AC-0050" style={inputStyle} />
                  </div>
                  <button onClick={addOfficer} style={{ padding: '8px 14px', background: 'var(--blue)', border: 'none', borderRadius: '7px', color: '#fff', fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: '500' }}>
                    Add
                  </button>
                </div>
              </div>
            )}

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Name', 'Rank', 'Badge', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '9px 18px', textAlign: 'left', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.06em', fontWeight: '500' }}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {station.officers.map(o => {
                  const c = STATUS_COLORS[o.status]
                  return (
                    <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg3)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding: '11px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--bg4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={12} color="var(--muted)" />
                          </div>
                          <span style={{ fontSize: '12px', color: 'var(--text)' }}>{o.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '11px 18px', fontSize: '12px', color: 'var(--muted2)' }}>{o.rank}</td>
                      <td style={{ padding: '11px 18px', fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{o.badge}</td>
                      <td style={{ padding: '11px 18px' }}>
                        <span style={{ fontSize: '11px', padding: '2px 7px', borderRadius: '4px', background: c.bg, color: c.text, border: `1px solid ${c.border}`, fontWeight: '500' }}>
                          {o.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '11px 18px' }}>
                        <select
                          value={o.status}
                          onChange={e => setStation(p => p ? { ...p, officers: p.officers.map(x => x.id === o.id ? { ...x, status: e.target.value as Officer['status'] } : x) } : p)}
                          style={{ fontSize: '11px', padding: '3px 7px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text)', cursor: 'pointer', fontFamily: 'var(--font-display)', outline: 'none' }}>
                          <option value="on_duty">On duty</option>
                          <option value="off_duty">Off duty</option>
                          <option value="deployed">Deployed</option>
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Vehicles tab */}
        {tab === 'vehicles' && (
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text)' }}>{station.vehicles.length} Vehicles</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Vehicle ID', 'Plate', 'Type', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '9px 18px', textAlign: 'left', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.06em', fontWeight: '500' }}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {station.vehicles.map(v => {
                  const c = STATUS_COLORS[v.status]
                  return (
                    <tr key={v.id} style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg3)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding: '11px 18px', fontSize: '12px', color: 'var(--muted2)', fontFamily: 'var(--font-mono)' }}>{v.id}</td>
                      <td style={{ padding: '11px 18px', fontSize: '12px', color: 'var(--text)' }}>{v.plateNumber}</td>
                      <td style={{ padding: '11px 18px', fontSize: '12px', color: 'var(--muted2)' }}>{v.type}</td>
                      <td style={{ padding: '11px 18px' }}>
                        <span style={{ fontSize: '11px', padding: '2px 7px', borderRadius: '4px', background: c.bg, color: c.text, border: `1px solid ${c.border}`, fontWeight: '500' }}>
                          {v.status}
                        </span>
                      </td>
                      <td style={{ padding: '11px 18px' }}>
                        <select
                          value={v.status}
                          onChange={e => setStation(p => p ? { ...p, vehicles: p.vehicles.map(x => x.id === v.id ? { ...x, status: e.target.value as PoliceVehicle['status'] } : x) } : p)}
                          style={{ fontSize: '11px', padding: '3px 7px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text)', cursor: 'pointer', fontFamily: 'var(--font-display)', outline: 'none' }}>
                          <option value="available">Available</option>
                          <option value="deployed">Deployed</option>
                          <option value="maintenance">Maintenance</option>
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
