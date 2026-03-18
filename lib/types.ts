export type Role = "system_admin" | "hospital_admin" | "police_admin" | "fire_admin";

export type IncidentType = "robbery" | "crime" | "fire" | "medical" | "accident";
export type IncidentStatus = "created" | "dispatched" | "in_progress" | "resolved";
export type VehicleStatus = "available" | "dispatched" | "returning" | "maintenance";
export type BedType = "general" | "icu" | "emergency" | "maternity";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  station?: string;
}

export interface Incident {
  id: string;
  citizenName: string;
  type: IncidentType;
  lat: number;
  lng: number;
  address: string;
  notes: string;
  createdBy: string;
  assignedUnit?: string;
  status: IncidentStatus;
  timestamp: string;
  eta?: string;
}

export interface Vehicle {
  id: string;
  callSign: string;
  type: "police" | "ambulance" | "fire_truck";
  stationId: string;
  stationName: string;
  driverName: string;
  status: VehicleStatus;
  lat: number;
  lng: number;
  incidentId?: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  beds: { type: BedType; total: number; available: number }[];
  ambulances: Vehicle[];
  phone: string;
}

export interface PoliceStation {
  id: string;
  name: string;
  address: string;
  region: string;
  commanderName: string;
  officers: Officer[];
  vehicles: Vehicle[];
  phone: string;
}

export interface Officer {
  id: string;
  name: string;
  rank: string;
  badgeNo: string;
  status: "on_duty" | "off_duty" | "on_leave";
  stationId: string;
}

export interface FireStation {
  id: string;
  name: string;
  address: string;
  region: string;
  commanderName: string;
  personnel: FirePersonnel[];
  vehicles: Vehicle[];
  phone: string;
}

export interface FirePersonnel {
  id: string;
  name: string;
  rank: string;
  status: "on_duty" | "off_duty" | "on_leave";
  stationId: string;
}

export interface AnalyticsSummary {
  totalIncidents: number;
  avgResponseTime: string;
  resolvedToday: number;
  activeNow: number;
  byType: { type: string; count: number }[];
  byRegion: { region: string; count: number }[];
  responseTimeTrend: { hour: string; minutes: number }[];
}
