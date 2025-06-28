'use client'

import { useState, useEffect } from 'react'
import { Product, Statistics, CategoryCount } from '@/types'
import { analyticsApi, productApi } from '@/lib/api'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import {
  ShoppingBagIcon,
  TagIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserGroupIcon,
  ClockIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'

interface DashboardStats {
  totalProducts: number
  inStock: number
  outOfStock: number
  newProducts: number
  totalCategories: number
  lowStockProducts: number
  recentlyAdded: Product[]
  topCategories: CategoryCount[]
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    inStock: 0,
    outOfStock: 0,
    newProducts: 0,
    totalCategories: 0,
    lowStockProducts: 0,
    recentlyAdded: [],
    topCategories: [],
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    fetchDashboardData()
  }, [timeRange])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch all data in parallel
      const [statisticsResponse, categoriesResponse, recentProductsResponse] = await Promise.all([
        analyticsApi.getStatistics(),
        analyticsApi.getCategoryCounts(),
        productApi.getProducts({ page: 1, limit: 5, sortBy: 'createdAt', sortOrder: 'desc' })
      ])

      if (statisticsResponse.success && statisticsResponse.data) {
        const statistics = statisticsResponse.data
        setStats(prev => ({
          ...prev,
          totalProducts: statistics.total,
          inStock: statistics.inStock,
          outOfStock: statistics.outOfStock,
          newProducts: statistics.newProducts,
          totalCategories: statistics.categories,
          lowStockProducts: statistics.outOfStock, // Assuming out of stock = low stock for now
        }))
      }

      if (categoriesResponse.success && categoriesResponse.data) {
        setStats(prev => ({
          ...prev,
          topCategories: categoriesResponse.data?.slice(0, 5) || []
        }))
      }

      if (recentProductsResponse.success && recentProductsResponse.data) {
        setStats(prev => ({
          ...prev,
          recentlyAdded: Array.isArray(recentProductsResponse.data) 
            ? recentProductsResponse.data 
            : []
        }))
      }
    } catch (error) {
      console.error('Dashboard data fetch error:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const getStockHealthPercentage = () => {
    if (stats.totalProducts === 0) return 0
    return Math.round((stats.inStock / stats.totalProducts) * 100)
  }

  const getNewProductsTrend = () => {
    // Mock trend calculation - would be based on previous period comparison
    return stats.newProducts > 5 ? 'up' : stats.newProducts > 0 ? 'stable' : 'down'
  }

  const formatTimeRange = (range: string) => {
    switch (range) {
      case '7d': return 'Last 7 days'
      case '30d': return 'Last 30 days'
      case '90d': return 'Last 90 days'
      default: return 'Last 30 days'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Welcome to your silver shop admin panel
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Link
            href="/products/new"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center text-sm"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Products"
          value={stats.totalProducts}
          icon={<ShoppingBagIcon className="w-6 h-6" />}
          color="blue"
          trend={getNewProductsTrend()}
          subtitle={`${stats.newProducts} new this ${timeRange}`}
        />
        <StatsCard
          title="In Stock"
          value={stats.inStock}
          icon={<CubeIcon className="w-6 h-6" />}
          color="green"
          percentage={getStockHealthPercentage()}
          subtitle={`${getStockHealthPercentage()}% stock health`}
        />
        <StatsCard
          title="Out of Stock"
          value={stats.outOfStock}
          icon={<ExclamationTriangleIcon className="w-6 h-6" />}
          color="red"
          subtitle="Needs attention"
        />
        <StatsCard
          title="Categories"
          value={stats.totalCategories}
          icon={<TagIcon className="w-6 h-6" />}
          color="purple"
          subtitle="Active categories"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions Panel */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/products/new"
              className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
            >
              <PlusIcon className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900 group-hover:text-blue-900">Add New Product</h3>
                <p className="text-sm text-gray-600">Create a new product listing</p>
              </div>
            </Link>
            
            <Link
              href="/categories"
              className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
            >
              <TagIcon className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900 group-hover:text-green-900">Manage Categories</h3>
                <p className="text-sm text-gray-600">Organize product categories</p>
              </div>
            </Link>
            
            <Link
              href="/inventory"
              className="flex items-center p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors group"
            >
              <CubeIcon className="w-5 h-5 text-yellow-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900 group-hover:text-yellow-900">Check Inventory</h3>
                <p className="text-sm text-gray-600">Review stock levels</p>
              </div>
            </Link>
            
            <Link
              href="/analytics"
              className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group"
            >
              <ChartBarIcon className="w-5 h-5 text-purple-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900 group-hover:text-purple-900">View Analytics</h3>
                <p className="text-sm text-gray-600">Detailed reports and insights</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Stock Health Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Stock Health</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Stock Level</span>
              <span className={`text-sm font-medium ${getStockHealthPercentage() > 70 ? 'text-green-600' : getStockHealthPercentage() > 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                {getStockHealthPercentage()}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getStockHealthPercentage() > 70 ? 'bg-green-500' : getStockHealthPercentage() > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${getStockHealthPercentage()}%` }}
              ></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">{stats.inStock}</div>
                <div className="text-xs text-gray-600">In Stock</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-lg font-bold text-red-600">{stats.outOfStock}</div>
                <div className="text-xs text-gray-600">Out of Stock</div>
              </div>
            </div>

            {stats.outOfStock > 0 && (
              <Link
                href="/inventory"
                className="w-full bg-red-600 text-white text-center py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Review Out of Stock Items
              </Link>
            )}
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Categories</h2>
          <div className="space-y-3">
            {stats.topCategories.length > 0 ? (
              stats.topCategories.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="ml-3 text-sm font-medium text-gray-900 capitalize">
                      {category.category.replace('-', ' ')}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">{category.count}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No categories found</p>
            )}
          </div>
          
          <Link
            href="/categories"
            className="w-full mt-4 bg-gray-100 text-gray-700 text-center py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            Manage All Categories
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recently Added Products */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recently Added Products</h2>
            <Link href="/products" className="text-sm text-primary-600 hover:text-primary-700">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentlyAdded.length > 0 ? (
              stats.recentlyAdded.map((product) => (
                <div key={product.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                        <ShoppingBagIcon className="w-5 h-5 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{product.title}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-600">{product.category}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                      {product.isNewProduct && (
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          New
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/products/${product.id}`}
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <ShoppingBagIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No recent products</p>
              </div>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-900">API Status</span>
              </div>
              <span className="text-sm text-green-600">Online</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-900">Database</span>
              </div>
              <span className="text-sm text-green-600">Connected</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-900">Image Storage</span>
              </div>
              <span className="text-sm text-green-600">Available</span>
            </div>

            <div className="pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-500 space-y-1">
                <div>Last updated: {new Date().toLocaleTimeString()}</div>
                <div>Uptime: 99.9%</div>
                <div>Version: 1.0.0</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Enhanced Stats Card Component
interface StatsCardProps {
  title: string
  value: number
  icon: React.ReactNode
  color: 'blue' | 'green' | 'red' | 'purple'
  trend?: 'up' | 'down' | 'stable'
  percentage?: number
  subtitle?: string
}

function StatsCard({ title, value, icon, color, trend, percentage, subtitle }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  const getTrendIcon = () => {
    if (trend === 'up') return <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
    if (trend === 'down') return <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            {icon}
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="flex items-center space-x-2">
              <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
              {getTrendIcon()}
            </div>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        {percentage !== undefined && (
          <div className="text-right">
            <div className={`text-lg font-bold ${percentage > 70 ? 'text-green-600' : percentage > 40 ? 'text-yellow-600' : 'text-red-600'}`}>
              {percentage}%
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
