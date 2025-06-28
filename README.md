# Silver Shop Admin Panel

A modern, responsive admin panel for managing a silver shop's product catalog and inventory. Built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

### 🚀 Core Features
- **Dashboard Overview** - Real-time statistics and quick insights
- **Product Management** - Full CRUD operations for products
- **Category Management** - Organize products by categories and subcategories
- **Inventory Tracking** - Monitor stock levels and availability
- **Analytics & Reports** - Detailed insights into your catalog
- **Modern UI** - Clean, responsive design with Tailwind CSS

### 📊 Dashboard Features
- Total products count
- Stock status overview
- New products tracking
- Category distribution
- Quick action buttons

### 🛍️ Product Management
- Add, edit, and delete products
- Multiple product images support
- Product models with dimensions
- Category and subcategory organization
- Stock status management
- Search and filter functionality
- Pagination support

### 🎨 Design Features
- Responsive design (mobile, tablet, desktop)
- Silver shop themed color scheme
- Modern card-based layout
- Intuitive navigation
- Toast notifications
- Loading states

## API Integration

This admin panel integrates with your existing backend API running on `http://localhost:3000`. The following API endpoints are supported:

### Product Endpoints
- `GET /api/v1/products` - List products with pagination and filters
- `POST /api/v1/products` - Create new product
- `GET /api/v1/products/:id` - Get single product
- `PUT /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Delete product
- `PATCH /api/v1/products/:id/stock` - Update stock status

### Analytics Endpoints
- `GET /api/v1/products/analytics/statistics` - Overall statistics
- `GET /api/v1/products/analytics/categories` - Category counts

### Search & Filter Endpoints
- `GET /api/v1/products/search/:query` - Search products
- `GET /api/v1/products/category/:category` - Filter by category
- `GET /api/v1/products/subcategory/:subcategory` - Filter by subcategory

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Heroicons
- **State Management**: React Hooks
- **API Client**: Fetch API with custom wrapper
- **Notifications**: React Hot Toast
- **Form Handling**: React Hook Form (planned)
- **Data Fetching**: SWR (included)

## Getting Started

### Prerequisites
- Node.js 18+ installed
- Your backend API running on `http://localhost:3000`

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   Navigate to `http://localhost:3001` to access the admin panel

### Backend Requirements

Make sure your backend API is running on `http://localhost:3000` and implements the endpoints documented in `API_DOCUMENTATION.md`.

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Main dashboard page
│   └── globals.css       # Global styles
├── components/            # React components
│   ├── Sidebar.tsx       # Navigation sidebar
│   ├── Header.tsx        # Top header with search
│   ├── Dashboard.tsx     # Dashboard overview
│   ├── ProductsPage.tsx  # Products management page
│   ├── ProductList.tsx   # Product listing component
│   ├── ProductForm.tsx   # Product create/edit form
│   ├── ProductFilters.tsx # Product filters
│   ├── StatsCard.tsx     # Statistics card component
│   └── ...               # Other components
├── lib/                  # Utility functions
│   └── api.ts           # API client functions
├── types/               # TypeScript type definitions
│   └── index.ts        # Product and API types
├── public/             # Static assets
└── ...config files
```

## Available Scripts

- `npm run dev` - Start development server (port 3001)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Configuration

### API Configuration
The API base URL is configured in `lib/api.ts`. By default, it uses `/api/v1` which proxies to `http://localhost:3000/api/v1` via Next.js rewrites.

### Styling Configuration
- **Colors**: Custom silver shop theme in `tailwind.config.js`
- **Fonts**: System fonts with fallbacks
- **Responsive**: Mobile-first design approach

## Features in Development

- [ ] Advanced product form with file uploads
- [ ] Bulk operations for products
- [ ] Advanced filtering and sorting
- [ ] Export functionality
- [ ] Role-based permissions
- [ ] Real-time updates
- [ ] Advanced analytics charts
- [ ] Inventory alerts
- [ ] Order management integration

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## API Documentation

See `API_DOCUMENTATION.md` for complete API reference and integration guide.

## Support

If you encounter any issues or need help with setup:

1. Check that your backend API is running on `http://localhost:3000`
2. Verify all API endpoints are working as documented
3. Check the browser console for any error messages
4. Review the API documentation for proper request formats

## License

This project is licensed under the MIT License.

---

**Silver Shop Admin Panel** - Built with ❤️ for efficient catalog management
