// ─────────────────────────────────────────────
//  API SERVICE LAYER
//  All functions return mock data now.
//  To connect real backend: replace the mock
//  return with fetch() to your microservice URL.
//
//  Example swap:
//    BEFORE: return MOCK_INCIDENTS
//    AFTER:  return await fetch(`${API_BASE}/incidents`).then(r => r.json())
// ─────────────────────────────────────────────

import {
  MOCK_USERS, MOCK_INCIDENTS, MOCK_VEHICLES,
  MOCK_HOSPITAL, MOCK_POLICE_STATION, MOCK_FIRE_STATION,
  MOCK_ANALYTICS,
  type Role, type Incident,
} from './mock-data'

// Base URLs — set via environment variables when backend is ready
export const API_URLS = {
  auth:      process.env.NEXT_PUBLIC_AUTH_API      || 'http://localhost:4001',
  incidents: process.env.NEXT_PUBLIC_INCIDENTS_API || 'http://localhost:4002',
  dispatch:  process.env.NEXT_PUBLIC_DISPATCH_API  || 'http://localhost:4003',
  analytics: process.env.NEXT_PUBLIC_ANALYTICS_API || 'http://localhost:4004',
}

// ── Auth Service ─────────────────────────────
export async function loginUser(email: string, password: string) {
  // REAL: POST ${API_URLS.auth}/auth/login
  await new Promise(r => setTimeout(r, 600)) // simulate latency
  const user = MOCK_USERS.find(u => u.email === email && u.password === password)
  if (!user) throw new Error('Invalid credentials')
  return {
    token: `mock-jwt-${user.role}-${Date.now()}`,
    user:  { name: user.name, email: user.email, role: user.role },
  }
}

export async function getProfile(token: string) {
  // REAL: GET ${API_URLS.auth}/auth/profile  (Authorization: Bearer token)
  const role = token.split('-')[2] as Role
  const user = MOCK_USERS.find(u => u.role === role)
  return user ? { name: user.name, email: user.email, role: user.role } : null
}

// ── Incident Service ──────────────────────────
export async function getIncidents() {
  // REAL: GET ${API_URLS.incidents}/incidents/open
  return MOCK_INCIDENTS
}

export async function getIncident(id: string) {
  // REAL: GET ${API_URLS.incidents}/incidents/:id
  return MOCK_INCIDENTS.find(i => i.id === id) || null
}

export async function createIncident(data: Omit<Incident, 'id' | 'status' | 'timestamp' | 'assignedUnit'>) {
  // REAL: POST ${API_URLS.incidents}/incidents
  return {
    ...data,
    id:          `INC-${String(Date.now()).slice(-4)}`,
    assignedUnit: null,
    status:      'created' as const,
    timestamp:   new Date().toISOString(),
  }
}

export async function updateIncidentStatus(id: string, status: Incident['status']) {
  // REAL: PUT ${API_URLS.incidents}/incidents/:id/status
  return { id, status }
}

// ── Dispatch Tracking Service ─────────────────
export async function getVehicles() {
  // REAL: GET ${API_URLS.dispatch}/vehicles
  return MOCK_VEHICLES
}

export async function getVehicleLocation(vehicleId: string) {
  // REAL: GET ${API_URLS.dispatch}/vehicles/:id/location
  return MOCK_VEHICLES.find(v => v.id === vehicleId) || null
}

// WS connection helper — swap URL when backend ready
export function createDispatchSocket(onMessage: (data: unknown) => void) {
  // REAL: return new WebSocket(`${API_URLS.dispatch.replace('http','ws')}/ws`)
  // For now returns a mock that never fires (static map)
  return {
    close: () => {},
    onmessage: null,
  }
}

// ── Hospital Service ──────────────────────────
export async function getHospital() {
  // REAL: GET ${API_URLS.dispatch}/hospital  (or dedicated hospital service)
  return MOCK_HOSPITAL
}

export async function updateBedCapacity(hospitalId: string, available: number) {
  // REAL: PUT .../hospital/:id/capacity
  return { hospitalId, available }
}

export async function updateAmbulanceStatus(ambId: string, status: string) {
  // REAL: PUT .../ambulances/:id/status
  return { ambId, status }
}

// ── Police Service ────────────────────────────
export async function getPoliceStation() {
  // REAL: GET .../police-station
  return MOCK_POLICE_STATION
}

export async function updateOfficerStatus(officerId: string, status: string) {
  // REAL: PUT .../officers/:id/status
  return { officerId, status }
}

// ── Fire Service ──────────────────────────────
export async function getFireStation() {
  // REAL: GET .../fire-station
  return MOCK_FIRE_STATION
}

// ── Analytics Service ─────────────────────────
export async function getAnalytics() {
  // REAL: GET ${API_URLS.analytics}/analytics/response-times
  //       GET ${API_URLS.analytics}/analytics/incidents-by-region
  //       GET ${API_URLS.analytics}/analytics/resource-utilization
  return MOCK_ANALYTICS
}
