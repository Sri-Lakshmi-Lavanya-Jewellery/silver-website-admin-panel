'use client'

import { useState, useEffect } from 'react'
import { Category } from '@/types'
import { categoryApi, analyticsApi } from '@/lib/api'
import { sampleCategories } from '@/lib/sampleData'
import { toast } from 'react-hot-toast'
import { PlusIcon, FunnelIcon, ArrowPathIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'
import CategoryForm from '@/components/forms/CategoryForm'
import CategoryList from '@/components/ui/CategoryList'
import BulkCategoryOperations from '@/components/ui/BulkCategoryOperations'
import CategoryDetailModal from '@/components/ui/CategoryDetailModal'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [parentForSubcategory, setParentForSubcategory] = useState<Category | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showInactiveCategories, setShowInactiveCategories] = useState(true) // Temporarily default to true to show all categories
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [showBulkOperations, setShowBulkOperations] = useState(false)
  const [selectedCategoryForDetails, setSelectedCategoryForDetails] = useState<Category | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [showInactiveCategories])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await categoryApi.getCategoryHierarchy()
      if (response.success && response.data) {
        // Convert API response to match our Category interface
        const normalizedCategories = normalizeCategories(response.data)
        setCategories(normalizedCategories)
      }
    } catch (error) {
      toast.error('Failed to load categories')
      // Fallback to sample data for development
      const normalizedSampleData = normalizeCategories(sampleCategories)
      setCategories(normalizedSampleData)
    } finally {
      setLoading(false)
    }
  }

  const normalizeCategories = (apiCategories: any[]): Category[] => {
    const normalize = (cat: any): Category => {
      const normalized: Category = {
        id: cat.id || cat._id || '',
        _id: cat._id || cat.id,
        name: cat.name,
        description: cat.description || undefined,
        thumbnail: cat.thumbnail || undefined,
        // Map parentCategory (string) to parentId for our interface
        parentId: cat.parentCategory || undefined,
        isActive: cat.isActive,
        sortOrder: cat.sortOrder || 0,
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt,
        // Recursively normalize children if they exist
        children: cat.children ? cat.children.map(normalize) : []
      }

      return normalized
    }

    return apiCategories.map(normalize)
  }

  const handleSaveCategory = async (savedCategory: Category) => {
    await fetchCategories()
    setShowForm(false)
    setEditingCategory(null)
    setParentForSubcategory(null)
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setParentForSubcategory(null)
    setShowForm(true)
  }

  const handleDeleteCategory = async (category: Category) => {
    await fetchCategories()
  }

  const handleToggleActive = async (category: Category) => {
    await fetchCategories()
  }

  const handleAddSubcategory = (parentCategory: Category) => {
    setParentForSubcategory(parentCategory)
    setEditingCategory(null)
    setShowForm(true)
  }

  const handleAddCategory = () => {
    setEditingCategory(null)
    setParentForSubcategory(null)
    setShowForm(true)
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingCategory(null)
    setParentForSubcategory(null)
  }

  const filteredCategories = categories.filter(category => {
    const matchesSearch = searchTerm === '' || 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesActiveFilter = showInactiveCategories || category.isActive

    return matchesSearch && matchesActiveFilter
  })

  const getAllCategories = (cats: Category[]): Category[] => {
    let allCats: Category[] = []
    cats.forEach(cat => {
      allCats.push(cat)
      if (cat.children && cat.children.length > 0) {
        allCats = allCats.concat(getAllCategories(cat.children))
      }
    })
    return allCats
  }

  const allCategoriesFlat = getAllCategories(categories)
  const activeCategories = allCategoriesFlat.filter(cat => cat.isActive)
  const totalProducts = 0 // This would come from product counts if available

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage product categories and subcategories
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowBulkOperations(true)}
            className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
          >
            <Cog6ToothIcon className="w-4 h-4 mr-2" />
            Bulk Actions
          </button>
          <button
            onClick={() => fetchCategories()}
            className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
          >
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={handleAddCategory}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Category
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="text-2xl font-bold text-primary-600">{allCategoriesFlat.length}</div>
          <div className="text-sm text-gray-600">Total Categories</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{activeCategories.length}</div>
          <div className="text-sm text-gray-600">Active Categories</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">
            {categories.filter(cat => !cat.parentId).length}
          </div>
          <div className="text-sm text-gray-600">Root Categories</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">
            {allCategoriesFlat.filter(cat => cat.parentId).length}
          </div>
          <div className="text-sm text-gray-600">Subcategories</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showInactiveCategories}
                onChange={(e) => setShowInactiveCategories(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Show inactive</span>
            </label>
          </div>
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">All Categories</h2>
          <div className="text-sm text-gray-600">
            {filteredCategories.length} of {categories.length} categories
          </div>
        </div>

        <CategoryList
          categories={filteredCategories}
          onEdit={handleEditCategory}
          onDelete={handleDeleteCategory}
          onToggleActive={handleToggleActive}
          onAddSubcategory={handleAddSubcategory}
          onViewDetails={setSelectedCategoryForDetails}
        />
      </div>

      {/* Category Form Modal */}
      <CategoryForm
        category={editingCategory || (parentForSubcategory ? {
          id: '',
          name: '',
          description: '',
          parentId: parentForSubcategory._id || parentForSubcategory.id,
          isActive: true,
          sortOrder: 0,
          createdAt: '',
          updatedAt: '',
        } as Category : undefined)}
        parentCategories={allCategoriesFlat.filter(cat => !cat.parentId)}
        onSave={handleSaveCategory}
        onCancel={handleCancelForm}
        isOpen={showForm}
      />

      {/* Bulk Operations Modal */}
      <BulkCategoryOperations
        categories={allCategoriesFlat}
        isOpen={showBulkOperations}
        onClose={() => setShowBulkOperations(false)}
        onComplete={async () => {
          await fetchCategories()
          setShowBulkOperations(false)
        }}
      />

      {/* Category Detail Modal */}
      <CategoryDetailModal
        category={selectedCategoryForDetails}
        isOpen={!!selectedCategoryForDetails}
        onClose={() => setSelectedCategoryForDetails(null)}
        onEdit={(category) => {
          setSelectedCategoryForDetails(null)
          handleEditCategory(category)
        }}
      />
    </div>
  )
}
