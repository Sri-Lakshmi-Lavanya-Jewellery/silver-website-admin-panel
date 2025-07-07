import { 
  Product, 
  ProductFilters, 
  APIResponse, 
  Statistics, 
  CategoryCount, 
  ProductFormData,
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Category,
  ImageUploadResponse,
  MultipleImageUploadResponse,
  BulkUpdateOperation,
  BulkOperationResult
} from '@/types'
import { API_CONFIG } from './apiConfig'

const API_BASE_URL = API_CONFIG.BASE_URL

export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

// Token management
let authToken: string | null = null

export const setAuthToken = (token: string | null) => {
  authToken = token
}

export const getAuthToken = () => authToken

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<APIResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(response.status, data.message || 'API request failed')
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    console.error('Network error:', error)
    throw new ApiError(500, 'Network error occurred')
  }
}

// Image Upload API
export const imageApi = {
  // Upload single image
  uploadImage: async (file: File): Promise<APIResponse<ImageUploadResponse>> => {
    const formData = new FormData()
    formData.append('image', file)

    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      body: formData,
      headers: {
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
      },
    })

    const data = await response.json()
    if (!response.ok) {
      throw new ApiError(response.status, data.message || 'Image upload failed')
    }
    return data
  },

  // Upload multiple images
  uploadMultipleImages: async (files: File[]): Promise<APIResponse<MultipleImageUploadResponse>> => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('images', file)
    })

    const response = await fetch(`${API_BASE_URL}/upload/multiple-images`, {
      method: 'POST',
      body: formData,
      headers: {
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
      },
    })

    const data = await response.json()
    if (!response.ok) {
      throw new ApiError(response.status, data.message || 'Images upload failed')
    }
    return data
  },

  // Delete image
  deleteImage: async (imageUrl: string): Promise<APIResponse<null>> => {
    return apiRequest<null>('/upload/delete', {
      method: 'DELETE',
      body: JSON.stringify({ imageUrl }),
    })
  },
}

// Product API functions
export const productApi = {
  // Get all products with filters
  getProducts: async (filters: ProductFilters = {}): Promise<APIResponse<Product[]> & { pagination?: any }> => {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value))
      }
    })

    const queryString = params.toString()
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`
    
    return apiRequest<Product[]>(endpoint)
  },

  // Get single product
  getProduct: async (id: string): Promise<APIResponse<Product>> => {
    return apiRequest<Product>(`/products/${id}`)
  },

  // Create product
  createProduct: async (productData: ProductFormData): Promise<APIResponse<Product>> => {
    return apiRequest<Product>('/products', {
      method: 'POST',
      body: JSON.stringify({
        ...productData,
        createdBy: 'ADMIN_USER' // You can replace this with actual user ID
      }),
    })
  },

  // Update product
  updateProduct: async (id: string, productData: Partial<ProductFormData>): Promise<APIResponse<Product>> => {
    return apiRequest<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    })
  },

  // Delete product
  deleteProduct: async (id: string): Promise<APIResponse<null>> => {
    return apiRequest<null>(`/products/${id}`, {
      method: 'DELETE',
    })
  },

  // Update stock status
  updateStock: async (id: string, inStock: boolean): Promise<APIResponse<Product>> => {
    return apiRequest<Product>(`/products/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ inStock }),
    })
  },

  // Get products by category
  getProductsByCategory: async (category: string): Promise<APIResponse<Product[]>> => {
    return apiRequest<Product[]>(`/products/category/${category}`)
  },

  // Get products by subcategory
  getProductsBySubcategory: async (subcategory: string): Promise<APIResponse<Product[]>> => {
    return apiRequest<Product[]>(`/products/subcategory/${subcategory}`)
  },

  // Search products
  searchProducts: async (query: string): Promise<APIResponse<Product[]>> => {
    return apiRequest<Product[]>(`/products/search/${encodeURIComponent(query)}`)
  },

  // Get in-stock products
  getInStockProducts: async (): Promise<APIResponse<Product[]>> => {
    return apiRequest<Product[]>('/products/filter/in-stock')
  },

  // Get new products
  getNewProducts: async (): Promise<APIResponse<Product[]>> => {
    return apiRequest<Product[]>('/products?isNewProduct=true')
  },

  // Product Models Management
  addModel: async (productId: string, modelName: string, dimensions: any): Promise<APIResponse<Product>> => {
    return apiRequest<Product>(`/products/${productId}/models/${modelName}`, {
      method: 'POST',
      body: JSON.stringify({ dimensions }),
    })
  },

  updateModel: async (productId: string, modelName: string, dimensions: any): Promise<APIResponse<Product>> => {
    return apiRequest<Product>(`/products/${productId}/models/${modelName}`, {
      method: 'PUT',
      body: JSON.stringify({ dimensions }),
    })
  },

  removeModel: async (productId: string, modelName: string): Promise<APIResponse<Product>> => {
    return apiRequest<Product>(`/products/${productId}/models/${modelName}`, {
      method: 'DELETE',
    })
  },
}

// Category API functions
export const categoryApi = {
  // Get all categories
  getCategories: async (includeInactive: boolean = false): Promise<APIResponse<Category[]>> => {
    return apiRequest<Category[]>(`/categories?includeInactive=${includeInactive}`)
  },

  getTopLevelCategories : async (includeInactive: boolean = false): Promise<APIResponse<Category[]>> => {
    return apiRequest<Category[]>(`/categories/top-level?includeInactive=${includeInactive}`)
  },

  // Get category hierarchy
  getCategoryHierarchy: async (): Promise<APIResponse<Category[]>> => {
    return apiRequest<Category[]>('/categories/hierarchy')
  },

  // Create category
  createCategory: async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'children'>): Promise<APIResponse<Category>> => {
    return apiRequest<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    })
  },

  // Update category
  updateCategory: async (id: string, categoryData: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>): Promise<APIResponse<Category>> => {
    return apiRequest<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    })
  },

  // Delete category
  deleteCategory: async (id: string): Promise<APIResponse<null>> => {
    return apiRequest<null>(`/categories/${id}`, {
      method: 'DELETE',
    })
  },
  // Get category with products
  getCategoryProducts: async (id: string, page: number = 1, limit: number = 10): Promise<APIResponse<{ products: Product[]; category: Category }>> => {
    return apiRequest<{ products: Product[]; category: Category }>(`/categories/${id}/products?page=${page}&limit=${limit}`)
  },
  // Get subcategories for a category
  getSubcategories(categoryId: string): Promise<APIResponse<Category[]>> {
    return apiRequest<Category[]>(`/categories/${categoryId}/subcategories`)
  },
}

// Analytics API functions
export const analyticsApi = {
  // Get overall statistics
  getStatistics: async (): Promise<APIResponse<Statistics>> => {
    return apiRequest<Statistics>('/products/analytics/statistics')
  },

  // Get categories with counts
  getCategoryCounts: async (): Promise<APIResponse<CategoryCount[]>> => {
    return apiRequest<CategoryCount[]>('/products/analytics/categories')
  },

  // Get subcategories for category
  getSubcategories: async (category: string): Promise<APIResponse<string[]>> => {
    return apiRequest<string[]>(`/products/categories/${category}/subcategories`)
  },
}

// Authentication API
export const authApi = {
  // Register user
  register: async (userData: RegisterRequest): Promise<APIResponse<AuthResponse>> => {
    return apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  },

  // Login
  login: async (credentials: LoginRequest): Promise<APIResponse<AuthResponse>> => {
    const response = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
    
    // Store token for future requests
    if (response.success && response.data?.token) {
      setAuthToken(response.data.token)
    }
    
    return response
  },

  // Logout
  logout: async (): Promise<APIResponse<null>> => {
    const response = await apiRequest<null>('/auth/logout', {
      method: 'POST',
    })
    
    // Clear stored token
    setAuthToken(null)
    
    return response
  },

  // Get current user profile
  getCurrentUser: async (): Promise<APIResponse<User>> => {
    return apiRequest<User>('/auth/me')
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<APIResponse<AuthResponse>> => {
    const response = await apiRequest<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    })
    
    // Store new token for future requests
    if (response.success && response.data?.token) {
      setAuthToken(response.data.token)
    }
    
    return response
  },
}

// Health check and API info
export const healthApi = {
  check: async (): Promise<{ status: string; timestamp: string }> => {
    const response = await fetch(`${API_BASE_URL.replace('/api/v1', '')}/health`)
    if (!response.ok) {
      throw new ApiError(response.status, 'Health check failed')
    }
    return response.json()
  },

  getApiInfo: async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}`)
    if (!response.ok) {
      throw new ApiError(response.status, 'API info request failed')
    }
    return response.json()
  },
}

// Utility functions
export const apiUtils = {
  // Test if API is available
  testConnection: async (): Promise<boolean> => {
    try {
      await healthApi.check()
      return true
    } catch {
      return false
    }
  },

  // Handle API errors consistently
  handleError: (error: any): string => {
    if (error instanceof ApiError) {
      return error.message
    }
    if (error.message) {
      return error.message
    }
    return 'An unexpected error occurred'
  },
}

// Bulk Operations API (Admin/Manager Only)
export const bulkApi = {
  // Bulk update products
  updateProducts: async (operations: BulkUpdateOperation[]): Promise<APIResponse<BulkOperationResult>> => {
    return apiRequest<BulkOperationResult>('/bulk/products/update', {
      method: 'POST',
      body: JSON.stringify({ operations }),
    })
  },

  // Bulk delete products
  deleteProducts: async (productIds: string[]): Promise<APIResponse<BulkOperationResult>> => {
    return apiRequest<BulkOperationResult>('/bulk/products/delete', {
      method: 'POST',
      body: JSON.stringify({ productIds }),
    })
  },
}

// API Testing and Demo utilities
export const apiDemo = {
  // Test all major endpoints
  testAllEndpoints: async (): Promise<{ endpoint: string; status: 'success' | 'error'; message: string }[]> => {
    const results: { endpoint: string; status: 'success' | 'error'; message: string }[] = []

    // Test health check
    try {
      await healthApi.check()
      results.push({ endpoint: '/health', status: 'success', message: 'OK' })
    } catch (error) {
      results.push({ endpoint: '/health', status: 'error', message: apiUtils.handleError(error) })
    }

    // Test API info
    try {
      await healthApi.getApiInfo()
      results.push({ endpoint: '/api/v1', status: 'success', message: 'OK' })
    } catch (error) {
      results.push({ endpoint: '/api/v1', status: 'error', message: apiUtils.handleError(error) })
    }

    // Test products endpoint
    try {
      await productApi.getProducts({ limit: 1 })
      results.push({ endpoint: '/products', status: 'success', message: 'OK' })
    } catch (error) {
      results.push({ endpoint: '/products', status: 'error', message: apiUtils.handleError(error) })
    }

    // Test categories endpoint
    try {
      await categoryApi.getCategories()
      results.push({ endpoint: '/categories', status: 'success', message: 'OK' })
    } catch (error) {
      results.push({ endpoint: '/categories', status: 'error', message: apiUtils.handleError(error) })
    }

    // Test analytics endpoint
    try {
      await analyticsApi.getStatistics()
      results.push({ endpoint: '/products/analytics/statistics', status: 'success', message: 'OK' })
    } catch (error) {
      results.push({ endpoint: '/products/analytics/statistics', status: 'error', message: apiUtils.handleError(error) })
    }

    return results
  },

  // Generate sample data for testing
  generateSampleProduct: (): ProductFormData => ({
    title: 'Sample Silver Deepam',
    images: ['/assets/images/sample.jpg'],
    isNewProduct: true,
    category: 'pooja-items',
    subcategory: 'deepam',
    weight: '25g',
    inStock: true,
    models: {
      'Standard': {
        'medium': {
          length: '6cm',
          height: '10cm',
          breadth: '6cm',
          weight: '25g',
          images: ['/assets/images/sample-model.jpg']
        }
      }
    }
  }),

  // Test product CRUD operations
  testProductCRUD: async () => {
    const sampleProduct = apiDemo.generateSampleProduct()
    
    try {
      // Create
      const createResponse = await productApi.createProduct(sampleProduct)
      if (!createResponse.success || !createResponse.data) {
        throw new Error('Failed to create product')
      }

      const productId = createResponse.data.id

      // Read
      const readResponse = await productApi.getProduct(productId)
      if (!readResponse.success) {
        throw new Error('Failed to read product')
      }

      // Update
      const updateResponse = await productApi.updateProduct(productId, { title: 'Updated Title' })
      if (!updateResponse.success) {
        throw new Error('Failed to update product')
      }

      // Delete
      const deleteResponse = await productApi.deleteProduct(productId)
      if (!deleteResponse.success) {
        throw new Error('Failed to delete product')
      }

      return { status: 'success', message: 'All CRUD operations completed successfully' }
    } catch (error) {
      return { status: 'error', message: apiUtils.handleError(error) }
    }
  }
}
