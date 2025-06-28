# Frontend API Integration Guide

**Base URL:** `http://localhost:3000/api/v1`

## Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Quick Start

### Health Check
```bash
GET /health
# Returns: {"status": "OK", "timestamp": "..."}
```

### API Info
```bash
GET /api/v1
# Returns all available endpoints
```

## Authentication API

### 1. Register User
```bash
POST /auth/register
```
**Body:**
```json
{
  "email": "user@example.com",
  "password": "secure123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### 2. Login
```bash
POST /auth/login
```
**Body:**
```json
{
  "email": "user@example.com",
  "password": "secure123"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "user": {...},
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 3. Get User Profile (Protected)
```bash
GET /auth/me
Authorization: Bearer <token>
```

### 4. Logout (Protected)
```bash
POST /auth/logout
Authorization: Bearer <token>
```

## Image Upload API

### 1. Upload Single Image
```bash
POST /upload/image
Content-Type: multipart/form-data
```
**Body:** FormData with `image` field

### 2. Upload Multiple Images
```bash
POST /upload/multiple-images
Content-Type: multipart/form-data
```
**Body:** FormData with `images` field (array)

**Response:**
```json
{
  "success": true,
  "data": {
    "files": [
      {
        "filename": "image_1234567890.jpg",
        "originalName": "myimage.jpg",
        "path": "/uploads/images/image_1234567890.jpg",
        "size": 1024000,
        "mimetype": "image/jpeg"
      }
    ]
  }
}
```

## Category Management API

### 1. Get All Categories
```bash
GET /categories?includeInactive=false
```

### 2. Get Category Hierarchy
```bash
GET /categories/hierarchy
```

### 3. Create Category
```bash
POST /categories
```
**Body:**
```json
{
  "name": "Electronics",
  "description": "Electronic products",
  "parentId": null,
  "isActive": true,
  "sortOrder": 1
}
```

### 4. Update Category
```bash
PUT /categories/:id
```

### 5. Delete Category
```bash
DELETE /categories/:id
```

### 6. Get Category with Products
```bash
GET /categories/:id/products?page=1&limit=10
```

## Bulk Operations API (Admin/Manager Only)

### 1. Bulk Update Products
```bash
POST /bulk/products/update
Authorization: Bearer <admin-token>
```
**Body:**
```json
{
  "operations": [
    {
      "id": "product_id_1",
      "updateData": {
        "price": 999,
        "inStock": true
      }
    },
    {
      "id": "product_id_2", 
      "updateData": {
        "category": "new-category",
        "title": "Updated Title"
      }
    }
  ]
}
```

### 2. Bulk Delete Products
```bash
POST /bulk/products/delete
Authorization: Bearer <admin-token>
```
**Body:**
```json
{
  "productIds": ["product_id_1", "product_id_2", "product_id_3"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "successful": 2,
    "failed": 0,
    "results": [...]
  }
}
```

## Product Management

### 1. Get All Products (With Pagination & Filters)
```bash
GET /products?page=1&limit=10&category=pooja-items&isNewProduct=true
```

**Response:**
```json
{
  "success": true,
  "data": [...products],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

**Available Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `category` - Filter by category
- `subcategory` - Filter by subcategory
- `isNewProduct` - Filter new products (true/false)
- `inStock` - Filter by stock (true/false)
- `search` - Search in title/category
- `sortBy` - Sort field (default: 'createdAt')
- `sortOrder` - 'asc' or 'desc' (default: 'desc')

### 2. Get Single Product
```bash
GET /products/:id
```

### 3. Create Product
```bash
POST /products
Content-Type: application/json

{
  "title": "Silver Kamakshi Deepam",
  "images": ["/assets/images/products/deepam/1.jpg"],
  "isNewProduct": true,
  "category": "pooja-items",
  "subcategory": "kamakshi-deepam",
  "weight": "20g-60g",
  "inStock": true,
  "models": {
    "Model 1": {
      "small": {
        "length": "5cm",
        "height": "8cm",
        "breadth": "5cm",
        "weight": "25g",
        "images": ["/assets/images/products/deepam/small.jpg"]
      }
    }
  },
  "createdBy": "USER_ID_HERE"
}
```

### 4. Update Product
```bash
PUT /products/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "inStock": false
  // Any field can be updated
}
```

### 5. Delete Product
```bash
DELETE /products/:id
```

## Quick Filters

### Get New Products
```bash
GET /products?isNewProduct=true
```

### Get Products by Category
```bash
GET /products/category/pooja-items
```

### Get Products by Subcategory
```bash
GET /products/subcategory/kamakshi-deepam
```

### Search Products
```bash
GET /products/search/deepam
```

### Get In-Stock Products
```bash
GET /products/filter/in-stock
```

## Stock Management

### Update Stock Status
```bash
PATCH /products/:id/stock
Content-Type: application/json

{
  "inStock": true
}
```

## Product Models Management

### Add New Model to Product
```bash
POST /products/:id/models/ModelName
Content-Type: application/json

{
  "dimensions": {
    "large": {
      "length": "8cm",
      "height": "12cm",
      "breadth": "8cm",
      "weight": "80g",
      "images": ["/assets/images/products/deepam/large.jpg"]
    }
  }
}
```

### Update Model
```bash
PUT /products/:id/models/ModelName
```

### Remove Model
```bash
DELETE /products/:id/models/ModelName
```

## Analytics & Statistics

### Get Categories with Counts
```bash
GET /products/analytics/categories
```
**Response:**
```json
{
  "success": true,
  "data": [
    {"category": "pooja-items", "count": 15},
    {"category": "jewelry", "count": 8}
  ]
}
```

### Get Subcategories for Category
```bash
GET /products/categories/pooja-items/subcategories
```

### Get Overall Statistics
```bash
GET /products/analytics/statistics
```
**Response:**
```json
{
  "success": true,
  "data": {
    "total": 50,
    "inStock": 45,
    "outOfStock": 5,
    "newProducts": 12,
    "categories": 6
  }
}
```

## Available Categories
- `pooja-items`
- `jewelry` 
- `home-decor`
- `gifts`
- `traditional`
- `festival`
- `other`

## Product Data Structure

```javascript
// Product Object
{
  id: "string",
  title: "string",
  images: ["url1", "url2"],
  isNewProduct: boolean,
  category: "string",
  subcategory: "string", 
  weight: "string",
  inStock: boolean,
  models: {
    "ModelName": {
      "dimensionKey": {
        length: "string",
        height: "string", 
        breadth: "string",
        weight: "string",
        images: ["url1", "url2"]
      }
    }
  },
  createdAt: "ISO Date",
  updatedAt: "ISO Date"
}
```

## Error Handling

All errors return:
```json
{
  "success": false,
  "message": "Error description"
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request  
- `404` - Not Found
- `500` - Server Error

## Frontend Implementation Tips

### 1. Product Listing with Pagination
```javascript
// Fetch products with filters
const fetchProducts = async (page = 1, filters = {}) => {
  const params = new URLSearchParams({
    page,
    limit: 12,
    ...filters
  });
  
  const response = await fetch(`/api/v1/products?${params}`);
  const data = await response.json();
  
  return data; // { success, data, pagination }
};
```

### 2. Create Product Form
```javascript
const createProduct = async (productData) => {
  const response = await fetch('/api/v1/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...productData,
      createdBy: "USER_ID" // Replace with actual user ID
    })
  });
  
  return response.json();
};
```

### 3. Filter by Category
```javascript
// Get products by category
const getProductsByCategory = async (category) => {
  const response = await fetch(`/api/v1/products/category/${category}`);
  return response.json();
};
```

### 4. Search Products
```javascript
// Search products
const searchProducts = async (query) => {
  const response = await fetch(`/api/v1/products/search/${encodeURIComponent(query)}`);
  return response.json();
};
```

### 5. Update Stock Status
```javascript
const updateStock = async (productId, inStock) => {
  const response = await fetch(`/api/v1/products/${productId}/stock`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inStock })
  });
  
  return response.json();
};
```

## Testing the API

You can test all endpoints using curl or any API client:

```bash
# Test server is running
curl http://localhost:3000/health

# Get all products
curl http://localhost:3000/api/v1/products

# Get products with filters
curl "http://localhost:3000/api/v1/products?category=pooja-items&page=1&limit=5"

# Get single product (replace with actual ID)
curl http://localhost:3000/api/v1/products/PRODUCT_ID

# Get statistics
curl http://localhost:3000/api/v1/products/analytics/statistics
```

## Environment Setup

Make sure the backend server is running on `http://localhost:3000` before making API calls.

---

**Need Help?** Contact the backend team or check the full API documentation in `API_DOCUMENTATION.md`.
