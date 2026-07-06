'use client'

import { useState, useEffect } from 'react'
import { Category } from '@/types'
import { categoryApi } from '@/lib/api'
import { toast } from 'react-hot-toast'
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  EyeSlashIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline'
import ImageUpload from '@/components/ui/ImageUpload'

interface CategoryFormProps {
  category?: Category
  parentCategories: Category[]
  onSave: (category: Category) => void
  onCancel: () => void
  isOpen: boolean
}

export default function CategoryForm({ 
  category, 
  parentCategories, 
  onSave, 
  onCancel, 
  isOpen 
}: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    thumbnail: null as string | null,
    parentId: '' as string | null,
    isActive: true,
    sortOrder: 0,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        thumbnail: category.thumbnail || null,
        parentId: category.parentId || '',
        isActive: category.isActive,
        sortOrder: category.sortOrder || 0,
      })
    } else {
      setFormData({
        name: '',
        description: '',
        thumbnail: null,
        parentId: '',
        isActive: true,
        sortOrder: 0,
      })
    }
  }, [category])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Category name is required')
      return
    }

    setIsSubmitting(true)
    try {
      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        thumbnail: formData.thumbnail || undefined,
        parentId: formData.parentId || null,
        isActive: formData.isActive,
        sortOrder: formData.sortOrder,
      }

      let response
      if (category) {
        response = await categoryApi.updateCategory(category.id, categoryData)
      } else {
        response = await categoryApi.createCategory(categoryData)
      }

      if (response.success && response.data) {
        toast.success(`Category ${category ? 'updated' : 'created'} successfully`)
        onSave(response.data)
      } else {
        throw new Error(response.message || 'Failed to save category')
      }
    } catch (error) {
      toast.error('Failed to save category')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {category ? 'Edit Category' : 'Add New Category'}
            </h3>
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Category Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-400"
                placeholder="e.g., Jewelry, Home Decor"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-400"
                placeholder="Brief description of this category..."
              />
            </div>

            {/* Thumbnail Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thumbnail Image
              </label>
              <div className="space-y-3">
                {formData.thumbnail ? (
                  <div className="relative">
                    <img
                      src={formData.thumbnail}
                      alt="Category thumbnail"
                      className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, thumbnail: null })}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Upload category thumbnail</p>
                    <ImageUpload
                      images={formData.thumbnail ? [formData.thumbnail] : []}
                      onImagesChange={(images) => {
                        setFormData({ ...formData, thumbnail: images.length > 0 ? images[0] : null })
                      }}
                      maxImages={1}
                      accept="image/*"
                    />
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Recommended size: 400x400px. Supported formats: JPG, PNG, WebP
              </p>
            </div>

            {/* Parent Category */}
            <div>
              <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 mb-1">
                Parent Category
              </label>
              <select
                id="parentId"
                value={formData.parentId || ''}
                onChange={(e) => setFormData({ ...formData, parentId: e.target.value || null })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select parent category (optional)</option>
                {parentCategories
                  .filter(cat => !category || cat.id !== category._id)
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-1">
                Sort Order
              </label>
              <input
                type="number"
                id="sortOrder"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lower numbers appear first in listings
              </p>
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                Active (visible to customers)
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  {category ? 'Update Category' : 'Create Category'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
