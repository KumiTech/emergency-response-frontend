// ─────────────────────────────────────────────
//  STATIC MOCK DATA
//  Swap these with real API responses later.
//  All shapes mirror the API contract exactly.
// ─────────────────────────────────────────────

export type Role = 'system_admin' | 'hospital_admin' | 'police_admin' | 'fire_admin'

export type IncidentStatus = 'created' | 'dispatched' | 'in_progress' | 'resolved'
export type IncidentType   = 'robbery' | 'assault' | 'fire' | 'medical' | 'accident'

export interface Incident {
  id: string
  citizenName: string
  type: IncidentType
  latitude: number
  longitude: number
  notes: string
  createdBy: string
  assignedUnit: string | null
  status: IncidentStatus
  timestamp: string
}

export interface Vehicle {
  id: string
  label: string
  type: 'ambulance' | 'police' | 'fire'
  latitude: number
  longitude: number
  status: 'available' | 'dispatched' | 'returning'
  incidentId: string | null
}

export interface Hospital {
  id: string
  name: string
  totalBeds: number
  availableBeds: number
  icuTotal: number
  icuAvailable: number
  ambulances: Ambulance[]
}

export interface Ambulance {
  id: string
  plateNumber: string
  driverName: string
  status: 'available' | 'dispatched' | 'maintenance' | 'returning'
  latitude: number
  longitude: number
}

export interface PoliceStation {
  id: string
  name: string
  location: string
  officers: Officer[]
  vehicles: PoliceVehicle[]
}

export interface Officer {
  id: string
  name: string
  rank: string
  badge: string
  status: 'on_duty' | 'off_duty' | 'deployed'
}

export interface PoliceVehicle {
  id: string
  plateNumber: string
  type: string
  status: 'available' | 'deployed' | 'maintenance'
}

export interface FireStation {
  id: string
  name: string
  location: string
  personnel: FirePersonnel[]
  trucks: FireTruck[]
}

export interface FirePersonnel {
  id: string
  name: string
  role: string
  status: 'on_duty' | 'off_duty' | 'deployed'
}

export interface FireTruck {
  id: string
  plateNumber: string
  type: string
  status: 'available' | 'deployed' | 'maintenance'
}

export interface AnalyticsSummary {
  totalIncidentsToday: number
  avgResponseTimeMin: number
  activeIncidents: number
  resolvedToday: number
  incidentsByType: { type: string; count: number }[]
  incidentsByRegion: { region: string; count: number }[]
  responseTimeTrend: { hour: string; minutes: number }[]
}

// ── Mock Users ──────────────────────────────
export const MOCK_USERS = [
  { email: 'dispatch@ghana.gov', password: 'admin123', role: 'system_admin'  as Role, name: 'Kwame Mensah' },
  { email: 'hospital@korle.gh',  password: 'admin123', role: 'hospital_admin' as Role, name: 'Dr. Abena Asante' },
  { email: 'police@accra.gh',    password: 'admin123', role: 'police_admin'   as Role, name: 'Insp. Kofi Boateng' },
  { email: 'fire@accra.gh',      password: 'admin123', role: 'fire_admin'     as Role, name: 'Chief Yaw Darko' },
]

// ── Mock Incidents ───────────────────────────
export const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'INC-0041', citizenName: 'Kofi Asante', type: 'robbery',
    latitude: 5.6802, longitude: -0.1623, notes: '2 suspects, armed with knives',
    createdBy: 'Kwame Mensah', assignedUnit: 'Police P-07',
    status: 'dispatched', timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
  },
  {
    id: 'INC-0040', citizenName: 'Ama Owusu', type: 'fire',
    latitude: 5.6691, longitude: -0.0172, notes: 'Factory warehouse, spreading fast',
    createdBy: 'Kwame Mensah', assignedUnit: 'Fire T-02',
    status: 'in_progress', timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
  },
  {
    id: 'INC-0039', citizenName: 'Efua Darko', type: 'medical',
    latitude: 5.5571, longitude: -0.1861, notes: 'Male, 60s, chest pain, conscious',
    createdBy: 'Kwame Mensah', assignedUnit: 'Amb A-11',
    status: 'in_progress', timestamp: new Date(Date.now() - 31 * 60000).toISOString(),
  },
  {
    id: 'INC-0038', citizenName: 'Nana Osei', type: 'assault',
    latitude: 5.5483, longitude: -0.2082, notes: 'Victim at scene, needs immediate response',
    createdBy: 'Kwame Mensah', assignedUnit: null,
    status: 'created', timestamp: new Date(Date.now() - 44 * 60000).toISOString(),
  },
  {
    id: 'INC-0037', citizenName: 'Yaa Bonsu', type: 'accident',
    latitude: 5.6037, longitude: -0.1870, notes: '3 vehicles involved, 1 injured',
    createdBy: 'Kwame Mensah', assignedUnit: 'Amb A-09',
    status: 'resolved', timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
  },
  {
    id: 'INC-0036', citizenName: 'Kojo Frimpong', type: 'fire',
    latitude: 5.5960, longitude: -0.2310, notes: 'Residential building, ground floor',
    createdBy: 'Kwame Mensah', assignedUnit: 'Fire T-01',
    status: 'resolved', timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
  },
]

// ── Mock Vehicles ────────────────────────────
export const MOCK_VEHICLES: Vehicle[] = [
  { id: 'P-07', label: 'Police P-07', type: 'police',    latitude: 5.6710, longitude: -0.1700, status: 'dispatched', incidentId: 'INC-0041' },
  { id: 'T-02', label: 'Fire T-02',   type: 'fire',      latitude: 5.6720, longitude: -0.0300, status: 'dispatched', incidentId: 'INC-0040' },
  { id: 'A-11', label: 'Amb A-11',    type: 'ambulance', latitude: 5.5620, longitude: -0.1900, status: 'dispatched', incidentId: 'INC-0039' },
  { id: 'P-03', label: 'Police P-03', type: 'police',    latitude: 5.5900, longitude: -0.2100, status: 'available',  incidentId: null },
  { id: 'A-09', label: 'Amb A-09',    type: 'ambulance', latitude: 5.6100, longitude: -0.1800, status: 'returning',  incidentId: null },
]

// ── Mock Hospital ────────────────────────────
export const MOCK_HOSPITAL: Hospital = {
  id: 'H-001', name: 'Korle Bu Teaching Hospital',
  totalBeds: 240, availableBeds: 38,
  icuTotal: 20, icuAvailable: 4,
  ambulances: [
    { id: 'A-11', plateNumber: 'GR-2341-21', driverName: 'Emmanuel Tetteh', status: 'dispatched', latitude: 5.5620, longitude: -0.1900 },
    { id: 'A-12', plateNumber: 'GR-1122-20', driverName: 'Akosua Mensah',   status: 'available',  latitude: 5.5488, longitude: -0.2060 },
    { id: 'A-09', plateNumber: 'GR-0987-19', driverName: 'Bright Asare',    status: 'returning',  latitude: 5.6100, longitude: -0.1800 },
    { id: 'A-14', plateNumber: 'GR-3344-22', driverName: 'Gifty Owusu',     status: 'maintenance',latitude: 5.5488, longitude: -0.2060 },
  ],
}

// ── Mock Police Station ──────────────────────
export const MOCK_POLICE_STATION: PoliceStation = {
  id: 'PS-001', name: 'Accra Central Police Station', location: 'Ring Road Central, Accra',
  officers: [
    { id: 'O-01', name: 'Sgt. Ama Boateng',    rank: 'Sergeant',   badge: 'AC-0041', status: 'on_duty' },
    { id: 'O-02', name: 'Cpl. Yaw Ansah',      rank: 'Corporal',   badge: 'AC-0042', status: 'deployed' },
    { id: 'O-03', name: 'Const. Efua Mensah',  rank: 'Constable',  badge: 'AC-0043', status: 'off_duty' },
    { id: 'O-04', name: 'Insp. Kofi Boateng',  rank: 'Inspector',  badge: 'AC-0044', status: 'on_duty' },
    { id: 'O-05', name: 'Sgt. Nana Adjei',     rank: 'Sergeant',   badge: 'AC-0045', status: 'deployed' },
    { id: 'O-06', name: 'Const. Abena Quaye',  rank: 'Constable',  badge: 'AC-0046', status: 'on_duty' },
  ],
  vehicles: [
    { id: 'P-07', plateNumber: 'GP-1234-20', type: 'Patrol Car',  status: 'deployed' },
    { id: 'P-03', plateNumber: 'GP-5678-19', type: 'Patrol Car',  status: 'available' },
    { id: 'P-01', plateNumber: 'GP-9999-21', type: 'Land Cruiser', status: 'available' },
    { id: 'P-08', plateNumber: 'GP-0011-22', type: 'Motorcycle',  status: 'maintenance' },
  ],
}

// ── Mock Fire Station ────────────────────────
export const MOCK_FIRE_STATION: FireStation = {
  id: 'FS-001', name: 'Accra Central Fire Station', location: 'Barnes Road, Accra',
  personnel: [
    { id: 'F-01', name: 'Chief Yaw Darko',     role: 'Station Commander', status: 'on_duty' },
    { id: 'F-02', name: 'FF Ama Osei',         role: 'Firefighter',       status: 'deployed' },
    { id: 'F-03', name: 'FF Kweku Asante',     role: 'Firefighter',       status: 'deployed' },
    { id: 'F-04', name: 'FF Adjoa Mensah',     role: 'Firefighter',       status: 'on_duty' },
    { id: 'F-05', name: 'FF Nii Laryea',       role: 'Driver Operator',   status: 'off_duty' },
    { id: 'F-06', name: 'FF Akua Frimpong',    role: 'Firefighter',       status: 'on_duty' },
  ],
  trucks: [
    { id: 'T-01', plateNumber: 'GF-0011-18', type: 'Pumper Truck',   status: 'available' },
    { id: 'T-02', plateNumber: 'GF-0022-19', type: 'Aerial Ladder',  status: 'deployed' },
    { id: 'T-03', plateNumber: 'GF-0033-21', type: 'Rescue Truck',   status: 'available' },
    { id: 'T-04', plateNumber: 'GF-0044-20', type: 'Water Tanker',   status: 'maintenance' },
  ],
}

// ── Mock Analytics ───────────────────────────
export const MOCK_ANALYTICS: AnalyticsSummary = {
  totalIncidentsToday: 31,
  avgResponseTimeMin: 8.4,
  activeIncidents: 4,
  resolvedToday: 23,
  incidentsByType: [
    { type: 'Medical',  count: 12 },
    { type: 'Crime',    count: 9  },
    { type: 'Fire',     count: 6  },
    { type: 'Accident', count: 4  },
  ],
  incidentsByRegion: [
    { region: 'Accra Central', count: 10 },
    { region: 'Tema',          count: 7  },
    { region: 'Madina',        count: 6  },
    { region: 'Osu',           count: 5  },
    { region: 'Lapaz',         count: 3  },
  ],
  responseTimeTrend: [
    { hour: '08:00', minutes: 11 },
    { hour: '09:00', minutes: 9  },
    { hour: '10:00', minutes: 7  },
    { hour: '11:00', minutes: 8  },
    { hour: '12:00', minutes: 12 },
    { hour: '13:00', minutes: 9  },
    { hour: '14:00', minutes: 7  },
    { hour: '15:00', minutes: 6  },
  ],
}
