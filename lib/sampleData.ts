// Sample data for testing the admin panel
export const sampleProducts = [
  {
    id: "1",
    title: "Silver Kamakshi Deepam",
    images: ["/assets/images/products/deepam/1.jpg"],
    isNewProduct: true,
    category: "pooja-items",
    subcategory: "kamakshi-deepam",
    weight: "20g-60g",
    inStock: true,
    models: {
      "Model 1": {
        "small": {
          length: "5cm",
          height: "8cm",
          breadth: "5cm",
          weight: "25g",
          images: ["/assets/images/products/deepam/small.jpg"]
        },
        "medium": {
          length: "7cm",
          height: "10cm",
          breadth: "7cm",
          weight: "45g",
          images: ["/assets/images/products/deepam/medium.jpg"]
        }
      }
    },
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    createdBy: "admin"
  },
  {
    id: "2",
    title: "Traditional Silver Anklets",
    images: ["/assets/images/products/jewelry/anklets/1.jpg"],
    isNewProduct: false,
    category: "jewelry",
    subcategory: "anklets",
    weight: "15g-30g",
    inStock: true,
    models: {
      "Classic": {
        "standard": {
          length: "25cm",
          height: "0.5cm",
          breadth: "0.3cm",
          weight: "20g",
          images: ["/assets/images/products/jewelry/anklets/classic.jpg"]
        }
      }
    },
    createdAt: "2024-01-10T14:20:00Z",
    updatedAt: "2024-01-12T09:15:00Z",
    createdBy: "admin"
  },
  {
    id: "3",
    title: "Silver Pooja Plate Set",
    images: ["/assets/images/products/pooja/plate-set/1.jpg"],
    isNewProduct: true,
    category: "pooja-items",
    subcategory: "plates",
    weight: "200g-500g",
    inStock: false,
    models: {
      "Traditional": {
        "small": {
          length: "15cm",
          height: "2cm",
          breadth: "15cm",
          weight: "250g",
          images: ["/assets/images/products/pooja/plate-set/small.jpg"]
        },
        "large": {
          length: "20cm",
          height: "3cm",
          breadth: "20cm",
          weight: "450g",
          images: ["/assets/images/products/pooja/plate-set/large.jpg"]
        }
      }
    },
    createdAt: "2024-01-08T11:45:00Z",
    updatedAt: "2024-01-14T16:30:00Z",
    createdBy: "admin"
  },
  {
    id: "4",
    title: "Decorative Silver Vase",
    images: ["/assets/images/products/home-decor/vase/1.jpg"],
    isNewProduct: false,
    category: "home-decor",
    subcategory: "vases",
    weight: "300g-800g",
    inStock: true,
    models: {
      "Elegant": {
        "medium": {
          length: "12cm",
          height: "25cm",
          breadth: "12cm",
          weight: "500g",
          images: ["/assets/images/products/home-decor/vase/elegant.jpg"]
        }
      }
    },
    createdAt: "2024-01-05T08:30:00Z",
    updatedAt: "2024-01-05T08:30:00Z",
    createdBy: "admin"
  },
  {
    id: "5",
    title: "Silver Wedding Gift Set",
    images: ["/assets/images/products/gifts/wedding-set/1.jpg"],
    isNewProduct: true,
    category: "gifts",
    subcategory: "wedding-gifts",
    weight: "150g-400g",
    inStock: true,
    models: {
      "Premium": {
        "standard": {
          length: "30cm",
          height: "5cm",
          breadth: "20cm",
          weight: "300g",
          images: ["/assets/images/products/gifts/wedding-set/premium.jpg"]
        }
      }
    },
    createdAt: "2024-01-03T13:20:00Z",
    updatedAt: "2024-01-09T10:45:00Z",
    createdBy: "admin"
  }
]

export const sampleStatistics = {
  total: 25,
  inStock: 20,
  outOfStock: 5,
  newProducts: 8,
  categories: 6
}

export const sampleCategoryStats = [
  { category: "pooja-items", count: 8 },
  { category: "jewelry", count: 6 },
  { category: "home-decor", count: 4 },
  { category: "gifts", count: 3 },
  { category: "traditional", count: 2 },
  { category: "festival", count: 2 }
]

// Sample category hierarchy data for testing
export const sampleCategories = [
  {
    id: "cat-1",
    name: "Pooja Items",
    description: "Religious and spiritual items",
    thumbnail: null,
    parentCategory: null,
    isActive: true,
    sortOrder: 1,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    children: [
      {
        id: "cat-1-1",
        name: "Deepams",
        description: "Traditional oil lamps",
        thumbnail: null,
        parentCategory: "cat-1",
        isActive: true,
        sortOrder: 1,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        children: []
      },
      {
        id: "cat-1-2",
        name: "Incense",
        description: "Agarbatti and dhoop",
        thumbnail: null,
        parentCategory: "cat-1",
        isActive: true,
        sortOrder: 2,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        children: []
      }
    ]
  },
  {
    id: "cat-2",
    name: "Jewelry",
    description: "Silver jewelry and ornaments",
    thumbnail: null,
    parentCategory: null,
    isActive: true,
    sortOrder: 2,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    children: [
      {
        id: "cat-2-1",
        name: "Anklets",
        description: "Traditional silver anklets",
        thumbnail: null,
        parentCategory: "cat-2",
        isActive: true,
        sortOrder: 1,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        children: []
      },
      {
        id: "cat-2-2",
        name: "Bangles",
        description: "Silver bangles and bracelets",
        thumbnail: null,
        parentCategory: "cat-2",
        isActive: true,
        sortOrder: 2,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        children: []
      }
    ]
  },
  {
    id: "cat-3",
    name: "Home Decor",
    description: "Decorative items for home",
    thumbnail: null,
    parentCategory: null,
    isActive: true,
    sortOrder: 3,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    children: []
  }
]
