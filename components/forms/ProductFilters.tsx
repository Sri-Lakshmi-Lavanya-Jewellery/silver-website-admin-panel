'use client'

import { useState } from 'react'
import { ProductFilters, CATEGORIES } from '@/types'
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface ProductFiltersProps {
  filters: ProductFilters
  onFiltersChange: (filters: ProductFilters) => void
}

export default function ProductFiltersComponent({ filters, onFiltersChange }: ProductFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [localSearch, setLocalSearch] = useState(filters.search || '')

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onFiltersChange({ ...filters, search: localSearch, page: 1 })
  }

  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value, page: 1 })
  }

  const clearFilters = () => {
    setLocalSearch('')
    onFiltersChange({
      page: 1,
      limit: filters.limit || 12,
      isActive: true // Default to showing active products
    })
  }

  const hasActiveFilters = Boolean(
    filters.search || 
    filters.category || 
    filters.subcategory || 
    filters.isNewProduct !== undefined || 
    filters.inStock !== undefined ||
    filters.isActive === false // Only consider it an active filter when showing inactive products
  )

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex space-x-3">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search products by title, category..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="form-input block w-full pl-10 pr-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          Search
        </button>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center"
        >
          <FunnelIcon className="w-4 h-4 mr-2" />
          Filters
        </button>
      </form>

      {/* Show Inactive Products Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Show:</span>
            <div className="flex items-center space-x-1">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="productStatus"
                  checked={filters.isActive === true || filters.isActive === undefined}
                  onChange={() => handleFilterChange('isActive', true)}
                  className="form-radio h-4 w-4 text-primary-600"
                />
                <span className="ml-1 text-sm text-gray-700">Active products</span>
              </label>
              <label className="flex items-center cursor-pointer ml-4">
                <input
                  type="radio"
                  name="productStatus"
                  checked={filters.isActive === false}
                  onChange={() => handleFilterChange('isActive', false)}
                  className="form-radio h-4 w-4 text-primary-600"
                />
                <span className="ml-1 text-sm text-gray-700">Inactive products</span>
              </label>
            </div>
          </div>
          <span className="text-xs text-gray-500">
            {filters.isActive === false ? 'Showing inactive products only' : 'Showing active products only'}
          </span>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                className="form-select w-full"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategory
              </label>
              <input
                type="text"
                placeholder="Enter subcategory"
                value={filters.subcategory || ''}
                onChange={(e) => handleFilterChange('subcategory', e.target.value || undefined)}
                className="form-input w-full"
              />
            </div>

            {/* Stock Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Status
              </label>
              <select
                value={filters.inStock === undefined ? '' : filters.inStock.toString()}
                onChange={(e) => {
                  const value = e.target.value
                  handleFilterChange('inStock', value === '' ? undefined : value === 'true')
                }}
                className="form-select w-full"
              >
                <option value="">All Products</option>
                <option value="true">In Stock</option>
                <option value="false">Out of Stock</option>
              </select>
            </div>

            {/* New Product Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Type
              </label>
              <select
                value={filters.isNewProduct === undefined ? '' : filters.isNewProduct.toString()}
                onChange={(e) => {
                  const value = e.target.value
                  handleFilterChange('isNewProduct', value === '' ? undefined : value === 'true')
                }}
                className="form-select w-full"
              >
                <option value="">All Products</option>
                <option value="true">New Products</option>
                <option value="false">Regular Products</option>
              </select>
            </div>
          </div>

          {/* Sort Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy || 'createdAt'}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="form-select w-full"
              >
                <option value="createdAt">Date Created</option>
                <option value="title">Product Title</option>
                <option value="category">Category</option>
                <option value="updatedAt">Last Updated</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort Order
              </label>
              <select
                value={filters.sortOrder || 'desc'}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
                className="form-select w-full"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Items per Page
              </label>
              <select
                value={filters.limit || 12}
                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                className="form-select w-full"
              >
                <option value={6}>6 per page</option>
                <option value={12}>12 per page</option>
                <option value={24}>24 per page</option>
                <option value={48}>48 per page</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="flex justify-end">
              <button
                onClick={clearFilters}
                className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <XMarkIcon className="w-4 h-4 mr-1" />
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="border-t pt-4">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            
            {filters.search && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-primary-100 text-primary-800">
                Search: "{filters.search}"
                <button
                  onClick={() => {
                    setLocalSearch('')
                    handleFilterChange('search', undefined)
                  }}
                  className="ml-1 text-primary-600 hover:text-primary-800"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {filters.category && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                Category: {filters.category.replace('-', ' ')}
                <button
                  onClick={() => handleFilterChange('category', undefined)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {filters.subcategory && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">
                Subcategory: {filters.subcategory}
                <button
                  onClick={() => handleFilterChange('subcategory', undefined)}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {filters.inStock !== undefined && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                {filters.inStock ? 'In Stock' : 'Out of Stock'}
                <button
                  onClick={() => handleFilterChange('inStock', undefined)}
                  className="ml-1 text-yellow-600 hover:text-yellow-800"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {filters.isNewProduct !== undefined && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                {filters.isNewProduct ? 'New Products' : 'Regular Products'}
                <button
                  onClick={() => handleFilterChange('isNewProduct', undefined)}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.isActive === false && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-red-100 text-red-800">
                Inactive Products Only
                <button
                  onClick={() => handleFilterChange('isActive', undefined)}
                  className="ml-1 text-red-600 hover:text-red-800"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
