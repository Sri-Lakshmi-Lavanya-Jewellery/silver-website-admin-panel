'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Product, ProductFilters } from '@/types'
import { productApi } from '@/lib/api'
import { useProducts } from '@/contexts/AppContext'
import { toast } from 'react-hot-toast'
import ProductList from '@/components/pages/ProductList'
import ProductFiltersComponent from '@/components/forms/ProductFilters'
import { PlusIcon } from '@heroicons/react/24/outline'

export default function ProductsPage() {
  const router = useRouter()
  const { 
    products, 
    filters, 
    pagination, 
    loading, 
    setProducts, 
    setFilters, 
    setPagination, 
    setLoading,
    deleteProduct
  } = useProducts()

  useEffect(() => {
    fetchProducts()
  }, [filters])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await productApi.getProducts(filters)
      
      if (response.success && response.data) {
        setProducts(response.data)
        if (response.pagination) {
          setPagination(response.pagination)
        }
      }
    } catch (error) {
      toast.error('Failed to load products')
      console.error('Products error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return
    }

    try {
      const response = await productApi.deleteProduct(id)
      if (response.success) {
        toast.success('Product deleted successfully')
        deleteProduct(id)
      }
    } catch (error) {
      toast.error('Failed to delete product')
      console.error('Delete product error:', error)
    }
  }

  const handleToggleStock = async (id: string, inStock: boolean) => {
    try {
      const response = await productApi.updateStock(id, inStock)
      if (response.success && response.data) {
        toast.success(`Product marked as ${inStock ? 'in stock' : 'out of stock'}`)
        // Update the product in the list
        setProducts(products.map(p => p.id === id ? response.data! : p))
      }
    } catch (error) {
      toast.error('Failed to update stock status')
      console.error('Stock update error:', error)
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      // Try the specific endpoint first, fallback to general update
      let response
      try {
        response = await productApi.updateActiveStatus(id, isActive)
      } catch (error) {
        // Fallback to general update if specific endpoint doesn't exist
        response = await productApi.updateProduct(id, { isActive })
      }
      
      if (response.success && response.data) {
        toast.success(`Product ${isActive ? 'activated' : 'deactivated'} successfully`)
        // Update the product in the list
        setProducts(products.map(p => p.id === id ? response.data! : p))
      }
    } catch (error) {
      toast.error('Failed to update product status')
      console.error('Product active status update error:', error)
    }
  }

  const handleEdit = (product: Product) => {
    router.push(`/products/${product.id}/edit`)
  }

  const handleView = (product: Product) => {
    router.push(`/products/${product.id}`)
  }

  const handleFiltersChange = (newFilters: Partial<ProductFilters>) => {
    setFilters({ ...filters, ...newFilters })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your silver shop product catalog
          </p>
        </div>
        <button
          onClick={() => router.push('/products/new')}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Add New Product
        </button>
      </div>

      {/* Filters */}
      <ProductFiltersComponent
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      {/* Products List */}
      <ProductList
        products={products}
        loading={loading}
        pagination={pagination}
        onEdit={handleEdit}
        onDelete={handleDeleteProduct}
        onToggleStock={handleToggleStock}
        onToggleActive={handleToggleActive}
        onFiltersChange={handleFiltersChange}
        onView={handleView}
      />
    </div>
  )
}
