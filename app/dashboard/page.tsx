import Dashboard from '@/components/pages/Dashboard'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export const metadata = {
  title: 'Dashboard - Silver Shop Admin',
  description: 'Silver shop admin dashboard overview',
}

export default function DashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'editor', 'viewer']}>
      <Dashboard />
    </ProtectedRoute>
  )
}
