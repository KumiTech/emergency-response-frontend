"use client";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

export type Role =
  | "system_admin"
  | "hospital_admin"
  | "police_admin"
  | "fire_admin"
  | "ambulance_driver";

interface AuthUser {
  user_id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<AuthUser>;

  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const ROLE_ROUTES: Record<string, string> = {
  system_admin: "/dashboard/dispatch",
  hospital_admin: "/dashboard/hospital",
  police_admin: "/dashboard/police",
  fire_admin: "/dashboard/fire",
  ambulance_driver: "/dashboard/dispatch",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    try {
      const storedToken = localStorage.getItem("erpToken");
      const storedUser = localStorage.getItem("erpUser");
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser) as AuthUser);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  async function login(email: string, password: string): Promise<AuthUser> {
    const API_BASE =
      process.env.NEXT_PUBLIC_API_URL ||
         "https://emergency-api-gateway-hq5m.onrender.com";

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < 10; attempt++) {
      try {
        // --- LASER-FOCUSED WAKE UP ---
        // Only wake up the Auth service! Leave the others sleeping to save Render hours.
        try {
          const healthRes = await fetch(`${API_BASE}/health`);
          const healthData = await healthRes.json();
          if (healthData?.services?.auth) {
            fetch(`${healthData.services.auth}/health`, { mode: 'no-cors' }).catch(() => null);
          }
        } catch (e) {}
        // -----------------------------

        const res = await fetch(`${API_BASE}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (res.status >= 500) {
          lastError = new Error("Server starting up");
          await new Promise((r) => setTimeout(r, 6000));
          continue;
        }

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "Invalid credentials");
        }

        const data = await res.json();

        const typedUser: AuthUser = {
          user_id: data.data.user.user_id,
          name: data.data.user.name,
          email: data.data.user.email,
          role: data.data.user.role as Role,
        };

        setUser(typedUser);
        setToken(data.data.accessToken);
        localStorage.setItem("erpToken", data.data.accessToken);
        localStorage.setItem("erpRefreshToken", data.data.refreshToken);
        localStorage.setItem("erpUser", JSON.stringify(typedUser));

        return typedUser;
      } catch (err) {
        if (err instanceof Error && err.message === "Server starting up") {
          continue;
        }
        if (err instanceof TypeError) {
          lastError = new Error("Server starting up");
          await new Promise((r) => setTimeout(r, 6000));
          continue;
        }
        throw err;
      }
    }

    throw lastError || new Error("Server is unavailable, please try again");
  }





  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem("erpToken");
    localStorage.removeItem("erpRefreshToken");
    localStorage.removeItem("erpUser");
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
