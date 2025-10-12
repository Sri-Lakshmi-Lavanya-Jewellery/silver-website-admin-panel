'use client'

import { useState } from 'react'
import { Product } from '@/types'
import { XMarkIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'

interface ProductDetailModalProps {
  product: Product
  onClose: () => void
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
  onToggleStock: (id: string, inStock: boolean) => void
  onToggleActive?: (id: string, isActive: boolean) => void
}

export default function ProductDetailModal({ 
  product, 
  onClose, 
  onEdit, 
  onDelete, 
  onToggleStock,
  onToggleActive 
}: ProductDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  const allImages = [
    ...(product.images || []),
    ...Object.values(product.models || {}).flatMap(model => 
      Object.values(model).flatMap(dimension => dimension.images || [])
    )
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">{product.title}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(product)}
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => onDelete(product.id)}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Images */}
            <div className="space-y-4">
              {allImages.length > 0 && (
                <>
                  <div className="aspect-square bg-gray-100 text-black rounded-lg overflow-hidden">
                    <Image
                      src={allImages[currentImageIndex] || '/placeholder-product.jpg'}
                      alt={product.title}
                      width={400}
                      height={400}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {allImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {allImages.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                            currentImageIndex === index ? 'border-primary-600' : 'border-gray-200'
                          }`}
                        >
                          <Image
                            src={image || '/placeholder-product.jpg'}
                            alt={`${product.title} ${index + 1}`}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6 text-black">
              {/* Basic Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    product.inStock 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                  {product.isNewProduct && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      New Product
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Category:</span>
                    <p className="font-medium capitalize">
                      {typeof product.category === 'object' ? product.category.name : product.category}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Subcategory:</span>
                    <p className="font-medium capitalize">
                      {typeof product.subcategory === 'object' ? product.subcategory.name : product.subcategory}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Weight:</span>
                    <p className="font-medium">{product.weight}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Created:</span>
                    <p className="font-medium">
                      {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Models */}
              {product.models && Object.keys(product.models).length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Available Models</h3>
                  <div className="space-y-4">
                    {Object.entries(product.models).map(([modelName, model]) => (
                      <div key={modelName} className="border rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">{modelName}</h4>
                        <div className="space-y-3">
                          {Object.entries(model).map(([dimensionKey, dimension]) => (
                            <div key={dimensionKey} className="bg-gray-50 rounded-lg p-3">
                              <h5 className="font-medium text-gray-800 mb-2 capitalize">{dimensionKey}</h5>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>Length: {dimension.length}</div>
                                <div>Height: {dimension.height}</div>
                                <div>Breadth: {dimension.breadth}</div>
                                <div>Weight: {dimension.weight}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => onToggleStock(product.id, !product.inStock)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    product.inStock
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  Mark as {product.inStock ? 'Out of Stock' : 'In Stock'}
                </button>
                {onToggleActive && (
                  <button
                    onClick={() => onToggleActive(product.id, !product.isActive)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      product.isActive
                        ? 'bg-orange-600 hover:bg-orange-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {product.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                )}
                <button
                  onClick={() => onEdit(product)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Edit Product
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
