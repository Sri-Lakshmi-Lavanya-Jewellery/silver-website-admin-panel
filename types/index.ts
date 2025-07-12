export interface Product {
  id: string
  title: string
  description?: string
  images: string[]
  isNewProduct: boolean
  category: CategoryInfo
  subcategory: CategoryInfo
  weight: string
  inStock: boolean
  isActive?: boolean
  models: Record<string, Record<string, ProductDimension>>
  createdAt: string
  updatedAt: string
  createdBy?: string | null
}

export interface CategoryInfo {
  id: string
  name: string
  slug: string
  description?: string
}

export interface ProductDimension {
  length: string
  height: string
  breadth: string
  weight: string
  images: string[]
}

export interface ProductFormData {
  title: string
  description?: string;
  images: string[]
  isNewProduct: boolean
  category: string
  subcategory: string
  weight: string
  inStock: boolean
  isActive?: boolean
  models: Record<string, Record<string, ProductDimension>>
}

export interface APIResponse<T> {
  success: boolean
  data?: T
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ProductFilters {
  page?: number
  limit?: number
  category?: string
  subcategory?: string
  isNewProduct?: boolean
  inStock?: boolean
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface Statistics {
  total: number
  inStock: number
  outOfStock: number
  newProducts: number
  categories: number
}

export interface CategoryCount {
  category: string
  count: number
}

export const CATEGORIES = [
  'pooja-items',
  'jewelry',
  'home-decor',
  'gifts',
  'traditional',
  'festival',
  'other'
] as const

// Authentication types
export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'editor' | 'viewer'
  createdAt: string
  updatedAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  role?: 'admin' | 'editor' | 'viewer'
}

// Category types
export interface Category {
  id: string
  name: string
  description?: string
  thumbnail?: string | null
  parentId?: string | null
  isActive: boolean
  sortOrder?: number
  createdAt: string
  updatedAt: string
  children?: Category[]
}

// Image upload types
export interface UploadedFile {
  publicId: string
  filename: string
  originalName: string
  size: number
  url: string
  urls: {
    thumbnail: string
    medium: string
    large: string
    original: string
  }
  cloudinary: boolean
}

export interface ImageUploadResponse {
  publicId: string
  filename: string
  originalName: string
  size: number
  url: string
  urls: {
    thumbnail: string
    medium: string
    large: string
    original: string
  }
  cloudinary: boolean
  debug?: any
}

export interface MultipleImageUploadResponse {
  images: UploadedFile[]
  count: number
  debug?: any
}

// Bulk operations types
export interface BulkUpdateOperation {
  id: string
  updateData: Partial<ProductFormData>
}

export interface BulkOperationResult {
  successful: number
  failed: number
  results: any[]
}

// Utility functions for handling category display
export const getCategoryDisplayName = (category: CategoryInfo | string | undefined | null): string => {
  if (!category) return 'Uncategorized'
  if (typeof category === 'object') return category.name
  if (typeof category === 'string') return category.replace('-', ' ')
  return 'Uncategorized'
}

export const getSubcategoryDisplayName = (subcategory: CategoryInfo | string | undefined | null): string => {
  if (!subcategory) return ''
  if (typeof subcategory === 'object') return subcategory.name
  if (typeof subcategory === 'string') return subcategory.replace('-', ' ')
  return ''
}
