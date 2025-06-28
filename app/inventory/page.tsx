import InventoryPage from '@/components/pages/InventoryPage'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export const metadata = {
  title: 'Inventory - Silver Shop Admin',
  description: 'Manage inventory and stock levels',
}

export default function InventoryRoute() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'editor']}>
      <InventoryPage />
    </ProtectedRoute>
  )
}
