'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import type { Role } from '@/lib/mock-data'

interface AuthUser {
  name: string
  email: string
  role: Role
}

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  login: (user: AuthUser, token: string) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

const ROLE_ROUTES: Record<Role, string> = {
  system_admin:   '/dashboard/dispatch',
  hospital_admin: '/dashboard/hospital',
  police_admin:   '/dashboard/police',
  fire_admin:     '/dashboard/fire',
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(null)
  const [token, setToken]     = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedToken = localStorage.getItem('erpToken')
    const storedUser  = localStorage.getItem('erpUser')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  function login(user: AuthUser, token: string) {
    setUser(user)
    setToken(token)
    localStorage.setItem('erpToken', token)
    localStorage.setItem('erpUser',  JSON.stringify(user))
    router.push(ROLE_ROUTES[user.role])
  }

  function logout() {
    setUser(null)
    setToken(null)
    localStorage.removeItem('erpToken')
    localStorage.removeItem('erpUser')
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export { ROLE_ROUTES }
