// API Configuration
export const API_CONFIG = {
  // Base URLs
  // BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://silver-website-backend.onrender.com/api/v1',
  // HEALTH_URL: process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:3000',

  //   // Local Base URLs
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1',
  HEALTH_URL: process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:3000',
  
  // Default pagination
  DEFAULT_PAGE_SIZE: 12,
  DEFAULT_PAGE: 1,
  
  // Image upload limits
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGES_PER_PRODUCT: 8,
  MAX_IMAGES_PER_MODEL: 5,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  
  // API timeouts
  REQUEST_TIMEOUT: 30000, // 30 seconds
  UPLOAD_TIMEOUT: 60000, // 60 seconds for uploads
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
  
  // Available categories (should match backend)
  CATEGORIES: [
    'pooja-items',
    'jewelry',
    'home-decor',
    'gifts',
    'traditional',
    'festival',
    'other'
  ] as const,
  
  // API endpoints
  ENDPOINTS: {
    // Health and info
    HEALTH: '/health',
    API_INFO: '',
    
    // Authentication
    AUTH_REGISTER: '/auth/register',
    AUTH_LOGIN: '/auth/login',
    AUTH_LOGOUT: '/auth/logout',
    AUTH_ME: '/auth/me',
    
    // Products
    PRODUCTS: '/products',
    PRODUCT_BY_ID: (id: string) => `/products/${id}`,
    PRODUCT_STOCK: (id: string) => `/products/${id}/stock`,
    PRODUCT_MODELS: (id: string, model: string) => `/products/${id}/models/${model}`,
    PRODUCTS_BY_CATEGORY: (category: string) => `/products/category/${category}`,
    PRODUCTS_BY_SUBCATEGORY: (subcategory: string) => `/products/subcategory/${subcategory}`,
    PRODUCTS_SEARCH: (query: string) => `/products/search/${encodeURIComponent(query)}`,
    PRODUCTS_IN_STOCK: '/products/filter/in-stock',
    
    // Analytics
    ANALYTICS_STATISTICS: '/products/analytics/statistics',
    ANALYTICS_CATEGORIES: '/products/analytics/categories',
    CATEGORY_SUBCATEGORIES: (category: string) => `/products/categories/${category}/subcategories`,
    
    // Categories
    CATEGORIES: '/categories',
    CATEGORY_HIERARCHY: '/categories/hierarchy',
    CATEGORY_BY_ID: (id: string) => `/categories/${id}`,
    CATEGORY_PRODUCTS: (id: string) => `/categories/${id}/products`,
    
    // Enquiries
    ENQUIRIES: '/enquiries',
    ENQUIRY_BY_ID: (id: string) => `/enquiries/${id}`,
    ENQUIRY_BY_CUSTOMER: (email: string) => `/enquiries/customer/${encodeURIComponent(email)}`,
    ENQUIRY_UPDATE_STATUS: (id: string) => `/enquiries/${id}/status`,
    ENQUIRY_ADD_RESPONSE: (id: string) => `/enquiries/${id}/responses`,
    ENQUIRY_ASSIGN: (id: string) => `/enquiries/${id}/assign`,
    ENQUIRIES_BY_STATUS: (status: string) => `/enquiries/filter/status/${status}`,
    ENQUIRIES_BY_PRIORITY: (priority: string) => `/enquiries/filter/priority/${priority}`,
    ENQUIRIES_BY_TYPE: (type: string) => `/enquiries/filter/type/${type}`,
    ENQUIRIES_ASSIGNED: (userId: string) => `/enquiries/assigned/${userId}`,
    ENQUIRIES_STATISTICS: '/enquiries/statistics',
    ENQUIRIES_RECENT: '/enquiries/recent',
    ENQUIRIES_BULK_STATUS: '/enquiries/bulk/status',
    
    // Image upload
    UPLOAD_IMAGE: '/upload/image',
    UPLOAD_MULTIPLE: '/upload/multiple-images',
    DELETE_IMAGE: '/upload/delete',
    
    // Bulk operations
    BULK_UPDATE: '/bulk/products/update',
    BULK_DELETE: '/bulk/products/delete',
  },
  
  // HTTP methods
  METHODS: {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    PATCH: 'PATCH',
    DELETE: 'DELETE',
  } as const,
  
  // Content types
  CONTENT_TYPES: {
    JSON: 'application/json',
    FORM_DATA: 'multipart/form-data',
  } as const,
  
  // HTTP status codes
  STATUS_CODES: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
  } as const,
}

export type CategoryType = typeof API_CONFIG.CATEGORIES[number]
export type HTTPMethod = typeof API_CONFIG.METHODS[keyof typeof API_CONFIG.METHODS]
export type ContentType = typeof API_CONFIG.CONTENT_TYPES[keyof typeof API_CONFIG.CONTENT_TYPES]
