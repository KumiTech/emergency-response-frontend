'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { ROLE_ROUTES } from '@/lib/auth-context'

export default function Home() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  useEffect(() => {
    if (!isLoading) {
      router.replace(user ? ROLE_ROUTES[user.role] : '/login')
    }
  }, [user, isLoading, router])
  return null
}
