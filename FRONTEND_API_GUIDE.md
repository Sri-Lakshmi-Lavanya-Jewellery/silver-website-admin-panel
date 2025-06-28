# Frontend API Integration - Updated

This document describes how to use the updated API integration in the Silver Shop Admin frontend.

## Quick Start

### 1. Import APIs
```typescript
import { productApi, categoryApi, authApi, imageApi, bulkApi, analyticsApi } from '@/lib/api'
```

### 2. Basic Usage Examples

#### Authentication
```typescript
// Login
const loginResponse = await authApi.login({ 
  email: 'user@example.com', 
  password: 'password123' 
})

// Register
const registerResponse = await authApi.register({
  email: 'user@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe'
})

// Get current user
const user = await authApi.getCurrentUser()

// Logout
await authApi.logout()
```

#### Products
```typescript
// Get all products with filters
const products = await productApi.getProducts({
  page: 1,
  limit: 12,
  category: 'pooja-items',
  inStock: true
})

// Get single product
const product = await productApi.getProduct('product-id')

// Create product
const newProduct = await productApi.createProduct({
  title: 'Silver Deepam',
  images: ['/path/to/image.jpg'],
  category: 'pooja-items',
  subcategory: 'deepam',
  weight: '25g',
  inStock: true,
  isNewProduct: true,
  models: {
    'Standard': {
      'medium': {
        length: '6cm',
        height: '10cm',
        breadth: '6cm',
        weight: '25g',
        images: ['/path/to/model-image.jpg']
      }
    }
  }
})

// Update product
await productApi.updateProduct('product-id', { title: 'Updated Title' })

// Delete product
await productApi.deleteProduct('product-id')

// Update stock status
await productApi.updateStock('product-id', true)
```

#### Image Upload
```typescript
// Upload single image
const imageResponse = await imageApi.uploadImage(file)
const imagePath = imageResponse.data?.path

// Upload multiple images
const multipleResponse = await imageApi.uploadMultipleImages([file1, file2])
const imagePaths = multipleResponse.data?.files.map(f => f.path)
```

#### Categories
```typescript
// Get all categories
const categories = await categoryApi.getCategories()

// Get category hierarchy
const hierarchy = await categoryApi.getCategoryHierarchy()

// Create category
const newCategory = await categoryApi.createCategory({
  name: 'New Category',
  description: 'Category description',
  isActive: true,
  sortOrder: 1
})
```

#### Analytics
```typescript
// Get statistics
const stats = await analyticsApi.getStatistics()

// Get category counts
const categoryCounts = await analyticsApi.getCategoryCounts()
```

#### Bulk Operations
```typescript
// Bulk update products
const updateResult = await bulkApi.updateProducts([
  { id: 'product-1', updateData: { inStock: false } },
  { id: 'product-2', updateData: { title: 'New Title' } }
])

// Bulk delete products
const deleteResult = await bulkApi.deleteProducts(['product-1', 'product-2'])
```

## API Configuration

The API is configured in `lib/apiConfig.ts`. You can modify:

- Base URL
- Default pagination settings
- Image upload limits
- Request timeouts
- Available categories

```typescript
import { API_CONFIG } from '@/lib/apiConfig'

// Access configuration
console.log(API_CONFIG.BASE_URL)
console.log(API_CONFIG.CATEGORIES)
```

## Authentication Token Management

The API automatically handles JWT tokens:

```typescript
import { setAuthToken, getAuthToken } from '@/lib/api'

// Set token (usually done after login)
setAuthToken('your-jwt-token')

// Get current token
const token = getAuthToken()

// Clear token (done on logout)
setAuthToken(null)
```

## Error Handling

All API functions return standardized responses:

```typescript
interface APIResponse<T> {
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

// Usage
try {
  const response = await productApi.getProducts()
  if (response.success && response.data) {
    // Handle success
    console.log(response.data)
  }
} catch (error) {
  // Handle error
  console.error('API Error:', error.message)
}
```

## Testing the API

Use the API Test Panel in Settings to verify API integration:

1. Go to Settings page
2. Use the "API Test Panel" section
3. Click "Test All Endpoints" to verify connectivity
4. Use "Test Product CRUD" to test full product lifecycle

## Environment Variables

Set these in your `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
```

## Available Endpoints

See the full list in `API_DOCUMENTATION.md` or check `lib/apiConfig.ts` for endpoint constants.

### Product Endpoints
- `GET /products` - List products with filters
- `GET /products/:id` - Get single product
- `POST /products` - Create product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product
- `PATCH /products/:id/stock` - Update stock status

### Category Endpoints
- `GET /categories` - List categories
- `GET /categories/hierarchy` - Get hierarchy
- `POST /categories` - Create category
- `PUT /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

### Authentication Endpoints
- `POST /auth/register` - Register user
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user

### Image Upload Endpoints
- `POST /upload/image` - Upload single image
- `POST /upload/multiple-images` - Upload multiple images

### Analytics Endpoints
- `GET /products/analytics/statistics` - Get statistics
- `GET /products/analytics/categories` - Get category counts

### Bulk Operations Endpoints
- `POST /bulk/products/update` - Bulk update products
- `POST /bulk/products/delete` - Bulk delete products

## TypeScript Support

All APIs are fully typed. Import types from `@/types`:

```typescript
import { Product, ProductFormData, Category, User } from '@/types'
```

## Demo Data

Use the demo utilities for testing:

```typescript
import { apiDemo } from '@/lib/api'

// Generate sample product
const sampleProduct = apiDemo.generateSampleProduct()

// Test all endpoints
const results = await apiDemo.testAllEndpoints()

// Test product CRUD
const crudResult = await apiDemo.testProductCRUD()
```
