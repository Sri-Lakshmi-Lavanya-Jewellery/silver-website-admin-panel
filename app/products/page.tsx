import ProductsPage from '@/components/pages/ProductsPage'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export const metadata = {
  title: 'Products - Silver Shop Admin',
  description: 'Manage your silver shop product catalog',
}

export default function ProductsRoute() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'editor']}>
      <ProductsPage />
    </ProtectedRoute>
  )
}
