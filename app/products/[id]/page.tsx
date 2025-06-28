'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Product } from '@/types'
import { productApi } from '@/lib/api'
import { toast } from 'react-hot-toast'
import ProductDetailModal from '@/components/ui/ProductDetailModal'

export default function ProductDetailPage() {
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

  const handleEdit = (product: Product) => {
    router.push(`/products/${product.id}/edit`)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await productApi.deleteProduct(id)
      if (response.success) {
        toast.success('Product deleted successfully')
        router.push('/products')
      }
    } catch (error) {
      toast.error('Failed to delete product')
    }
  }

  const handleToggleStock = async (id: string, inStock: boolean) => {
    try {
      const response = await productApi.updateStock(id, inStock)
      if (response.success && response.data) {
        setProduct(response.data)
        toast.success(`Product marked as ${inStock ? 'in stock' : 'out of stock'}`)
      }
    } catch (error) {
      toast.error('Failed to update stock status')
    }
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
    <ProductDetailModal
      product={product}
      onClose={() => router.push('/products')}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onToggleStock={handleToggleStock}
    />
  )
}
