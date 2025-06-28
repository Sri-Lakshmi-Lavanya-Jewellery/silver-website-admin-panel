'use client'

import { useState, useEffect } from 'react'
import { CategoryCount } from '@/types'
import { analyticsApi } from '@/lib/api'
import { toast } from 'react-hot-toast'
import { TagIcon, PlusIcon, PencilIcon } from '@heroicons/react/24/outline'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryCount[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await analyticsApi.getCategoryCounts()
      if (response.success && response.data) {
        setCategories(response.data)
      }
    } catch (error) {
      toast.error('Failed to load categories')
      console.error('Categories error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage product categories and subcategories
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Category
        </button>
      </div>

      {/* Categories Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <CategoryCard 
            key={category.category} 
            category={category} 
            onEdit={() => {/* TODO: Implement edit */}}
          />
        ))}
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{categories.length}</div>
            <div className="text-sm text-gray-600">Total Categories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {categories.reduce((sum, cat) => sum + cat.count, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Products</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(categories.reduce((sum, cat) => sum + cat.count, 0) / categories.length) || 0}
            </div>
            <div className="text-sm text-gray-600">Avg per Category</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {categories.find(cat => cat.count === Math.max(...categories.map(c => c.count)))?.category || 'N/A'}
            </div>
            <div className="text-sm text-gray-600">Most Popular</div>
          </div>
        </div>
      </div>

      {/* Category Management Tools */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Management Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <TagIcon className="w-6 h-6 text-blue-600 mr-3" />
            <div className="text-left">
              <h3 className="font-medium text-gray-900">Manage Subcategories</h3>
              <p className="text-sm text-gray-600">Create and organize subcategories</p>
            </div>
          </button>
          
          <button className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <PlusIcon className="w-6 h-6 text-green-600 mr-3" />
            <div className="text-left">
              <h3 className="font-medium text-gray-900">Bulk Operations</h3>
              <p className="text-sm text-gray-600">Move products between categories</p>
            </div>
          </button>
          
          <button className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <PencilIcon className="w-6 h-6 text-purple-600 mr-3" />
            <div className="text-left">
              <h3 className="font-medium text-gray-900">Category Settings</h3>
              <p className="text-sm text-gray-600">Configure display and SEO options</p>
            </div>
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Category</h3>
            <p className="text-gray-600 mb-4">
              Category management features will be available in the next update.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface CategoryCardProps {
  category: CategoryCount
  onEdit: () => void
}

function CategoryCard({ category, onEdit }: CategoryCardProps) {
  const categoryName = category.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="p-2 bg-primary-100 rounded-lg mr-3">
            <TagIcon className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{categoryName}</h3>
            <p className="text-sm text-gray-600">{category.count} products</p>
          </div>
        </div>
        <button
          onClick={onEdit}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
        >
          <PencilIcon className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Products:</span>
          <span className="font-medium">{category.count}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary-600 h-2 rounded-full" 
            style={{ width: `${Math.min((category.count / 10) * 100, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}
