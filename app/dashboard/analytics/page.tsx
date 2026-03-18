'use client'
import { useState, useEffect } from 'react'
import { TrendingDown, Activity, MapPin, Clock } from 'lucide-react'
import { getAnalytics } from '@/lib/api'
import type { AnalyticsSummary } from '@/lib/mock-data'

function BarChart({ data, colorVar }: { data: { label: string; val: number }[]; colorVar: string }) {
  const max = Math.max(...data.map(d => d.val))
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '80px' }}>
      {data.map(d => (
        <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{d.val}</span>
          <div style={{
            width: '100%', borderRadius: '3px 3px 0 0',
            background: colorVar, opacity: 0.8,
            height: `${(d.val / max) * 52}px`, transition: 'height 0.4s ease',
          }} />
          <span style={{ fontSize: '9px', color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', textAlign: 'center' }}>{d.label}</span>
        </div>
      ))}
    </div>
  )
}

function LineChart({ data }: { data: { hour: string; minutes: number }[] }) {
  const max = Math.max(...data.map(d => d.minutes))
  const min = Math.min(...data.map(d => d.minutes))
  const W = 340, H = 80, pad = 10
  const points = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (W - pad * 2)
    const y = H - pad - ((d.minutes - min) / (max - min || 1)) * (H - pad * 2)
    return `${x},${y}`
  })
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
      <polyline points={points.join(' ')} fill="none" stroke="var(--blue)" strokeWidth="1.5" strokeLinejoin="round" />
      {data.map((d, i) => {
        const [x, y] = points[i].split(',').map(Number)
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="3" fill="var(--blue)" />
            <text x={x} y={H} textAnchor="middle" style={{ fontSize: '9px', fill: 'var(--muted)', fontFamily: 'var(--font-display)' }}>{d.hour.slice(0, 5)}</text>
          </g>
        )
      })}
    </svg>
  )
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsSummary | null>(null)

  useEffect(() => { getAnalytics().then(setData) }, [])

  if (!data) return <div style={{ padding: '40px', color: 'var(--muted)', fontSize: '13px' }}>Loading analytics…</div>

  const statCards = [
    { label: 'Total incidents today', val: data.totalIncidentsToday, color: 'var(--text)',  icon: <Activity size={15} /> },
    { label: 'Avg response time',     val: `${data.avgResponseTimeMin}m`,  color: 'var(--amber)', icon: <Clock size={15} /> },
    { label: 'Active incidents',      val: data.activeIncidents,    color: 'var(--red)',   icon: <TrendingDown size={15} /> },
    { label: 'Resolved today',        val: data.resolvedToday,      color: 'var(--green)', icon: <MapPin size={15} /> },
  ]

  return (
    <div style={{ height: 'calc(100vh - 48px)', overflowY: 'auto', padding: '24px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>Analytics & Monitoring</h1>
          <p style={{ fontSize: '12px', color: 'var(--muted)' }}>System-wide operational insights — today</p>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {statCards.map(s => (
            <div key={s.label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.05em' }}>{s.label.toUpperCase()}</span>
                <span style={{ color: s.color, opacity: 0.6 }}>{s.icon}</span>
              </div>
              <span style={{ fontSize: '28px', fontWeight: '700', color: s.color }}>{s.val}</span>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

          {/* Incidents by type */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '18px' }}>
            <div style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text)', marginBottom: '16px' }}>Incidents by type</div>
            <BarChart
              data={data.incidentsByType.map(d => ({ label: d.type, val: d.count }))}
              colorVar="var(--blue)"
            />
          </div>

          {/* Response time trend */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '18px' }}>
            <div style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text)', marginBottom: '16px' }}>Response time trend (min)</div>
            <LineChart data={data.responseTimeTrend} />
          </div>
        </div>

        {/* Incidents by region */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '18px' }}>
          <div style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text)', marginBottom: '16px' }}>Incidents by region</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data.incidentsByRegion.map(r => {
              const max = Math.max(...data.incidentsByRegion.map(x => x.count))
              const pct = (r.count / max) * 100
              return (
                <div key={r.region} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--muted2)', minWidth: '130px' }}>{r.region}</span>
                  <div style={{ flex: 1, height: '6px', background: 'var(--bg4)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'var(--amber)', borderRadius: '3px', transition: 'width 0.5s ease' }} />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text)', minWidth: '24px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{r.count}</span>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
