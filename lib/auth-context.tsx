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
      "https://emergency-api-gateway.onrender.com";

    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");

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
