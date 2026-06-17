import ContentPage from '@/components/pages/ContentPage'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export const metadata = {
  title: 'Site Content - Silver Shop Admin',
  description: 'Edit the storefront hero banners and homepage sections',
}

export default function ContentRoute() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'editor']}>
      <ContentPage />
    </ProtectedRoute>
  )
}
