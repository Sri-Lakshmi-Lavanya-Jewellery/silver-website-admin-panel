'use client'

import { useState, useEffect } from 'react'
import { Category, Product, getSubcategoryDisplayName } from '@/types'
import { categoryApi } from '@/lib/api'
import { toast } from 'react-hot-toast'
import {
  XMarkIcon,
  TagIcon,
  CalendarIcon,
  UserIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
} from '@heroicons/react/24/outline'

interface CategoryDetailModalProps {
  category: Category | null
  isOpen: boolean
  onClose: () => void
  onEdit: (category: Category) => void
}

export default function CategoryDetailModal({
  category,
  isOpen,
  onClose,
  onEdit,
}: CategoryDetailModalProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)

  useEffect(() => {
    if (category && isOpen) {
      fetchCategoryProducts()
    }
  }, [category, isOpen, currentPage])

  const fetchCategoryProducts = async () => {
    if (!category) return
    
    try {
      setLoading(true)
      const response = await categoryApi.getCategoryProducts(category.id, currentPage, 10)
      if (response.success && response.data) {
        setProducts(response.data.products)
        // If there's pagination info in the response, use it
        // Otherwise, we'll just show the current products
      }
    } catch (error) {
      toast.error('Failed to load category products')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!isOpen || !category) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              {category.thumbnail ? (
                <img
                  src={category.thumbnail}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                  <TagIcon className="w-6 h-6 text-primary-600" />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
              <p className="text-sm text-gray-600">Category Details</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(category)}
              className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-full"
              title="Edit Category"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Category Information */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name
                  </label>
                  <p className="text-gray-900">{category.name}</p>
                </div>

                {category.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <p className="text-gray-900">{category.description}</p>
                  </div>
                )}

                {category.thumbnail && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thumbnail
                    </label>
                    <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={category.thumbnail}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <div className="flex items-center space-x-2">
                    {category.isActive ? (
                      <EyeIcon className="w-4 h-4 text-green-600" />
                    ) : (
                      <EyeSlashIcon className="w-4 h-4 text-gray-400" />
                    )}
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      category.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort Order
                  </label>
                  <p className="text-gray-900">{category.sortOrder || 0}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Created At
                  </label>
                  <div className="flex items-center space-x-2 text-gray-900">
                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                    <span>{formatDate(category.createdAt)}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Updated
                  </label>
                  <div className="flex items-center space-x-2 text-gray-900">
                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                    <span>{formatDate(category.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Subcategories */}
            {category.children && category.children.length > 0 && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Subcategories ({category.children.length})
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {category.children.map((subcategory) => (
                    <div
                      key={subcategory._id}
                      className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                          {subcategory.thumbnail ? (
                            <img
                              src={subcategory.thumbnail}
                              alt={subcategory.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                              <TagIcon className="w-4 h-4 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900 truncate">{subcategory.name}</span>
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              subcategory.isActive ? 'bg-green-500' : 'bg-gray-300'
                            }`} />
                          </div>
                        </div>
                      </div>
                      {subcategory.description && (
                        <p className="text-sm text-gray-600">{subcategory.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Associated Products */}
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium text-gray-900">Associated Products</h4>
              <span className="text-sm text-gray-600">
                {products.length} products
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : products.length > 0 ? (
              <div className="space-y-3">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 rounded-lg"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-gray-900 truncate">{product.title}</h5>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-600">
                          {getSubcategoryDisplayName(product.subcategory)}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          product.inStock 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                        {product.isNewProduct && (
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-lg mb-2">No products found</div>
                <p className="text-gray-600">This category doesn't have any associated products yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
