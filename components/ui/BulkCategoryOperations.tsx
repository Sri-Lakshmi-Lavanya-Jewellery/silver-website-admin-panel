'use client'

import { useState } from 'react'
import { Category } from '@/types'
import { categoryApi } from '@/lib/api'
import { toast } from 'react-hot-toast'
import {
  XMarkIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

interface BulkCategoryOperationsProps {
  categories: Category[]
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export default function BulkCategoryOperations({
  categories,
  isOpen,
  onClose,
  onComplete,
}: BulkCategoryOperationsProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [operation, setOperation] = useState<'activate' | 'deactivate' | 'delete'>('activate')
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<{ id: string; name: string; success: boolean; message: string }[]>([])

  const handleSelectAll = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([])
    } else {
      setSelectedCategories(categories.map(cat => cat.id))
    }
  }

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleBulkOperation = async () => {
    if (selectedCategories.length === 0) {
      toast.error('Please select at least one category')
      return
    }

    const confirmMessage = operation === 'delete'
      ? `Are you sure you want to delete ${selectedCategories.length} categories? This action cannot be undone.`
      : `Are you sure you want to ${operation} ${selectedCategories.length} categories?`

    if (!confirm(confirmMessage)) {
      return
    }

    setIsProcessing(true)
    const operationResults: { id: string; name: string; success: boolean; message: string }[] = []

    for (const categoryId of selectedCategories) {
      const category = categories.find(cat => cat.id === categoryId)
      if (!category) continue

      try {
        let response
        
        switch (operation) {
          case 'activate':
            response = await categoryApi.updateCategory(categoryId, { isActive: true })
            break
          case 'deactivate':
            response = await categoryApi.updateCategory(categoryId, { isActive: false })
            break
          case 'delete':
            response = await categoryApi.deleteCategory(categoryId)
            break
        }

        operationResults.push({
          id: categoryId,
          name: category.name,
          success: response.success,
          message: response.success ? 'Success' : (response.message || 'Failed')
        })
      } catch (error) {
        operationResults.push({
          id: categoryId,
          name: category.name,
          success: false,
          message: 'Error occurred'
        })
      }
    }

    setResults(operationResults)
    setIsProcessing(false)

    const successCount = operationResults.filter(r => r.success).length
    const failCount = operationResults.filter(r => !r.success).length

    if (successCount > 0) {
      toast.success(`${successCount} categories ${operation}d successfully${failCount > 0 ? `, ${failCount} failed` : ''}`)
    }
    if (failCount > 0) {
      toast.error(`${failCount} categories failed to ${operation}`)
    }

    onComplete()
  }

  const resetResults = () => {
    setResults([])
    setSelectedCategories([])
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Bulk Category Operations</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {results.length === 0 ? (
            <>
              {/* Operation Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Operation
                </label>
                <select
                  value={operation}
                  onChange={(e) => setOperation(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="activate">Activate Categories</option>
                  <option value="deactivate">Deactivate Categories</option>
                  <option value="delete">Delete Categories</option>
                </select>
              </div>

              {/* Category Selection */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Categories ({selectedCategories.length} selected)
                  </label>
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    {selectedCategories.length === categories.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className="flex items-center p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => handleSelectCategory(category.id)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{category.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              category.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {category.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        {category.description && (
                          <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Results Display */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium text-gray-900">Operation Results</h4>
                <button
                  onClick={resetResults}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Start New Operation
                </button>
              </div>

              <div className="space-y-2">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className={`flex items-center p-3 rounded-lg border ${
                      result.success
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    {result.success ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3" />
                    ) : (
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-3" />
                    )}
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">{result.name}</span>
                      <span className={`ml-2 text-sm ${
                        result.success ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {result.message}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            {results.length > 0 ? 'Close' : 'Cancel'}
          </button>
          {results.length === 0 && (
            <button
              onClick={handleBulkOperation}
              disabled={isProcessing || selectedCategories.length === 0}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <ArrowRightIcon className="w-4 h-4 mr-2" />
                  {operation === 'delete' ? 'Delete' : operation === 'activate' ? 'Activate' : 'Deactivate'} Selected
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
