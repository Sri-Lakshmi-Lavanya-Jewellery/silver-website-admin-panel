'use client'

import { usePathname } from 'next/navigation'
import { AuthProvider } from '@/contexts/AuthContext'
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
  
  // Check if current route should not have the main layout
  const isAuthPage = pathname === '/login' || pathname === '/unauthorized'
  
  if (isAuthPage) {
    return <>{children}</>
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
