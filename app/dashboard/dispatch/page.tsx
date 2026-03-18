'use client'
import { useState, useEffect } from 'react'
import { Plus, MapPin, Clock, User, Truck, ChevronRight, X, AlertTriangle } from 'lucide-react'
import { getIncidents, getVehicles, createIncident } from '@/lib/api'
import type { Incident, Vehicle } from '@/lib/mock-data'

const TYPE_COLORS: Record<string, { bg: string; border: string; text: string; label: string }> = {
  robbery:  { bg: 'var(--red-bg)',   border: 'var(--red-border)',   text: 'var(--red)',   label: 'Robbery' },
  assault:  { bg: 'var(--red-bg)',   border: 'var(--red-border)',   text: 'var(--red)',   label: 'Assault' },
  fire:     { bg: 'var(--amber-bg)', border: 'var(--amber-border)', text: 'var(--amber)', label: 'Fire' },
  medical:  { bg: 'var(--green-bg)', border: 'var(--green-border)', text: 'var(--green)', label: 'Medical' },
  accident: { bg: 'var(--blue-bg)',  border: 'var(--blue-border)',  text: 'var(--blue)',  label: 'Accident' },
}

const STATUS_COLORS: Record<string, string> = {
  created:     'var(--muted)',
  dispatched:  'var(--red)',
  in_progress: 'var(--amber)',
  resolved:    'var(--green)',
}

const STATUS_LABELS: Record<string, string> = {
  created:     'Created',
  dispatched:  'Dispatched',
  in_progress: 'In Progress',
  resolved:    'Resolved',
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diff < 1)  return 'just now'
  if (diff < 60) return `${diff}m ago`
  return `${Math.floor(diff / 60)}h ago`
}

// ── New Incident Modal ───────────────────────
function NewIncidentModal({ onClose, onCreated }: { onClose: () => void; onCreated: (i: Incident) => void }) {
  const [form, setForm] = useState({ citizenName: '', type: 'medical', latitude: '', longitude: '', notes: '', createdBy: 'Kwame Mensah' })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const result = await createIncident({ ...form, type: form.type as import('@/lib/mock-data').IncidentType, latitude: parseFloat(form.latitude), longitude: parseFloat(form.longitude) })
    onCreated(result as Incident)
    setLoading(false)
    onClose()
  }

  const inputStyle = {
    width: '100%', padding: '9px 12px',
    background: 'var(--bg3)', border: '1px solid var(--border)',
    borderRadius: '7px', color: 'var(--text)', fontSize: '13px',
    outline: 'none', fontFamily: 'var(--font-display)',
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '440px',
        maxHeight: '90vh', overflowY: 'auto',
      }} className="animate-slide-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text)' }}>Log New Incident</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          {[
            { label: 'CALLER NAME', key: 'citizenName', placeholder: 'Name of person reporting', type: 'text' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--muted2)', marginBottom: '5px', letterSpacing: '0.04em' }}>{f.label}</label>
              <input required type={f.type} placeholder={f.placeholder} value={(form as Record<string, string>)[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={inputStyle} />
            </div>
          ))}

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--muted2)', marginBottom: '5px', letterSpacing: '0.04em' }}>INCIDENT TYPE</label>
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
              style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="medical">Medical Emergency</option>
              <option value="fire">Fire</option>
              <option value="robbery">Robbery</option>
              <option value="assault">Assault</option>
              <option value="accident">Road Accident</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            {[{ label: 'LATITUDE', key: 'latitude', placeholder: '5.6037' }, { label: 'LONGITUDE', key: 'longitude', placeholder: '-0.1870' }].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--muted2)', marginBottom: '5px', letterSpacing: '0.04em' }}>{f.label}</label>
                <input required type="number" step="any" placeholder={f.placeholder} value={(form as Record<string, string>)[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={inputStyle} />
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--muted2)', marginBottom: '5px', letterSpacing: '0.04em' }}>NOTES</label>
            <textarea rows={3} placeholder="Additional details about the incident…" value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: '10px', background: 'var(--bg3)',
              border: '1px solid var(--border)', borderRadius: '8px',
              color: 'var(--muted)', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-display)',
            }}>Cancel</button>
            <button type="submit" disabled={loading} style={{
              flex: 2, padding: '10px', background: 'var(--red)',
              border: 'none', borderRadius: '8px',
              color: '#fff', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'var(--font-display)',
            }}>
              {loading ? 'Logging…' : 'Log Incident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Map placeholder (swap with Google Maps) ──
function MapView({ incidents, vehicles, selectedId }: { incidents: Incident[]; vehicles: Vehicle[]; selectedId: string | null }) {
  return (
    <div style={{ width: '100%', height: '100%', background: '#0d1020', position: 'relative', overflow: 'hidden' }}>
      {/* Grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
      }} />
      {/* Fake roads */}
      {[
        { left:'0', top:'38%', width:'100%', height:'3px' },
        { left:'0', top:'63%', width:'100%', height:'2px' },
        { left:'28%', top:'0', width:'2px', height:'100%' },
        { left:'66%', top:'0', width:'3px', height:'100%' },
      ].map((r, i) => (
        <div key={i} style={{ position:'absolute', background:'rgba(255,255,255,0.05)', borderRadius:'2px', ...r }} />
      ))}

      {/* Incident pins */}
      {incidents.filter(i => i.status !== 'resolved').map((inc, idx) => {
        const c = TYPE_COLORS[inc.type]
        const positions = [
          { left: '42%', top: '30%' }, { left: '70%', top: '55%' },
          { left: '22%', top: '60%' }, { left: '50%', top: '70%' },
        ]
        const pos = positions[idx % positions.length]
        const isSelected = inc.id === selectedId
        return (
          <div key={inc.id} style={{ position: 'absolute', ...pos, transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: isSelected ? 10 : 5 }}>
            {isSelected && (
              <div className="ping-ring" style={{
                position: 'absolute', width: '28px', height: '28px',
                borderRadius: '50%', border: `2px solid ${c.text}`,
                top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              }} />
            )}
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: c.bg, border: `2px solid ${c.text}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AlertTriangle size={12} color={c.text} />
            </div>
            <div style={{
              marginTop: '3px', fontSize: '9px', padding: '1px 5px',
              background: c.bg, color: c.text, borderRadius: '3px',
              border: `1px solid ${c.border}`, whiteSpace: 'nowrap', fontWeight: '500',
            }}>
              {inc.id}
            </div>
          </div>
        )
      })}

      {/* Vehicle pins */}
      {vehicles.filter(v => v.status === 'dispatched').map((v, idx) => {
        const vPositions = [{ left: '36%', top: '44%' }, { left: '62%', top: '48%' }, { left: '18%', top: '54%' }]
        const pos = vPositions[idx % vPositions.length]
        return (
          <div key={v.id} style={{
            position: 'absolute', ...pos,
            background: 'rgba(12,14,20,0.9)', border: '1px solid var(--border2)',
            borderRadius: '5px', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '5px',
            fontSize: '10px', color: 'var(--text)', zIndex: 6,
          }}>
            <div className="pulse-dot" style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: v.type === 'police' ? 'var(--blue)' : v.type === 'fire' ? 'var(--amber)' : 'var(--green)',
            }} />
            {v.label}
          </div>
        )
      })}

      {/* Map note */}
      <div style={{
        position: 'absolute', bottom: '12px', right: '12px',
        background: 'rgba(12,14,20,0.85)', border: '1px solid var(--border)',
        borderRadius: '6px', padding: '7px 10px', fontSize: '10px', color: 'var(--muted)',
      }}>
        Replace with Google Maps API
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: '12px', left: '12px',
        background: 'rgba(12,14,20,0.85)', border: '1px solid var(--border)',
        borderRadius: '6px', padding: '7px 10px', display: 'flex', gap: '12px',
      }}>
        {[
          { color: 'var(--red)', label: 'Crime' },
          { color: 'var(--amber)', label: 'Fire' },
          { color: 'var(--green)', label: 'Medical' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: 'var(--muted)' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: l.color }} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main Dispatch Dashboard ──────────────────
export default function DispatchDashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [vehicles,  setVehicles]  = useState<Vehicle[]>([])
  const [selected,  setSelected]  = useState<Incident | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    getIncidents().then(setIncidents)
    getVehicles().then(setVehicles)
  }, [])

  const stats = {
    active:    incidents.filter(i => i.status !== 'resolved').length,
    dispatched:incidents.filter(i => i.status === 'dispatched').length,
    resolved:  incidents.filter(i => i.status === 'resolved').length,
  }

  return (
    <div style={{ height: 'calc(100vh - 48px)', display: 'flex', flexDirection: 'column' }}>
      {/* Stats bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0',
        borderBottom: '1px solid var(--border)', background: 'var(--bg2)',
        padding: '0 20px', height: '40px',
      }}>
        {[
          { label: 'Active',     val: stats.active,     color: 'var(--red)' },
          { label: 'Dispatched', val: stats.dispatched,  color: 'var(--amber)' },
          { label: 'Resolved today', val: stats.resolved, color: 'var(--green)' },
          { label: 'Vehicles out', val: vehicles.filter(v => v.status === 'dispatched').length, color: 'var(--blue)' },
        ].map((s, i) => (
          <div key={s.label} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '0 16px', borderRight: '1px solid var(--border)',
            height: '100%', ...(i === 0 ? { paddingLeft: 0 } : {}),
          }}>
            <span style={{ fontSize: '16px', fontWeight: '600', color: s.color }}>{s.val}</span>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{s.label}</span>
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            background: 'var(--red)', border: 'none', borderRadius: '6px',
            padding: '5px 12px', color: '#fff', fontSize: '12px', fontWeight: '500',
            cursor: 'pointer', fontFamily: 'var(--font-display)',
          }}
        >
          <Plus size={12} /> New Incident
        </button>
      </div>

      {/* Main 3-panel layout */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '280px 1fr 260px', overflow: 'hidden' }}>

        {/* LEFT: Incident list */}
        <div style={{ background: 'var(--bg2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: '10px', fontWeight: '500', color: 'var(--muted)', letterSpacing: '0.07em' }}>ALL INCIDENTS</span>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {incidents.map(inc => {
              const c = TYPE_COLORS[inc.type]
              const isActive = selected?.id === inc.id
              return (
                <div
                  key={inc.id}
                  onClick={() => setSelected(isActive ? null : inc)}
                  style={{
                    padding: '10px 14px', borderBottom: '1px solid var(--border)',
                    cursor: 'pointer', transition: 'background 0.12s',
                    background: isActive ? 'var(--bg3)' : 'transparent',
                    borderLeft: isActive ? `2px solid ${c.text}` : '2px solid transparent',
                    opacity: inc.status === 'resolved' ? 0.45 : 1,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{inc.id}</span>
                    <span style={{
                      fontSize: '10px', padding: '1px 6px', borderRadius: '3px',
                      background: c.bg, color: c.text, border: `1px solid ${c.border}`, fontWeight: '500',
                    }}>{c.label}</span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text)', marginBottom: '3px' }}>
                    {inc.type === 'robbery' && 'Armed Robbery'}
                    {inc.type === 'fire' && 'Structure Fire'}
                    {inc.type === 'medical' && 'Medical Emergency'}
                    {inc.type === 'assault' && 'Assault'}
                    {inc.type === 'accident' && 'Road Accident'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: STATUS_COLORS[inc.status] }} />
                      <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{STATUS_LABELS[inc.status]}</span>
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--muted)' }}>{timeAgo(inc.timestamp)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* CENTER: Map */}
        <MapView incidents={incidents} vehicles={vehicles} selectedId={selected?.id || null} />

        {/* RIGHT: Detail panel */}
        <div style={{ background: 'var(--bg2)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {selected ? (
            <>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>{selected.id}</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)', marginBottom: '2px' }}>
                      {selected.type.charAt(0).toUpperCase() + selected.type.slice(1)}
                    </div>
                  </div>
                  <span style={{
                    fontSize: '10px', padding: '2px 7px',
                    background: TYPE_COLORS[selected.type].bg, color: TYPE_COLORS[selected.type].text,
                    border: `1px solid ${TYPE_COLORS[selected.type].border}`, borderRadius: '4px', fontWeight: '500',
                  }}>{STATUS_LABELS[selected.status]}</span>
                </div>
              </div>

              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
                {[
                  { icon: <User size={11} />, label: 'Caller',   val: selected.citizenName },
                  { icon: <MapPin size={11} />, label: 'Location', val: `${selected.latitude.toFixed(4)}, ${selected.longitude.toFixed(4)}` },
                  { icon: <Truck size={11} />, label: 'Unit',     val: selected.assignedUnit || 'Pending assignment' },
                  { icon: <Clock size={11} />, label: 'Logged',   val: timeAgo(selected.timestamp) },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--muted)', minWidth: '70px' }}>
                      {row.icon}
                      <span style={{ fontSize: '11px' }}>{row.label}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text)', fontWeight: '500', textAlign: 'right', maxWidth: '130px' }}>{row.val}</span>
                  </div>
                ))}
                {selected.notes && (
                  <div style={{ marginTop: '4px', padding: '8px', background: 'var(--bg3)', borderRadius: '6px', fontSize: '11px', color: 'var(--muted2)', lineHeight: 1.5 }}>
                    {selected.notes}
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div style={{ padding: '12px 14px', flex: 1, overflowY: 'auto' }}>
                <div style={{ fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.07em', marginBottom: '10px' }}>ACTIVITY</div>
                {[
                  selected.assignedUnit && { dot: 'var(--blue)',  title: 'Unit dispatched', sub: `${selected.assignedUnit} en route` },
                  selected.assignedUnit && { dot: 'var(--amber)', title: 'Auto-assigned',   sub: 'Nearest available unit selected' },
                  { dot: 'var(--muted)', title: 'Incident created', sub: `${timeAgo(selected.timestamp)} by ${selected.createdBy}` },
                ].filter(Boolean).map((item, i, arr) => item && (
                  <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.dot, marginTop: '2px', flexShrink: 0 }} />
                      {i < arr.length - 1 && <div style={{ width: '1px', flex: 1, background: 'var(--border)', marginTop: '3px' }} />}
                    </div>
                    <div style={{ paddingBottom: '4px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text)', marginBottom: '1px' }}>{item.title}</div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{item.sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              {selected.status !== 'resolved' && (
                <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px' }}>
                  <button style={{
                    flex: 1, padding: '7px', background: 'var(--green-bg)',
                    border: '1px solid var(--green-border)', borderRadius: '6px',
                    color: 'var(--green)', fontSize: '11px', fontWeight: '500', cursor: 'pointer', fontFamily: 'var(--font-display)',
                  }}>Mark resolved</button>
                  <button style={{
                    flex: 1, padding: '7px', background: 'var(--bg3)',
                    border: '1px solid var(--border)', borderRadius: '6px',
                    color: 'var(--muted)', fontSize: '11px', cursor: 'pointer', fontFamily: 'var(--font-display)',
                  }}>Reassign</button>
                </div>
              )}
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', gap: '8px' }}>
              <ChevronRight size={24} style={{ opacity: 0.3 }} />
              <span style={{ fontSize: '12px' }}>Select an incident</span>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <NewIncidentModal
          onClose={() => setShowModal(false)}
          onCreated={inc => setIncidents(prev => [inc, ...prev])}
        />
      )}
    </div>
  )
}
