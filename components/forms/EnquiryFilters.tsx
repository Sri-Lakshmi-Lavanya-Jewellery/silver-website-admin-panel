'use client'

import { useState } from 'react'
import { EnquiryFilters, ENQUIRY_TYPES, ENQUIRY_PRIORITIES, ENQUIRY_STATUSES } from '@/types'
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface EnquiryFiltersProps {
  filters: EnquiryFilters
  onFiltersChange: (filters: EnquiryFilters) => void
}

export default function EnquiryFiltersComponent({ filters, onFiltersChange }: EnquiryFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [localSearch, setLocalSearch] = useState(filters.search || '')

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onFiltersChange({ ...filters, search: localSearch, page: 1 })
  }

  const handleFilterChange = (key: keyof EnquiryFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value, page: 1 })
  }

  const clearFilters = () => {
    setLocalSearch('')
    onFiltersChange({
      page: 1,
      limit: filters.limit || 12,
      isActive: true,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
  }

  const hasActiveFilters = Boolean(
    filters.search || 
    filters.status || 
    filters.priority || 
    filters.type || 
    filters.assignedTo || 
    filters.customerEmail ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.isActive === false
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
            placeholder="Search enquiries by customer, subject, message..."
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

      {/* Quick Status Filters */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-gray-600">Quick filters:</span>
        {Object.entries(ENQUIRY_STATUSES).map(([key, value]) => (
          <button
            key={value}
            onClick={() => handleFilterChange('status', filters.status === value ? undefined : value)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filters.status === value
                ? 'bg-primary-100 text-primary-800 border border-primary-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            {key.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={filters.type || ''}
                onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
                className="form-select w-full"
              >
                <option value="">All Types</option>
                {Object.entries(ENQUIRY_TYPES).map(([key, value]) => (
                  <option key={value} value={value}>
                    {key.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={filters.priority || ''}
                onChange={(e) => handleFilterChange('priority', e.target.value || undefined)}
                className="form-select w-full"
              >
                <option value="">All Priorities</option>
                {Object.entries(ENQUIRY_PRIORITIES).map(([key, value]) => (
                  <option key={value} value={value}>
                    {key.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Email Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Email
              </label>
              <input
                type="email"
                placeholder="customer@example.com"
                value={filters.customerEmail || ''}
                onChange={(e) => handleFilterChange('customerEmail', e.target.value || undefined)}
                className="form-input w-full"
              />
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date From
              </label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value || undefined)}
                className="form-input w-full"
              />
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
                <option value="updatedAt">Last Updated</option>
                <option value="priority">Priority</option>
                <option value="status">Status</option>
                <option value="customerName">Customer Name</option>
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
            
            {filters.status && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                Status: {filters.status.replace('-', ' ')}
                <button
                  onClick={() => handleFilterChange('status', undefined)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {filters.priority && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                Priority: {filters.priority}
                <button
                  onClick={() => handleFilterChange('priority', undefined)}
                  className="ml-1 text-orange-600 hover:text-orange-800"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {filters.type && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">
                Type: {filters.type}
                <button
                  onClick={() => handleFilterChange('type', undefined)}
                  className="ml-1 text-green-600 hover:text-green-800"
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
