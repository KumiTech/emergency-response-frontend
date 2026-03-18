'use client'
import { useState, useEffect } from 'react'
import { Plus, User, Truck, Flame } from 'lucide-react'
import { getFireStation } from '@/lib/api'
import type { FireStation, FirePersonnel, FireTruck } from '@/lib/mock-data'

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  on_duty:    { bg: 'var(--green-bg)',  border: 'var(--green-border)',  text: 'var(--green)' },
  off_duty:   { bg: 'var(--bg4)',       border: 'var(--border)',        text: 'var(--muted)' },
  deployed:   { bg: 'var(--red-bg)',    border: 'var(--red-border)',    text: 'var(--red)' },
  available:  { bg: 'var(--green-bg)',  border: 'var(--green-border)',  text: 'var(--green)' },
  maintenance:{ bg: 'var(--amber-bg)',  border: 'var(--amber-border)',  text: 'var(--amber)' },
}

export default function FireDashboard() {
  const [station, setStation] = useState<FireStation | null>(null)
  const [tab, setTab] = useState<'personnel' | 'trucks'>('personnel')
  const [showAdd, setShowAdd] = useState(false)
  const [newPerson, setNewPerson] = useState({ name: '', role: 'Firefighter' })

  useEffect(() => { getFireStation().then(setStation) }, [])
  if (!station) return <div style={{ padding: '40px', color: 'var(--muted)', fontSize: '13px' }}>Loading…</div>

  const onDuty   = station.personnel.filter(p => p.status === 'on_duty').length
  const deployed = station.personnel.filter(p => p.status === 'deployed').length
  const trucksReady = station.trucks.filter(t => t.status === 'available').length

  function addPerson() {
    if (!newPerson.name) return
    const person: FirePersonnel = { id: `F-${Date.now()}`, ...newPerson, status: 'on_duty' }
    setStation(p => p ? { ...p, personnel: [...p.personnel, person] } : p)
    setNewPerson({ name: '', role: 'Firefighter' })
    setShowAdd(false)
  }

  const inputStyle = { width: '100%', padding: '8px 12px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '7px', color: 'var(--text)', fontSize: '13px', outline: 'none', fontFamily: 'var(--font-display)' }

  return (
    <div style={{ height: 'calc(100vh - 48px)', overflowY: 'auto', padding: '24px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>{station.name}</h1>
          <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{station.location}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Personnel on duty', val: onDuty,      color: 'var(--green)', icon: <User size={16} /> },
            { label: 'Currently deployed',val: deployed,    color: 'var(--red)',   icon: <Flame size={16} /> },
            { label: 'Trucks available',  val: trucksReady, color: 'var(--amber)', icon: <Truck size={16} /> },
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

        <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--border)', marginBottom: '20px' }}>
          {(['personnel', 'trucks'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontFamily: 'var(--font-display)',
              color: tab === t ? 'var(--text)' : 'var(--muted)',
              borderBottom: tab === t ? '2px solid var(--amber)' : '2px solid transparent',
              fontWeight: tab === t ? '500' : '400', textTransform: 'capitalize',
            }}>{t}</button>
          ))}
        </div>

        {tab === 'personnel' && (
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text)' }}>{station.personnel.length} Personnel</span>
              <button onClick={() => setShowAdd(!showAdd)} style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                background: 'var(--amber-bg)', border: '1px solid var(--amber-border)',
                borderRadius: '6px', padding: '5px 10px', color: 'var(--amber)',
                fontSize: '11px', cursor: 'pointer', fontFamily: 'var(--font-display)',
              }}><Plus size={11} /> Add Personnel</button>
            </div>

            {showAdd && (
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '10px', color: 'var(--muted)', marginBottom: '4px' }}>FULL NAME</label>
                    <input value={newPerson.name} onChange={e => setNewPerson(p => ({ ...p, name: e.target.value }))} placeholder="Personnel name" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '10px', color: 'var(--muted)', marginBottom: '4px' }}>ROLE</label>
                    <select value={newPerson.role} onChange={e => setNewPerson(p => ({ ...p, role: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                      {['Firefighter', 'Driver Operator', 'Station Commander', 'Rescue Specialist', 'Paramedic'].map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <button onClick={addPerson} style={{ padding: '8px 14px', background: 'var(--amber)', border: 'none', borderRadius: '7px', color: '#fff', fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: '500' }}>Add</button>
                </div>
              </div>
            )}

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Name', 'Role', 'Status', 'Update Status'].map(h => (
                    <th key={h} style={{ padding: '9px 18px', textAlign: 'left', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.06em', fontWeight: '500' }}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {station.personnel.map(p => {
                  const c = STATUS_COLORS[p.status]
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg3)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding: '11px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--bg4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={12} color="var(--muted)" />
                          </div>
                          <span style={{ fontSize: '12px', color: 'var(--text)' }}>{p.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '11px 18px', fontSize: '12px', color: 'var(--muted2)' }}>{p.role}</td>
                      <td style={{ padding: '11px 18px' }}>
                        <span style={{ fontSize: '11px', padding: '2px 7px', borderRadius: '4px', background: c.bg, color: c.text, border: `1px solid ${c.border}`, fontWeight: '500' }}>
                          {p.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '11px 18px' }}>
                        <select
                          value={p.status}
                          onChange={e => setStation(s => s ? { ...s, personnel: s.personnel.map(x => x.id === p.id ? { ...x, status: e.target.value as FirePersonnel['status'] } : x) } : s)}
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

        {tab === 'trucks' && (
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text)' }}>{station.trucks.length} Trucks</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Unit ID', 'Plate', 'Type', 'Status', 'Update'].map(h => (
                    <th key={h} style={{ padding: '9px 18px', textAlign: 'left', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.06em', fontWeight: '500' }}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {station.trucks.map(t => {
                  const c = STATUS_COLORS[t.status]
                  return (
                    <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg3)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding: '11px 18px', fontSize: '12px', color: 'var(--muted2)', fontFamily: 'var(--font-mono)' }}>{t.id}</td>
                      <td style={{ padding: '11px 18px', fontSize: '12px', color: 'var(--text)' }}>{t.plateNumber}</td>
                      <td style={{ padding: '11px 18px', fontSize: '12px', color: 'var(--muted2)' }}>{t.type}</td>
                      <td style={{ padding: '11px 18px' }}>
                        <span style={{ fontSize: '11px', padding: '2px 7px', borderRadius: '4px', background: c.bg, color: c.text, border: `1px solid ${c.border}`, fontWeight: '500' }}>
                          {t.status}
                        </span>
                      </td>
                      <td style={{ padding: '11px 18px' }}>
                        <select
                          value={t.status}
                          onChange={e => setStation(s => s ? { ...s, trucks: s.trucks.map(x => x.id === t.id ? { ...x, status: e.target.value as FireTruck['status'] } : x) } : s)}
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
