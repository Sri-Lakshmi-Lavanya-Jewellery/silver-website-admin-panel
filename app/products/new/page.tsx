'use client'

import { useRouter } from 'next/navigation'
import { ProductFormData } from '@/types'
import { productApi, apiUtils } from '@/lib/api'
import { toast } from 'react-hot-toast'
import ProductForm from '@/components/forms/ProductForm'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function NewProductPage() {
  const router = useRouter()

  const handleSubmit = async (data: ProductFormData) => {
    try {
      const response = await productApi.createProduct(data)
      if (response.success) {
        toast.success('Product created successfully')
        router.push('/products')
      }
    } catch (error) {
      toast.error(apiUtils.handleError(error))
    }
  }

  const handleCancel = () => {
    router.push('/products')
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'editor']}>
      <ProductForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </ProtectedRoute>
  )
}
