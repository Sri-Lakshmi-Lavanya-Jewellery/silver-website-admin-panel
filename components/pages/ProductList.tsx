'use client'

import { Product, getCategoryDisplayName, getSubcategoryDisplayName } from '@/types'
import Image from 'next/image'
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline'

interface ProductListProps {
  products: Product[]
  loading: boolean
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
  onToggleStock: (id: string, inStock: boolean) => void
  onToggleActive?: (id: string, isActive: boolean) => void
  onFiltersChange: (filters: any) => void
  onView: (product: Product) => void
}

export default function ProductList({ 
  products, 
  loading, 
  pagination, 
  onEdit, 
  onDelete, 
  onToggleStock, 
  onToggleActive,
  onFiltersChange,
  onView 
}: ProductListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const handlePageChange = (page: number) => {
    onFiltersChange({ page })
  }

  return (
    <div className="space-y-6">
      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500">Start by adding your first product to the catalog.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStock={onToggleStock}
              onToggleActive={onToggleActive}
              onView={onView}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} products
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
              >
                Previous
              </button>
              
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 text-sm rounded-md ${
                    page === pagination.page
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

interface ProductCardProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
  onToggleStock: (id: string, inStock: boolean) => void
  onToggleActive?: (id: string, isActive: boolean) => void
  onView: (product: Product) => void
}

function ProductCard({ product, onEdit, onDelete, onToggleStock, onToggleActive, onView }: ProductCardProps) {
  const mainImage = product.images?.[0] || '/placeholder-product.jpg'
  const isInactive = product.isActive === false
  
  return (
    <div className={`bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow ${
      isInactive 
        ? 'border-red-200 opacity-75' 
        : 'border-gray-200'
    }`}>
      {/* Product Image */}
      <div 
        className="relative h-48 bg-gray-100 cursor-pointer"
        onClick={() => onView(product)}
      >
        <Image
          src={mainImage}
          alt={product.title}
          fill
          className={`object-cover ${isInactive ? 'opacity-60' : ''}`}
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = '/placeholder-product.jpg'
          }}
        />
        {product.isNewProduct && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            New
          </div>
        )}
        {isInactive && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            Inactive
          </div>
        )}
        <div className={`absolute ${isInactive ? 'top-8' : 'top-2'} left-2 text-xs px-2 py-1 rounded-full ${
          product.inStock 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {product.inStock ? 'In Stock' : 'Out of Stock'}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 
          className={`font-medium mb-2 line-clamp-2 cursor-pointer hover:text-primary-600 ${
            isInactive ? 'text-gray-500' : 'text-gray-900'
          }`}
          onClick={() => onView(product)}
        >
          {product.title}
          {isInactive && <span className="text-red-500 text-xs ml-2">(Inactive)</span>}
        </h3>
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <span className="capitalize">{getCategoryDisplayName(product.category)}</span>
          <span>{product.weight}</span>
        </div>
        
        {product.subcategory && (
          <div className="text-xs text-gray-400 mb-3 capitalize">
            {getSubcategoryDisplayName(product.subcategory)}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          {/* Stock Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleStock(product.id, !product.inStock)
            }}
            className={`w-full text-xs px-3 py-1 rounded-full transition-colors ${
              product.inStock
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {product.inStock ? 'Mark Out of Stock' : 'Mark In Stock'}
          </button>

          {/* Active Toggle */}
          {onToggleActive && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleActive(product.id, isInactive ? true : false)
              }}
              className={`w-full text-xs px-3 py-1 rounded-full transition-colors ${
                isInactive
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              {isInactive ? 'Activate Product' : 'Deactivate Product'}
            </button>
          )}
          
          {/* Action Icons */}
          <div className="flex justify-center space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onView(product)
              }}
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
              title="View details"
            >
              <EyeIcon className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(product)
              }}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="Edit product"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            {!isInactive && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(product.id)
                }}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Delete product"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
