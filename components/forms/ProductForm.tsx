'use client'

import { useState, useEffect, useCallback } from 'react'
import { Product, ProductFormData, CATEGORIES } from '@/types'
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import ImageUpload from '@/components/ui/ImageUpload'

interface ProductFormProps {
  product?: Product | null
  onSubmit: (data: ProductFormData) => void
  onCancel: () => void
}

export default function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    images: [],
    isNewProduct: false,
    category: 'pooja-items',
    subcategory: '',
    weight: '',
    inStock: true,
    models: {
      'Model 1': {
        'standard': {
          length: '',
          height: '',
          breadth: '',
          weight: '',
          images: []
        }
      }
    }
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title,
        images: product.images || [],
        isNewProduct: product.isNewProduct,
        category: product.category,
        subcategory: product.subcategory,
        weight: product.weight,
        inStock: product.inStock,
        models: product.models
      })
    }
  }, [product])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Product title is required'
    }

    if (!formData.category) {
      newErrors.category = 'Category is required'
    }

    if (!formData.weight.trim()) {
      newErrors.weight = 'Weight is required'
    }

    if (formData.images.length === 0) {
      newErrors.images = 'At least one product image is required'
    }

    // Validate models
    const modelNames = Object.keys(formData.models)
    if (modelNames.length === 0) {
      newErrors.models = 'At least one product model is required'
    } else {
      for (const modelName of modelNames) {
        const model = formData.models[modelName]
        const dimensionKeys = Object.keys(model)
        if (dimensionKeys.length === 0) {
          newErrors.models = `Model "${modelName}" must have at least one dimension`
          break
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const addModel = () => {
    const modelCount = Object.keys(formData.models).length
    const newModelName = `Model ${modelCount + 1}`
    setFormData({
      ...formData,
      models: {
        ...formData.models,
        [newModelName]: {
          'standard': {
            length: '',
            height: '',
            breadth: '',
            weight: '',
            images: []
          }
        }
      }
    })
  }

  const removeModel = (modelName: string) => {
    const newModels = { ...formData.models }
    delete newModels[modelName]
    setFormData({ ...formData, models: newModels })
  }

  const updateModelName = (oldName: string, newName: string) => {
    if (oldName === newName || !newName.trim()) return
    
    const newModels = { ...formData.models }
    newModels[newName] = newModels[oldName]
    delete newModels[oldName]
    setFormData({ ...formData, models: newModels })
  }

  const updateModelDimension = (modelName: string, dimensionKey: string, field: string, value: string | string[]) => {
    setFormData({
      ...formData,
      models: {
        ...formData.models,
        [modelName]: {
          ...formData.models[modelName],
          [dimensionKey]: {
            ...formData.models[modelName][dimensionKey],
            [field]: value
          }
        }
      }
    })
  }

  const updateModelImages = (modelName: string, dimensionKey: string, images: string[]) => {
    updateModelDimension(modelName, dimensionKey, 'images', images)
  }

  // Optimized callbacks to prevent unnecessary re-renders
  const handleProductImagesChange = useCallback((images: string[]) => {
    setFormData(prev => ({ ...prev, images }))
  }, [])

  const handleModelImagesChange = useCallback((modelName: string, dimensionKey: string) => {
    return (images: string[]) => updateModelImages(modelName, dimensionKey, images)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {product ? 'Edit Product' : 'Add New Product'}
        </h1>
        <button 
          onClick={onCancel}
          className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-full"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="form-input"
                  placeholder="Enter product title"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="form-select"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>

              {/* Subcategory */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subcategory
                </label>
                <input
                  type="text"
                  value={formData.subcategory}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  className="form-input"
                  placeholder="e.g., kamakshi-deepam"
                />
              </div>

              {/* Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight *
                </label>
                <input
                  type="text"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="form-input"
                  placeholder="e.g., 20g-60g"
                />
                {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight}</p>}
              </div>

              {/* Checkboxes */}
              <div className="flex space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isNewProduct}
                    onChange={(e) => setFormData({ ...formData, isNewProduct: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">New Product</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.inStock}
                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">In Stock</span>
                </label>
              </div>
            </div>
          </div>

          {/* Product Images */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Images *</h2>
            <ImageUpload
              images={formData.images}
              onImagesChange={handleProductImagesChange}
              maxImages={8}
            />
            {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
          </div>

          {/* Product Models */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Product Models</h2>
              <button
                type="button"
                onClick={addModel}
                className="flex items-center text-primary-600 hover:text-primary-700"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Add Model
              </button>
            </div>
            
            <div className="space-y-6">
              {Object.entries(formData.models).map(([modelName, model]) => (
                <div key={modelName} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex-1 mr-4">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Model Name</label>
                      <input
                        type="text"
                        value={modelName}
                        onChange={(e) => updateModelName(modelName, e.target.value)}
                        className="form-input-sm max-w-xs"
                        placeholder="Enter model name"
                      />
                    </div>
                    {Object.keys(formData.models).length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeModel(modelName)}
                        className="text-red-600 hover:bg-red-50 p-1 rounded"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {Object.entries(model).map(([dimensionKey, dimension]) => (
                    <div key={dimensionKey} className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Length</label>
                          <input
                            type="text"
                            value={dimension.length}
                            onChange={(e) => updateModelDimension(modelName, dimensionKey, 'length', e.target.value)}
                            className="form-input-sm"
                            placeholder="5cm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Height</label>
                          <input
                            type="text"
                            value={dimension.height}
                            onChange={(e) => updateModelDimension(modelName, dimensionKey, 'height', e.target.value)}
                            className="form-input-sm"
                            placeholder="8cm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Breadth</label>
                          <input
                            type="text"
                            value={dimension.breadth}
                            onChange={(e) => updateModelDimension(modelName, dimensionKey, 'breadth', e.target.value)}
                            className="form-input-sm"
                            placeholder="5cm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Weight</label>
                          <input
                            type="text"
                            value={dimension.weight}
                            onChange={(e) => updateModelDimension(modelName, dimensionKey, 'weight', e.target.value)}
                            className="form-input-sm"
                            placeholder="25g"
                          />
                        </div>
                      </div>
                      
                      {/* Model Images */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {modelName} - {dimensionKey} Images
                        </label>
                        <ImageUpload
                          images={dimension.images || []}
                          onImagesChange={handleModelImagesChange(modelName, dimensionKey)}
                          maxImages={5}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            {errors.models && <p className="text-red-500 text-sm mt-1">{errors.models}</p>}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            {product ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  )
}
