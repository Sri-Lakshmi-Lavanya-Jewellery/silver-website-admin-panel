'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('🏠 HomePage: Checking auth state...', { isLoading, isAuthenticated })
    
    if (!isLoading) {
      if (isAuthenticated) {
        console.log('✅ HomePage: User authenticated, redirecting to dashboard')
        router.push('/dashboard')
      } else {
        console.log('❌ HomePage: User not authenticated, redirecting to login')
        router.push('/login')
      }
    }
  }, [isAuthenticated, isLoading, router])

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

  return null // Will redirect
}
