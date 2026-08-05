'use client'

import { useState, useEffect, useCallback } from 'react'
import { Product, ProductFormData, ProductDimension, Category } from '@/types'
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import ImageUpload from '@/components/ui/ImageUpload'
import { categoryApi } from '@/lib/api'
import { toast } from 'react-hot-toast'

// Utility function to format category/subcategory names
const formatCategoryName = (name: string | undefined | null): string => {
  if (!name || typeof name !== 'string') {
    return ''
  }
  const words = name.replace(/[-_]/g, ' ').split(' ')
  return words.map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  }).join(' ')
}

// Generate a stable, unique id used as the React key for a model row. Because
// it is independent of the (editable) model name, renaming never remounts the
// row — so focus is preserved keystroke-to-keystroke.
let modelIdCounter = 0
const genModelId = () => `model_${Date.now()}_${modelIdCounter++}`

// Internal editor shape: models are an array with a stable id + editable name,
// each holding its dimension map. This is serialized to/from the API's
// name-keyed object shape (Record<name, Record<dimensionKey, dimension>>).
interface EditableModel {
  id: string
  name: string
  dimensions: Record<string, ProductDimension>
}

const makeDefaultDimensions = (): Record<string, ProductDimension> => ({
  standard: {
    length: '',
    height: '',
    breadth: '',
    weight: '',
    images: [],
  },
})

// API object -> editor array
const modelsToList = (models: ProductFormData['models']): EditableModel[] => {
  const entries = Object.entries(models || {})
  if (entries.length === 0) {
    return [{ id: genModelId(), name: 'Model 1', dimensions: makeDefaultDimensions() }]
  }
  return entries.map(([name, dimensions]) => ({
    id: genModelId(),
    name,
    dimensions: dimensions as Record<string, ProductDimension>,
  }))
}

// editor array -> API object. Later models win if two share a name, but the
// caller validates uniqueness first so this never silently clobbers in practice.
const listToModels = (list: EditableModel[]): ProductFormData['models'] => {
  const out: ProductFormData['models'] = {}
  list.forEach((m) => {
    out[m.name] = m.dimensions
  })
  return out
}

interface ProductFormProps {
  product?: Product | null
  onSubmit: (data: ProductFormData) => void
  onCancel: () => void
}

export default function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState<Omit<ProductFormData, 'models'>>({
    title: '',
    description: '',
    images: [],
    isNewProduct: false,
    category: '',
    subcategory: '',
    weight: '',
    inStock: true,
    isActive: true,
  })

  // Models are edited as a stable-id array (see EditableModel).
  const [modelList, setModelList] = useState<EditableModel[]>(() => [
    { id: genModelId(), name: 'Model 1', dimensions: makeDefaultDimensions() },
  ])

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loadingSubcategories, setLoadingSubcategories] = useState(false)


  // Fetch all categories (flat list) on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true)
        const response = await categoryApi.getCategoryHierarchy()
        if (response.success && response.data && response.data.length > 0) {
          // Filter only root categories (categories without parentId)
          let rootCategories = response.data.filter(cat => {
            const hasParent = (cat as any).parentCategory || cat.parentId
            return !hasParent
          })
          // If editing, ensure product's category is present
          if (product && product.category) {
            const prodCatId = typeof product.category === 'object' ? (product.category.id || product.category._id) : product.category
            const found = rootCategories.some(cat => (cat.id === prodCatId) || (cat._id === prodCatId))

            if (!found && typeof product.category === 'object') {
              rootCategories = [
                {
                  ...product.category,
                  _id: product.category.id || product.category._id || '',
                  id: product.category.id || product.category._id || '',
                  isActive: (product.category as any).isActive ?? true,
                  createdAt: (product.category as any).createdAt ?? '',
                  updatedAt: (product.category as any).updatedAt ?? '',
                },
                ...rootCategories
              ]
            }
          }
          setCategories(rootCategories)

          if (!formData.category && rootCategories.length > 0 && !product) {
            setFormData(prev => ({ ...prev, category: rootCategories[0].id || rootCategories[0]._id || '' }))
          }
        }
      } catch (error) {
        toast.error('Failed to load categories')
      } finally {
        setLoadingCategories(false)
      }
    }
    fetchCategories()
  }, [])

  // Fetch subcategories for a given category ID
  const fetchSubcategories = async (categoryId: string) => {
    if (!categoryId) {
      setSubcategories([])
      return
    }
    try {
      setLoadingSubcategories(true)
      const response = await categoryApi.getSubcategories(categoryId)
      if (response.success && response.data) {
        setSubcategories(response.data)
      } else {
        setSubcategories([])
      }
    } catch (error) {
      setSubcategories([])
    } finally {
      setLoadingSubcategories(false)
    }
  }

  // Handle category change (by ID)
  const handleCategoryChange = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      category: categoryId,
      subcategory: ''
    }))
    fetchSubcategories(categoryId)
  }

  // Fetch subcategories when category changes
  useEffect(() => {
    if (formData.category) {
      fetchSubcategories(formData.category)
    } else {
      setSubcategories([])
    }
  }, [formData.category])

  useEffect(() => {
    if (product) {
      const categoryId = typeof product.category === 'object' ? (product.category.id || product.category._id || '') : (product.category || '')
      const subcategoryId = typeof product.subcategory === 'object' ? (product.subcategory.id || product.subcategory._id || '') : (product.subcategory || '')

      setFormData({
        title: product.title,
        description: product.description,
        images: product.images || [],
        isNewProduct: product.isNewProduct,
        category: categoryId,
        subcategory: subcategoryId,
        weight: product.weight,
        inStock: product.inStock,
        isActive: product.isActive,
      })
      setModelList(modelsToList(product.models))
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
    if (modelList.length === 0) {
      newErrors.models = 'At least one product model is required'
    } else {
      // Every model needs a (trimmed) name and at least one dimension.
      const seen = new Set<string>()
      for (const m of modelList) {
        const name = m.name.trim()
        if (!name) {
          newErrors.models = 'Every model must have a name'
          break
        }
        if (seen.has(name.toLowerCase())) {
          newErrors.models = `Duplicate model name "${name}" — model names must be unique`
          break
        }
        seen.add(name.toLowerCase())

        if (Object.keys(m.dimensions).length === 0) {
          newErrors.models = `Model "${name}" must have at least one dimension`
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
      onSubmit({ ...formData, models: listToModels(modelList) })
    }
  }

  const addModel = () => {
    setModelList(prev => [
      ...prev,
      { id: genModelId(), name: `Model ${prev.length + 1}`, dimensions: makeDefaultDimensions() },
    ])
  }

  const removeModel = (id: string) => {
    setModelList(prev => prev.filter(m => m.id !== id))
  }

  // Rename edits only the name field of the matched row (by stable id). The
  // React key never changes, so the input keeps focus while typing. Uniqueness
  // is validated on blur (below) and again at save — we never silently
  // overwrite another model.
  const updateModelName = (id: string, newName: string) => {
    setModelList(prev => prev.map(m => (m.id === id ? { ...m, name: newName } : m)))
  }

  const handleModelNameBlur = (id: string) => {
    const current = modelList.find(m => m.id === id)
    if (!current) return
    const trimmed = current.name.trim()
    if (!trimmed) {
      toast.error('Model name cannot be empty')
      return
    }
    const duplicate = modelList.some(
      m => m.id !== id && m.name.trim().toLowerCase() === trimmed.toLowerCase()
    )
    if (duplicate) {
      toast.error(`Another model is already named "${trimmed}". Model names must be unique.`)
    }
  }

  const updateModelDimension = (modelId: string, dimensionKey: string, field: string, value: string | string[]) => {
    setModelList(prev => prev.map(m => {
      if (m.id !== modelId) return m
      if (!m.dimensions[dimensionKey]) return m
      return {
        ...m,
        dimensions: {
          ...m.dimensions,
          [dimensionKey]: {
            ...m.dimensions[dimensionKey],
            [field]: value,
          },
        },
      }
    }))
  }

  const updateModelImages = (modelId: string, dimensionKey: string, images: string[]) => {
    updateModelDimension(modelId, dimensionKey, 'images', images)
  }

  // Optimized callbacks to prevent unnecessary re-renders
  const handleProductImagesChange = useCallback((images: string[]) => {
    setFormData(prev => ({ ...prev, images }))
  }, [])

  const handleModelImagesChange = useCallback((modelId: string, dimensionKey: string, images: string[]) => {
    updateModelImages(modelId, dimensionKey, images)
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

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-input"
                  placeholder="Enter product Description"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="form-select"
                  disabled={loadingCategories}
                >
                  <option value="">
                    {loadingCategories ? 'Loading categories...' : 'Select a category'}
                  </option>
                  {categories.map((category) => (
                    <option key={category.id || category._id} value={category.id || category._id}>
                      {category.name}
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
                {formData.category ? (
                  <select
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    className="form-select"
                    disabled={loadingSubcategories}
                  >
                    <option value="">
                      {loadingSubcategories ? 'Loading subcategories...' : 'Select a subcategory (optional)'}
                    </option>
                    {subcategories.map((subcategory) => (
                      <option key={subcategory.id || subcategory._id} value={subcategory.id || subcategory._id}>
                        {subcategory.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    className="form-input"
                    placeholder="Select a category first or enter custom subcategory"
                    disabled
                  />
                )}
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

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active Product</span>
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
              {modelList.map((model) => (
                <div key={model.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex-1 mr-4">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Model Name</label>
                      <input
                        type="text"
                        value={model.name}
                        onChange={(e) => updateModelName(model.id, e.target.value)}
                        onBlur={() => handleModelNameBlur(model.id)}
                        className="form-input-sm max-w-xs"
                        placeholder="Enter model name"
                      />
                    </div>
                    {modelList.length > 1 && (
                      <button
                        type="button"
                        aria-label={`Remove ${model.name || 'model'}`}
                        onClick={() => removeModel(model.id)}
                        className="text-red-600 hover:bg-red-50 p-1 rounded"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {Object.entries(model.dimensions).map(([dimensionKey, dimension]) => (
                    <div key={dimensionKey} className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Length</label>
                          <input
                            type="text"
                            value={dimension.length}
                            onChange={(e) => updateModelDimension(model.id, dimensionKey, 'length', e.target.value)}
                            className="form-input-sm"
                            placeholder="5cm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Height</label>
                          <input
                            type="text"
                            value={dimension.height}
                            onChange={(e) => updateModelDimension(model.id, dimensionKey, 'height', e.target.value)}
                            className="form-input-sm"
                            placeholder="8cm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Breadth</label>
                          <input
                            type="text"
                            value={dimension.breadth}
                            onChange={(e) => updateModelDimension(model.id, dimensionKey, 'breadth', e.target.value)}
                            className="form-input-sm"
                            placeholder="5cm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Weight</label>
                          <input
                            type="text"
                            value={dimension.weight}
                            onChange={(e) => updateModelDimension(model.id, dimensionKey, 'weight', e.target.value)}
                            className="form-input-sm"
                            placeholder="25g"
                          />
                        </div>
                      </div>

                      {/* Model Images */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {model.name} - {dimensionKey} Images
                        </label>
                        <ImageUpload
                          images={dimension.images || []}
                          onImagesChange={(images) => handleModelImagesChange(model.id, dimensionKey, images)}
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
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {product ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  )
}
