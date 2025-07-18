import EnquiriesPage from '@/components/pages/EnquiriesPage'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export const metadata = {
  title: 'Enquiries - Silver Shop Admin',
  description: 'Manage customer enquiries and support requests',
}

export default function EnquiriesRoute() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'editor']}>
      <EnquiriesPage />
    </ProtectedRoute>
  )
}
