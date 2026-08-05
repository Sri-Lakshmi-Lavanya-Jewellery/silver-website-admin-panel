'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ('admin' | 'editor' | 'viewer')[]
}

export default function ProtectedRoute({ children, allowedRoles = ['admin', 'editor', 'viewer'] }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login')
        return
      }

      if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        router.push('/unauthorized')
        return
      }
    }
  }, [isAuthenticated, isLoading, user, router, allowedRoles])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Router will redirect
  }

  if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return null // Router will redirect
  }

  return <>{children}</>
}
