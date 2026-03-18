import type {
  User, Incident, Vehicle, Hospital,
  PoliceStation, FireStation, AnalyticsSummary, Officer, FirePersonnel
} from "./types";

// ─── Auth mock ───────────────────────────────────────────────────────────────
export const MOCK_USERS: User[] = [
  { id: "u1", name: "Kwame Mensah", email: "kwame@gherp.gov.gh", role: "system_admin" },
  { id: "u2", name: "Dr. Abena Boateng", email: "aboateng@kbth.gov.gh", role: "hospital_admin", station: "Korle Bu Teaching Hospital" },
  { id: "u3", name: "DSP Kofi Asante", email: "kasante@police.gov.gh", role: "police_admin", station: "Accra Central Police Station" },
  { id: "u4", name: "Sgt. Ama Owusu", email: "aowusu@gnfs.gov.gh", role: "fire_admin", station: "Accra Fire Station" },
];

export function mockLogin(email: string, _password: string): User | null {
  return MOCK_USERS.find(u => u.email === email) ?? null;
}

// ─── Incidents ────────────────────────────────────────────────────────────────
export const MOCK_INCIDENTS: Incident[] = [
  {
    id: "INC-0041", citizenName: "Yaw Darko", type: "robbery",
    lat: 5.6502, lng: -0.1872, address: "Madina Market, Accra",
    notes: "2 armed suspects on motorcycle, fled towards Legon road",
    createdBy: "Kwame Mensah", assignedUnit: "Police P-07", status: "dispatched",
    timestamp: "2024-03-15T14:32:00Z", eta: "4 min",
  },
  {
    id: "INC-0040", citizenName: "Efua Mensah", type: "fire",
    lat: 5.6699, lng: -0.0166, address: "Industrial Area, Tema",
    notes: "Warehouse fire, possibly chemicals inside, strong smoke",
    createdBy: "Kwame Mensah", assignedUnit: "Fire T-02", status: "in_progress",
    timestamp: "2024-03-15T14:14:00Z",
  },
  {
    id: "INC-0039", citizenName: "Kojo Amponsah", type: "medical",
    lat: 5.5571, lng: -0.1769, address: "Osu Oxford Street, Accra",
    notes: "Elderly male, unresponsive, suspected cardiac arrest",
    createdBy: "Kwame Mensah", assignedUnit: "Amb A-11", status: "in_progress",
    timestamp: "2024-03-15T14:01:00Z",
  },
  {
    id: "INC-0038", citizenName: "Akosua Frimpong", type: "crime",
    lat: 5.5500, lng: -0.2167, address: "Accra Central Market",
    notes: "Pickpocket report, suspect still in area",
    createdBy: "Kwame Mensah", status: "created",
    timestamp: "2024-03-15T13:48:00Z",
  },
  {
    id: "INC-0037", citizenName: "Nana Acheampong", type: "accident",
    lat: 5.6037, lng: -0.1870, address: "N1 Highway, Near Achimota",
    notes: "3-vehicle collision, 2 injured, traffic blocked",
    createdBy: "Kwame Mensah", assignedUnit: "Amb A-09", status: "resolved",
    timestamp: "2024-03-15T13:01:00Z",
  },
  {
    id: "INC-0036", citizenName: "Fiifi Boateng", type: "fire",
    lat: 5.5480, lng: -0.2060, address: "Kantamanto Market, Accra",
    notes: "Electrical fire in market stalls, spreading fast",
    createdBy: "Kwame Mensah", assignedUnit: "Fire T-01", status: "resolved",
    timestamp: "2024-03-15T11:20:00Z",
  },
];

// ─── Vehicles ─────────────────────────────────────────────────────────────────
export const MOCK_VEHICLES: Vehicle[] = [
  { id: "v1", callSign: "Police P-07", type: "police", stationId: "ps1", stationName: "Accra Central Police", driverName: "Cpl. Osei Bonsu", status: "dispatched", lat: 5.6480, lng: -0.1860, incidentId: "INC-0041" },
  { id: "v2", callSign: "Police P-03", type: "police", stationId: "ps1", stationName: "Accra Central Police", driverName: "Cpl. Adwoa Asante", status: "available", lat: 5.5520, lng: -0.2150 },
  { id: "v3", callSign: "Police P-11", type: "police", stationId: "ps2", stationName: "Madina Police Station", driverName: "Sgt. Kweku Mensah", status: "available", lat: 5.6700, lng: -0.1700 },
  { id: "v4", callSign: "Fire T-02", type: "fire_truck", stationId: "fs1", stationName: "Accra Fire Station", driverName: "Firefighter Kofi Adu", status: "dispatched", lat: 5.6650, lng: -0.0200, incidentId: "INC-0040" },
  { id: "v5", callSign: "Fire T-01", type: "fire_truck", stationId: "fs1", stationName: "Accra Fire Station", driverName: "Firefighter Ama Darko", status: "returning", lat: 5.5500, lng: -0.2050 },
  { id: "v6", callSign: "Fire T-04", type: "fire_truck", stationId: "fs2", stationName: "Tema Fire Station", driverName: "Firefighter Yaw Frimpong", status: "available", lat: 5.6760, lng: -0.0080 },
  { id: "v7", callSign: "Amb A-11", type: "ambulance", stationId: "h1", stationName: "Korle Bu Teaching Hospital", driverName: "EMT Efua Owusu", status: "dispatched", lat: 5.5550, lng: -0.1780, incidentId: "INC-0039" },
  { id: "v8", callSign: "Amb A-09", type: "ambulance", stationId: "h1", stationName: "Korle Bu Teaching Hospital", driverName: "EMT Kwame Boateng", status: "returning", lat: 5.6010, lng: -0.1880 },
  { id: "v9", callSign: "Amb A-03", type: "ambulance", stationId: "h2", stationName: "37 Military Hospital", driverName: "EMT Nana Agyei", status: "available", lat: 5.5910, lng: -0.1950 },
];

// ─── Hospitals ────────────────────────────────────────────────────────────────
export const MOCK_HOSPITALS: Hospital[] = [
  {
    id: "h1", name: "Korle Bu Teaching Hospital",
    address: "Guggisberg Ave, Accra", lat: 5.5360, lng: -0.2290, phone: "+233 30 276 1544",
    beds: [
      { type: "general", total: 180, available: 42 },
      { type: "icu", total: 24, available: 3 },
      { type: "emergency", total: 40, available: 11 },
      { type: "maternity", total: 60, available: 18 },
    ],
    ambulances: MOCK_VEHICLES.filter(v => v.stationId === "h1"),
  },
  {
    id: "h2", name: "37 Military Hospital",
    address: "Liberation Rd, Accra", lat: 5.5890, lng: -0.1970, phone: "+233 30 277 6111",
    beds: [
      { type: "general", total: 100, available: 28 },
      { type: "icu", total: 12, available: 2 },
      { type: "emergency", total: 20, available: 7 },
      { type: "maternity", total: 30, available: 10 },
    ],
    ambulances: MOCK_VEHICLES.filter(v => v.stationId === "h2"),
  },
  {
    id: "h3", name: "Greater Accra Regional Hospital",
    address: "Castle Rd, Accra", lat: 5.5470, lng: -0.2010, phone: "+233 30 266 5401",
    beds: [
      { type: "general", total: 120, available: 65 },
      { type: "icu", total: 8, available: 1 },
      { type: "emergency", total: 16, available: 5 },
      { type: "maternity", total: 40, available: 22 },
    ],
    ambulances: [],
  },
];

// ─── Police Stations ──────────────────────────────────────────────────────────
export const MOCK_OFFICERS: Officer[] = [
  { id: "o1", name: "DSP Kofi Asante", rank: "DSP", badgeNo: "GH-1042", status: "on_duty", stationId: "ps1" },
  { id: "o2", name: "Insp. Abena Owusu", rank: "Inspector", badgeNo: "GH-1103", status: "on_duty", stationId: "ps1" },
  { id: "o3", name: "Cpl. Osei Bonsu", rank: "Corporal", badgeNo: "GH-1287", status: "on_duty", stationId: "ps1" },
  { id: "o4", name: "Cpl. Adwoa Asante", rank: "Corporal", badgeNo: "GH-1301", status: "on_duty", stationId: "ps1" },
  { id: "o5", name: "Const. Kweku Frimpong", rank: "Constable", badgeNo: "GH-1455", status: "off_duty", stationId: "ps1" },
  { id: "o6", name: "Const. Yaa Darko", rank: "Constable", badgeNo: "GH-1462", status: "on_leave", stationId: "ps1" },
  { id: "o7", name: "Sgt. Kweku Mensah", rank: "Sergeant", badgeNo: "GH-2011", status: "on_duty", stationId: "ps2" },
  { id: "o8", name: "Cpl. Ama Boateng", rank: "Corporal", badgeNo: "GH-2034", status: "on_duty", stationId: "ps2" },
];

export const MOCK_POLICE_STATIONS: PoliceStation[] = [
  {
    id: "ps1", name: "Accra Central Police Station",
    address: "Ring Rd Central, Accra", region: "Greater Accra",
    commanderName: "DSP Kofi Asante", phone: "+233 30 266 2231",
    officers: MOCK_OFFICERS.filter(o => o.stationId === "ps1"),
    vehicles: MOCK_VEHICLES.filter(v => v.stationId === "ps1"),
  },
  {
    id: "ps2", name: "Madina Police Station",
    address: "Madina Rd, Accra", region: "Greater Accra",
    commanderName: "Sgt. Kweku Mensah", phone: "+233 30 277 5520",
    officers: MOCK_OFFICERS.filter(o => o.stationId === "ps2"),
    vehicles: MOCK_VEHICLES.filter(v => v.stationId === "ps2"),
  },
];

// ─── Fire Stations ────────────────────────────────────────────────────────────
export const MOCK_FIRE_PERSONNEL: FirePersonnel[] = [
  { id: "fp1", name: "Sgt. Ama Owusu", rank: "Station Officer", status: "on_duty", stationId: "fs1" },
  { id: "fp2", name: "Firefighter Kofi Adu", rank: "Leading Fireman", status: "on_duty", stationId: "fs1" },
  { id: "fp3", name: "Firefighter Ama Darko", rank: "Fireman", status: "on_duty", stationId: "fs1" },
  { id: "fp4", name: "Firefighter Kwesi Appiah", rank: "Fireman", status: "off_duty", stationId: "fs1" },
  { id: "fp5", name: "Firefighter Yaw Frimpong", rank: "Leading Fireman", status: "on_duty", stationId: "fs2" },
  { id: "fp6", name: "Firefighter Akua Mensah", rank: "Fireman", status: "on_duty", stationId: "fs2" },
];

export const MOCK_FIRE_STATIONS: FireStation[] = [
  {
    id: "fs1", name: "Accra Fire Station",
    address: "Liberation Rd, Accra", region: "Greater Accra",
    commanderName: "Sgt. Ama Owusu", phone: "+233 30 222 3333",
    personnel: MOCK_FIRE_PERSONNEL.filter(p => p.stationId === "fs1"),
    vehicles: MOCK_VEHICLES.filter(v => v.stationId === "fs1"),
  },
  {
    id: "fs2", name: "Tema Fire Station",
    address: "Community 1, Tema", region: "Greater Accra",
    commanderName: "Firefighter Yaw Frimpong", phone: "+233 30 320 2244",
    personnel: MOCK_FIRE_PERSONNEL.filter(p => p.stationId === "fs2"),
    vehicles: MOCK_VEHICLES.filter(v => v.stationId === "fs2"),
  },
];

// ─── Analytics ────────────────────────────────────────────────────────────────
export const MOCK_ANALYTICS: AnalyticsSummary = {
  totalIncidents: 284,
  avgResponseTime: "8.4 min",
  resolvedToday: 23,
  activeNow: 4,
  byType: [
    { type: "Medical", count: 98 },
    { type: "Crime", count: 74 },
    { type: "Fire", count: 61 },
    { type: "Robbery", count: 33 },
    { type: "Accident", count: 18 },
  ],
  byRegion: [
    { region: "Accra Central", count: 87 },
    { region: "Tema", count: 54 },
    { region: "Madina", count: 43 },
    { region: "Osu", count: 38 },
    { region: "Achimota", count: 29 },
    { region: "Other", count: 33 },
  ],
  responseTimeTrend: [
    { hour: "08:00", minutes: 11 },
    { hour: "09:00", minutes: 9 },
    { hour: "10:00", minutes: 8 },
    { hour: "11:00", minutes: 7 },
    { hour: "12:00", minutes: 10 },
    { hour: "13:00", minutes: 9 },
    { hour: "14:00", minutes: 7 },
    { hour: "15:00", minutes: 6 },
  ],
};
