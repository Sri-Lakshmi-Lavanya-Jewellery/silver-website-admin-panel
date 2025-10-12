'use client'

import { useState } from 'react'
import { Category } from '@/types'
import { categoryApi } from '@/lib/api'
import { toast } from 'react-hot-toast'
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  PlusIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  InformationCircleIcon,
  TagIcon,
} from '@heroicons/react/24/outline'

interface CategoryListProps {
  categories: Category[]
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
  onToggleActive: (category: Category) => void
  onAddSubcategory: (parentCategory: Category) => void
  onViewDetails?: (category: Category) => void
}

export default function CategoryList({
  categories,
  onEdit,
  onDelete,
  onToggleActive,
  onAddSubcategory,
  onViewDetails,
}: CategoryListProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null)

  // Helper function to get category ID
  const getCategoryId = (category: Category): string => {
    return category.id || category._id || ''
  }

  console.log('CategoryList received categories:', categories.map(c => ({
    name: c.name,
    hasChildren: !!(c.children && c.children.length > 0),
    childrenCount: c.children?.length || 0
  })))

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const handleDelete = async (category: Category) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
      return
    }

    const categoryId = getCategoryId(category)
    setDeletingCategory(categoryId)
    try {
      const response = await categoryApi.deleteCategory(categoryId)
      if (response.success) {
        toast.success('Category deleted successfully')
        onDelete(category)
      } else {
        throw new Error(response.message || 'Failed to delete category')
      }
    } catch (error) {
      console.error('Delete category error:', error)
      toast.error('Failed to delete category')
    } finally {
      setDeletingCategory(null)
    }
  }

  const handleToggleActive = async (category: Category) => {
    try {
      const categoryId = getCategoryId(category)
      const response = await categoryApi.updateCategory(categoryId, {
        isActive: !category.isActive
      })
      if (response.success && response.data) {
        toast.success(`Category ${!category.isActive ? 'activated' : 'deactivated'}`)
        onToggleActive(response.data)
      } else {
        throw new Error(response.message || 'Failed to update category')
      }
    } catch (error) {
      console.error('Toggle category error:', error)
      toast.error('Failed to update category')
    }
  }

  const renderCategory = (category: Category, level: number = 0) => {
    const hasChildren = category.children && category.children.length > 0
    const categoryId = getCategoryId(category)
    const isExpanded = expandedCategories.has(categoryId)
    const isDeleting = deletingCategory === categoryId

    console.log(`Rendering category ${category.name} at level ${level}:`, {
      hasChildren,
      childrenCount: category.children?.length || 0,
      isExpanded
    })

    return (
      <div key={categoryId} className="border border-gray-200 rounded-lg mb-2">
        <div className="p-4 bg-white hover:bg-gray-50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Level indicator for subcategories */}
              {level > 0 && (
                <div className="flex items-center">
                  {Array.from({ length: level }, (_, i) => (
                    <div key={i} className="w-4 h-0.5 bg-gray-300 mr-1"></div>
                  ))}
                </div>
              )}
              
              {/* Expand/Collapse Button */}
              {hasChildren ? (
                <button
                  onClick={() => toggleExpanded(categoryId)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {isExpanded ? (
                    <ChevronDownIcon className="w-5 h-5" />
                  ) : (
                    <ChevronRightIcon className="w-5 h-5" />
                  )}
                </button>
              ) : (
                <div className="w-5 h-5" />
              )}

              {/* Category Info */}
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${category.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                
                {/* Thumbnail */}
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {category.thumbnail ? (
                    <img
                      src={category.thumbnail}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <TagIcon className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-medium text-gray-900">{category.name}</h3>
                  {category.description && (
                    <p className="text-sm text-gray-600">{category.description}</p>
                  )}
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-gray-500">
                      ID: {categoryId}
                    </span>
                    <span className="text-xs text-gray-500">
                      Sort: {category.sortOrder || 0}
                    </span>
                    {category.parentId && (
                      <span className="text-xs text-gray-500">
                        Subcategory
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleToggleActive(category)}
                className={`p-2 rounded-full hover:bg-gray-100 ${
                  category.isActive ? 'text-green-600' : 'text-gray-400'
                }`}
                title={category.isActive ? 'Deactivate' : 'Activate'}
              >
                {category.isActive ? (
                  <EyeIcon className="w-4 h-4" />
                ) : (
                  <EyeSlashIcon className="w-4 h-4" />
                )}
              </button>

              {onViewDetails && (
                <button
                  onClick={() => onViewDetails(category)}
                  className="p-2 rounded-full hover:bg-gray-100 text-blue-600"
                  title="View Details"
                >
                  <InformationCircleIcon className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => onAddSubcategory(category)}
                className="p-2 rounded-full hover:bg-gray-100 text-blue-600"
                title="Add Subcategory"
              >
                <PlusIcon className="w-4 h-4" />
              </button>

              <button
                onClick={() => onEdit(category)}
                className="p-2 rounded-full hover:bg-gray-100 text-yellow-600"
                title="Edit"
              >
                <PencilIcon className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleDelete(category)}
                disabled={isDeleting}
                className="p-2 rounded-full hover:bg-gray-100 text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete"
              >
                {isDeleting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                ) : (
                  <TrashIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Subcategories */}
        {hasChildren && isExpanded && (
          <div className="pl-6 pb-2 bg-gray-50">
            {category.children!.map((child) => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  // Since the API returns a hierarchical structure, we should display all categories passed to us
  // The parent component (CategoriesPage) will only pass root categories with their children nested
  const categoriesToRender = categories

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg mb-2">No categories found</div>
        <p className="text-gray-600">Create your first category to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {categoriesToRender.map((category) => renderCategory(category))}
    </div>
  )
}
