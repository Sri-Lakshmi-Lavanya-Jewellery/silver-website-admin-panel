'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Product, ProductFormData } from '@/types'
import { productApi, apiUtils } from '@/lib/api'
import { toast } from 'react-hot-toast'
import ProductForm from '@/components/forms/ProductForm'

export default function ProductEditPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string)
    }
  }, [params.id])

  const fetchProduct = async (id: string) => {
    try {
      setLoading(true)
      const response = await productApi.getProduct(id)
      if (response.success && response.data) {
        setProduct(response.data)
      } else {
        toast.error('Product not found')
        router.push('/products')
      }
    } catch (error) {
      toast.error('Failed to load product')
      router.push('/products')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: ProductFormData) => {
    if (!product) {
      return
    }

    try {
      const response = await productApi.updateProduct(product.id, data)
      if (response.success) {
        toast.success('Product updated successfully')
        router.push('/products')
      } else {
        toast.error(response.message || 'Failed to update product')
      }
    } catch (error) {
      toast.error(apiUtils.handleError(error))
    }
  }

  const handleCancel = () => {
    router.push('/products')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
        <button
          onClick={() => router.push('/products')}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Back to Products
        </button>
      </div>
    )
  }

  return (
    <ProductForm
      product={product}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  )
}
