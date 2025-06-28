import AnalyticsPage from '@/components/pages/AnalyticsPage'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export const metadata = {
  title: 'Analytics - Silver Shop Admin',
  description: 'View analytics and insights',
}

export default function AnalyticsRoute() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'editor', 'viewer']}>
      <AnalyticsPage />
    </ProtectedRoute>
  )
}
