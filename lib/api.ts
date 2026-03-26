import axios from "axios";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://emergency-api-gateway-hq5m.onrender.com";

// ── Types ─────────────────────────────────────
export type Role =
  | "system_admin"
  | "hospital_admin"
  | "police_admin"
  | "fire_admin"
  | "ambulance_driver";

export interface AuthUser {
  user_id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Incident {
  incident_id: string;
  citizen_name: string;
  incident_type: string;
  latitude: number;
  longitude: number;
  notes: string;
  created_by: string;
  assigned_unit_id: string;
  assigned_unit_type: string;
  hospital_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  responder_name?: string;
  hospital_name?: string;
}

export interface Responder {
  responder_id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  is_available: boolean;
  hospital_id: string | null;
  contact_phone: string;
  region: string;
  created_at: string;
}

export interface Hospital {
  hospital_id: string;
  name: string;
  latitude: number;
  longitude: number;
  total_beds: number;
  available_beds: number;
  created_at: string;
}

export interface Vehicle {
  vehicle_id: string;
  plate_number: string;
  vehicle_type: string;
  station_id: string | null;
  driver_id: string | null;
  status: string;
  current_lat: number | null;
  current_lng: number | null;
  last_seen: string | null;
  created_at: string;
}

export interface Dispatch {
  dispatch_id: string;
  vehicle_id: string;
  incident_id: string;
  dispatched_at: string;
  arrived_at: string | null;
  resolved_at: string | null;
  status: string;
  response_time_sec: number | null;
  plate_number?: string;
  vehicle_type?: string;
}

export interface AnalyticsSummary {
  total: string;
  created: string;
  dispatched: string;
  in_progress: string;
  resolved: string;
  medical: string;
  fire: string;
  crime: string;
  accident: string;
  other: string;
}

export interface ResponseTimeMetric {
  incident_type: string;
  region: string;
  total_incidents: string;
  avg_duration_sec: number;
  min_duration_sec: number;
  max_duration_sec: number;
}

export interface RegionMetric {
  region: string;
  incident_type: string;
  total: string;
  resolved: string;
  active: string;
}

export interface ResourceUtilization {
  responder_id: string;
  responder_name: string;
  responder_type: string;
  total_deployments: string;
  last_active: string;
}

export interface HospitalCapacity {
  hospital_id: string;
  hospital_name: string;
  avg_available_beds: number;
  min_available_beds: number;
  total_beds: number;
  total_records: string;
  last_updated: string;
}

// ── Axios instance ────────────────────────────
export const api = axios.create({

  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("erpToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  async (error: any) => {
    const config = error.config;
    
    // Silent retry for 5xx errors or network connect errors
    if (config && (!error.response || error.response.status >= 500)) {
      config.__retryCount = config.__retryCount || 0;
      if (config.__retryCount < 10) {
        config.__retryCount += 1;
        
        // --- LASER-FOCUSED WAKE-UP ---
        // Look at the URL that failed, and wake up ONLY that specific service!
        try {
          const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://emergency-api-gateway-hq5m.onrender.com";
          const healthRes = await fetch(`${API_BASE}/health`);
          const data = await healthRes.json();
          
          if (data && data.services) {
             const requestUrl = config.url || "";
             if (requestUrl.includes("/api/incidents") && data.services.incident) {
               fetch(`${data.services.incident}/health`, { mode: 'no-cors' }).catch(() => null);
             }
             if (requestUrl.includes("/api/vehicles") || requestUrl.includes("/api/dispatches")) {
               if (data.services.dispatch) fetch(`${data.services.dispatch}/health`, { mode: 'no-cors' }).catch(() => null);
             }
             if (requestUrl.includes("/api/analytics") && data.services.analytics) {
               fetch(`${data.services.analytics}/health`, { mode: 'no-cors' }).catch(() => null);
             }
          }
        } catch(e) {}
        // -----------------------------

        await new Promise((resolve) => setTimeout(resolve, 6000));
        return api(config);
      }
    }

    if (axios.isAxiosError(error)) {
      let message = error.response?.data?.message || error.message || "Request failed";
      if (!error.response || error.response.status >= 500) {
        message = "Services are currently taking a while to wake up. Please refresh the page in a moment.";
      }
      throw new Error(message);
    }
    throw new Error("An unexpected error occurred");
  }
);



// ── Helper type ───────────────────────────────
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ── Auth ──────────────────────────────────────
export async function loginUser(email: string, password: string) {
  const data = await api.post<
    never,
    ApiResponse<{ accessToken: string; refreshToken: string; user: AuthUser }>
  >("/api/auth/login", { email, password });
  return {
    token: data.data.accessToken,
    refreshToken: data.data.refreshToken,
    user: data.data.user,
  };
}

export async function getProfile() {
  const data = await api.get<never, ApiResponse<AuthUser>>("/api/auth/profile");
  return data.data;
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
  role: string,
) {
  const data = await api.post<never, ApiResponse<AuthUser>>(
    "/api/auth/register",
    { name, email, password, role },
  );
  return data.data;
}

// ── Incidents ─────────────────────────────────
export async function getIncidents(filters?: {
  status?: string;
  incident_type?: string;
}) {
  const data = await api.get<never, ApiResponse<Incident[]>>("/api/incidents", {
    params: filters,
  });
  return data.data;
}

export async function getOpenIncidents() {
  const data = await api.get<never, ApiResponse<Incident[]>>(
    "/api/incidents/open",
  );
  return data.data;
}

export async function getIncident(id: string) {
  const data = await api.get<never, ApiResponse<Incident>>(
    `/api/incidents/${id}`,
  );
  return data.data;
}

export async function createIncident(payload: {
  citizen_name: string;
  incident_type: string;
  latitude: number;
  longitude: number;
  notes?: string;
}) {
  const data = await api.post<never, ApiResponse<{ incident: Incident }>>(
    "/api/incidents",
    payload,
  );
  return data.data;
}

export async function updateIncidentStatus(id: string, status: string) {
  const data = await api.put<never, ApiResponse<Incident>>(
    `/api/incidents/${id}/status`,
    { status },
  );
  return data.data;
}

export async function assignResponder(
  id: string,
  responder_id: string,
  hospital_id?: string,
) {
  const data = await api.put<never, ApiResponse<Incident>>(
    `/api/incidents/${id}/assign`,
    { responder_id, hospital_id },
  );
  return data.data;
}

// ── Responders ────────────────────────────────
export async function getResponders() {
  const data = await api.get<never, ApiResponse<Responder[]>>(
    "/api/responders",
  );
  return data.data;
}

export async function registerResponder(payload: {
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  hospital_id?: string;
  contact_phone?: string;
  region?: string;
}) {
  const data = await api.post<never, ApiResponse<Responder>>(
    "/api/responders",
    payload,
  );
  return data.data;
}

export async function updateResponder(id: string, payload: Partial<Responder>) {
  const data = await api.put<never, ApiResponse<Responder>>(
    `/api/responders/${id}`,
    payload,
  );
  return data.data;
}

// ── Hospitals ─────────────────────────────────
export async function getHospitals() {
  const data = await api.get<never, ApiResponse<Hospital[]>>("/api/hospitals");
  return data.data;
}

export async function createHospital(payload: {
  name: string;
  latitude: number;
  longitude: number;
  total_beds: number;
  available_beds: number;
}) {
  const data = await api.post<never, ApiResponse<Hospital>>(
    "/api/hospitals",
    payload,
  );
  return data.data;
}

export async function updateHospitalCapacity(
  id: string,
  total_beds: number,
  available_beds: number,
) {
  const data = await api.put<never, ApiResponse<Hospital>>(
    `/api/hospitals/${id}/capacity`,
    { total_beds, available_beds },
  );
  return data.data;
}

// ── Vehicles ──────────────────────────────────
export async function getVehicles() {
  const data = await api.get<never, ApiResponse<Vehicle[]>>("/api/vehicles");
  return data.data;
}

export async function getVehicle(id: string) {
  const data = await api.get<never, ApiResponse<Vehicle>>(
    `/api/vehicles/${id}`,
  );
  return data.data;
}

export async function registerVehicle(payload: {
  plate_number: string;
  vehicle_type: string;
  station_id?: string;
  driver_id?: string;
}) {
  const data = await api.post<never, ApiResponse<Vehicle>>(
    "/api/vehicles/register",
    payload,
  );
  return data.data;
}

export async function getVehicleLocation(id: string) {
  const data = await api.get<
    never,
    ApiResponse<{
      vehicle_id: string;
      lat: number;
      lng: number;
      last_seen: string;
    }>
  >(`/api/vehicles/${id}/location`);
  return data.data;
}

export async function pushVehicleLocation(
  id: string,
  payload: {
    lat: number;
    lng: number;
    speed_kmh?: number;
    incident_id?: string;
  },
) {
  const data = await api.post<
    never,
    ApiResponse<{ vehicle_id: string; lat: number; lng: number }>
  >(`/api/vehicles/${id}/location`, payload);
  return data.data;
}

// ── Dispatches ────────────────────────────────
export async function getDispatches() {
  const data = await api.get<never, ApiResponse<Dispatch[]>>("/api/dispatches");
  return data.data;
}

export async function getDispatch(id: string) {
  const data = await api.get<never, ApiResponse<Dispatch>>(
    `/api/dispatches/${id}`,
  );
  return data.data;
}

export async function updateDispatchStatus(id: string, status: string) {
  const data = await api.put<never, ApiResponse<Dispatch>>(
    `/api/dispatches/${id}/status`,
    { status },
  );
  return data.data;
}

// ── Analytics ─────────────────────────────────
export async function getAnalyticsSummary() {
  const data = await api.get<never, ApiResponse<AnalyticsSummary>>(
    "/api/analytics/incidents/summary",
  );
  return data.data;
}

export async function getResponseTimes() {
  const data = await api.get<never, ApiResponse<ResponseTimeMetric[]>>(
    "/api/analytics/response-times",
  );
  return data.data;
}

export async function getIncidentsByRegion() {
  const data = await api.get<never, ApiResponse<RegionMetric[]>>(
    "/api/analytics/incidents-by-region",
  );
  return data.data;
}

export async function getResourceUtilization() {
  const data = await api.get<never, ApiResponse<ResourceUtilization[]>>(
    "/api/analytics/resource-utilization",
  );
  return data.data;
}

export async function getHospitalCapacityAnalytics() {
  const data = await api.get<never, ApiResponse<HospitalCapacity[]>>(
    "/api/analytics/hospital-capacity",
  );
  return data.data;
}

export async function getTopResponders() {
  const data = await api.get<never, ApiResponse<ResourceUtilization[]>>(
    "/api/analytics/top-responders",
  );
  return data.data;
}

// ── WebSocket ─────────────────────────────────
export function createDispatchSocket(
  incidentId: string,
  onLocationUpdate: (data: unknown) => void,
  onStatusChange: (data: unknown) => void,
) {
  const WS_URL =
    process.env.NEXT_PUBLIC_DISPATCH_WS_URL ||
        "https://emergency-dispatch-service-8ymi.onrender.com";


  import("socket.io-client").then(({ io }) => {
    const socket = io(WS_URL, {
      path: "/socket.io",
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      socket.emit("join:incident", { incident_id: incidentId });
    });

    socket.on("vehicle:location:update", onLocationUpdate);
    socket.on("dispatch:status:changed", onStatusChange);
  });
}
