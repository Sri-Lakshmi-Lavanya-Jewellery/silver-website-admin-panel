'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { AppProvider } from '@/contexts/AppContext'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

interface ProviderWrapperProps {
  children: React.ReactNode
}

export default function ProviderWrapper({ children }: ProviderWrapperProps) {
  return (
    <AuthProvider>
      <AppProvider>
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
      </AppProvider>
    </AuthProvider>
  )
}

function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  // Auth pages render bare (no sidebar/header shell).
  const isAuthPage = pathname === '/login' || pathname === '/unauthorized'

  // Redirect unauthenticated visitors on protected routes to the login page.
  // (Kept here so the shell never mounts for them, in addition to per-page
  // ProtectedRoute guards.)
  useEffect(() => {
    if (!isAuthPage && !isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthPage, isLoading, isAuthenticated, router])

  if (isAuthPage) {
    return <>{children}</>
  }

  // While auth state is still resolving, show a lightweight loader instead of
  // flashing the full admin shell to a not-yet-authenticated visitor.
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    )
  }

  // Not authenticated on a protected route: don't render the shell at all.
  // ProtectedRoute (rendered inside each page) performs the redirect to /login.
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
