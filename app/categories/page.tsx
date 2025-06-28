import CategoriesPage from '@/components/pages/CategoriesPage'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export const metadata = {
  title: 'Categories - Silver Shop Admin',
  description: 'Manage product categories and organization',
}

export default function CategoriesRoute() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'editor']}>
      <CategoriesPage />
    </ProtectedRoute>
  )
}
