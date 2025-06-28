# Backend Category API Structure

This document provides sample JSON structures for implementing categories with thumbnail images in your backend API.

## Database Schema

### Categories Table
```sql
CREATE TABLE categories (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail VARCHAR(500),  -- URL to the thumbnail image
  parent_id VARCHAR(36),
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_parent_id (parent_id),
  INDEX idx_is_active (is_active),
  INDEX idx_sort_order (sort_order)
);
```

## API Endpoints

### 1. GET /api/categories - Get all categories
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Jewelry",
      "description": "Beautiful handcrafted jewelry pieces",
      "thumbnail": "https://example.com/uploads/categories/jewelry-thumb.jpg",
      "parentId": null,
      "isActive": true,
      "sortOrder": 1,
      "createdAt": "2025-06-28T10:00:00.000Z",
      "updatedAt": "2025-06-28T10:00:00.000Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "Rings",
      "description": "Elegant rings for all occasions",
      "thumbnail": "https://example.com/uploads/categories/rings-thumb.jpg",
      "parentId": "550e8400-e29b-41d4-a716-446655440001",
      "isActive": true,
      "sortOrder": 1,
      "createdAt": "2025-06-28T10:00:00.000Z",
      "updatedAt": "2025-06-28T10:00:00.000Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "name": "Home Decor",
      "description": "Traditional and modern home decoration items",
      "thumbnail": "https://example.com/uploads/categories/home-decor-thumb.jpg",
      "parentId": null,
      "isActive": true,
      "sortOrder": 2,
      "createdAt": "2025-06-28T10:00:00.000Z",
      "updatedAt": "2025-06-28T10:00:00.000Z"
    }
  ]
}
```

### 2. GET /api/categories/hierarchy - Get categories with children
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Jewelry",
      "description": "Beautiful handcrafted jewelry pieces",
      "thumbnail": "https://example.com/uploads/categories/jewelry-thumb.jpg",
      "parentId": null,
      "isActive": true,
      "sortOrder": 1,
      "createdAt": "2025-06-28T10:00:00.000Z",
      "updatedAt": "2025-06-28T10:00:00.000Z",
      "children": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440002",
          "name": "Rings",
          "description": "Elegant rings for all occasions",
          "thumbnail": "https://example.com/uploads/categories/rings-thumb.jpg",
          "parentId": "550e8400-e29b-41d4-a716-446655440001",
          "isActive": true,
          "sortOrder": 1,
          "createdAt": "2025-06-28T10:00:00.000Z",
          "updatedAt": "2025-06-28T10:00:00.000Z",
          "children": []
        },
        {
          "id": "550e8400-e29b-41d4-a716-446655440004",
          "name": "Necklaces",
          "description": "Beautiful necklaces and pendants",
          "thumbnail": "https://example.com/uploads/categories/necklaces-thumb.jpg",
          "parentId": "550e8400-e29b-41d4-a716-446655440001",
          "isActive": true,
          "sortOrder": 2,
          "createdAt": "2025-06-28T10:00:00.000Z",
          "updatedAt": "2025-06-28T10:00:00.000Z",
          "children": []
        }
      ]
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "name": "Home Decor",
      "description": "Traditional and modern home decoration items",
      "thumbnail": "https://example.com/uploads/categories/home-decor-thumb.jpg",
      "parentId": null,
      "isActive": true,
      "sortOrder": 2,
      "createdAt": "2025-06-28T10:00:00.000Z",
      "updatedAt": "2025-06-28T10:00:00.000Z",
      "children": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440005",
          "name": "Wall Art",
          "description": "Beautiful wall decorations",
          "thumbnail": "https://example.com/uploads/categories/wall-art-thumb.jpg",
          "parentId": "550e8400-e29b-41d4-a716-446655440003",
          "isActive": true,
          "sortOrder": 1,
          "createdAt": "2025-06-28T10:00:00.000Z",
          "updatedAt": "2025-06-28T10:00:00.000Z",
          "children": []
        }
      ]
    }
  ]
}
```

### 3. POST /api/categories - Create new category
**Request Body:**
```json
{
  "name": "Earrings",
  "description": "Beautiful earrings collection",
  "thumbnail": "https://example.com/uploads/categories/earrings-thumb.jpg",
  "parentId": "550e8400-e29b-41d4-a716-446655440001",
  "isActive": true,
  "sortOrder": 3
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440006",
    "name": "Earrings",
    "description": "Beautiful earrings collection",
    "thumbnail": "https://example.com/uploads/categories/earrings-thumb.jpg",
    "parentId": "550e8400-e29b-41d4-a716-446655440001",
    "isActive": true,
    "sortOrder": 3,
    "createdAt": "2025-06-28T12:00:00.000Z",
    "updatedAt": "2025-06-28T12:00:00.000Z"
  },
  "message": "Category created successfully"
}
```

### 4. PUT /api/categories/:id - Update category
**Request Body:**
```json
{
  "name": "Premium Earrings",
  "description": "Premium handcrafted earrings collection",
  "thumbnail": "https://example.com/uploads/categories/premium-earrings-thumb.jpg",
  "isActive": true,
  "sortOrder": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440006",
    "name": "Premium Earrings",
    "description": "Premium handcrafted earrings collection",
    "thumbnail": "https://example.com/uploads/categories/premium-earrings-thumb.jpg",
    "parentId": "550e8400-e29b-41d4-a716-446655440001",
    "isActive": true,
    "sortOrder": 1,
    "createdAt": "2025-06-28T12:00:00.000Z",
    "updatedAt": "2025-06-28T13:00:00.000Z"
  },
  "message": "Category updated successfully"
}
```

### 5. DELETE /api/categories/:id - Delete category
**Response:**
```json
{
  "success": true,
  "data": null,
  "message": "Category deleted successfully"
}
```

### 6. GET /api/categories/:id/products - Get category with products
**Response:**
```json
{
  "success": true,
  "data": {
    "category": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Jewelry",
      "description": "Beautiful handcrafted jewelry pieces",
      "thumbnail": "https://example.com/uploads/categories/jewelry-thumb.jpg",
      "parentId": null,
      "isActive": true,
      "sortOrder": 1,
      "createdAt": "2025-06-28T10:00:00.000Z",
      "updatedAt": "2025-06-28T10:00:00.000Z"
    },
    "products": [
      {
        "id": "prod-001",
        "title": "Silver Ring",
        "category": "Jewelry",
        "subcategory": "Rings",
        "images": ["https://example.com/uploads/products/ring1.jpg"],
        "inStock": true,
        "isNewProduct": false
      }
    ]
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

## Image Upload Integration

### Thumbnail Upload Process
1. When a category form is submitted with a thumbnail, first upload the image using the existing image upload API
2. The image upload API should return URLs in different sizes (thumbnail, medium, large, original)
3. Store the appropriate size URL in the category's thumbnail field
4. Recommended thumbnail size: 400x400px

### Image Storage Structure
```
/uploads/
  /categories/
    /thumbnails/
      - jewelry-400x400.jpg
      - home-decor-400x400.jpg
      - rings-400x400.jpg
    /originals/
      - jewelry-original.jpg
      - home-decor-original.jpg
      - rings-original.jpg
```

## Validation Rules

### Category Name
- Required
- Minimum 2 characters
- Maximum 100 characters
- Must be unique within the same parent category

### Description
- Optional
- Maximum 500 characters

### Thumbnail
- Optional
- Must be a valid image URL
- Supported formats: JPG, PNG, WebP
- Recommended size: 400x400px

### Parent ID
- Optional (null for root categories)
- Must reference an existing category ID
- Cannot create circular references

### Sort Order
- Integer value
- Default: 0
- Used for ordering categories within the same level

## Error Responses

### Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Category name is required"
    },
    {
      "field": "thumbnail",
      "message": "Invalid image URL format"
    }
  ]
}
```

### Not Found Error
```json
{
  "success": false,
  "message": "Category not found",
  "errorCode": "CATEGORY_NOT_FOUND"
}
```

### Constraint Error
```json
{
  "success": false,
  "message": "Cannot delete category with existing subcategories or products",
  "errorCode": "CATEGORY_HAS_DEPENDENCIES"
}
```
