'use client'

import { useState, useEffect } from 'react'
import { Statistics, CategoryCount, Product } from '@/types'
import { analyticsApi, productApi } from '@/lib/api'
import { toast } from 'react-hot-toast'
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ShoppingBagIcon,
  TagIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline'

interface AnalyticsData {
  statistics: Statistics | null
  categoryBreakdown: CategoryCount[]
  topProducts: Product[]
  stockAnalysis: {
    totalProducts: number
    inStock: number
    outOfStock: number
    lowStock: number
    stockValue: number
  }
  trends: {
    productGrowth: number
    categoryGrowth: number
    stockHealthTrend: number
  }
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>({
    statistics: null,
    categoryBreakdown: [],
    topProducts: [],
    stockAnalysis: {
      totalProducts: 0,
      inStock: 0,
      outOfStock: 0,
      lowStock: 0,
      stockValue: 0,
    },
    trends: {
      productGrowth: 0,
      categoryGrowth: 0,
      stockHealthTrend: 0,
    }
  })
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [selectedMetric, setSelectedMetric] = useState<'products' | 'categories' | 'stock'>('products')

  useEffect(() => {
    fetchAnalyticsData()
  }, [dateRange])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      
      const [statisticsResponse, categoriesResponse, topProductsResponse] = await Promise.all([
        analyticsApi.getStatistics(),
        analyticsApi.getCategoryCounts(),
        productApi.getProducts({ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' })
      ])

      let newData: AnalyticsData = { ...data }

      if (statisticsResponse.success && statisticsResponse.data) {
        newData.statistics = statisticsResponse.data
        newData.stockAnalysis = {
          totalProducts: statisticsResponse.data.total,
          inStock: statisticsResponse.data.inStock,
          outOfStock: statisticsResponse.data.outOfStock,
          lowStock: Math.floor(statisticsResponse.data.outOfStock * 0.3), // Mock low stock
          stockValue: statisticsResponse.data.total * 1250, // Mock value calculation
        }
        
        // Mock trends - in real app, these would be calculated from historical data
        newData.trends = {
          productGrowth: statisticsResponse.data.newProducts > 5 ? 12.5 : -2.3,
          categoryGrowth: statisticsResponse.data.categories > 5 ? 8.7 : 0,
          stockHealthTrend: (statisticsResponse.data.inStock / statisticsResponse.data.total) * 100 > 80 ? 5.2 : -3.1,
        }
      }

      if (categoriesResponse.success && categoriesResponse.data) {
        newData.categoryBreakdown = categoriesResponse.data
      }

      if (topProductsResponse.success && topProductsResponse.data) {
        newData.topProducts = Array.isArray(topProductsResponse.data) 
          ? topProductsResponse.data 
          : []
      }

      setData(newData)
    } catch (error) {
      console.error('Analytics data fetch error:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const getStockHealthColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
    if (trend < 0) return <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
    return <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
  }

  const formatDateRange = (range: string) => {
    switch (range) {
      case '7d': return 'Last 7 days'
      case '30d': return 'Last 30 days'
      case '90d': return 'Last 90 days'
      case '1y': return 'Last year'
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

  const stockHealthPercentage = data.stockAnalysis.totalProducts > 0 
    ? Math.round((data.stockAnalysis.inStock / data.stockAnalysis.totalProducts) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-600">
            Detailed insights and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={fetchAnalyticsData}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center text-sm"
          >
            <ChartBarIcon className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Products"
          value={data.statistics?.total || 0}
          trend={data.trends.productGrowth}
          icon={<ShoppingBagIcon className="w-6 h-6" />}
          color="blue"
          subtitle={`${data.statistics?.newProducts || 0} added this period`}
        />
        <MetricCard
          title="Stock Health"
          value={stockHealthPercentage}
          trend={data.trends.stockHealthTrend}
          icon={<CubeIcon className="w-6 h-6" />}
          color="green"
          subtitle={`${data.stockAnalysis.inStock} items in stock`}
          unit="%"
        />
        <MetricCard
          title="Categories"
          value={data.statistics?.categories || 0}
          trend={data.trends.categoryGrowth}
          icon={<TagIcon className="w-6 h-6" />}
          color="purple"
          subtitle="Active categories"
        />
        <MetricCard
          title="Out of Stock"
          value={data.stockAnalysis.outOfStock}
          trend={-data.trends.stockHealthTrend}
          icon={<ExclamationTriangleIcon className="w-6 h-6" />}
          color="red"
          subtitle="Requires attention"
        />
      </div>

      {/* Charts and Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Category Distribution</h2>
            <span className="text-sm text-gray-500">{formatDateRange(dateRange)}</span>
          </div>
          
          <div className="space-y-4">
            {data.categoryBreakdown.map((category, index) => {
              const total = data.categoryBreakdown.reduce((sum, cat) => sum + cat.count, 0)
              const percentage = total > 0 ? Math.round((category.count / total) * 100) : 0
              
              return (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div className="flex items-center min-w-0 flex-1">
                      <span className="text-sm font-medium text-gray-900 capitalize truncate">
                        {category.category.replace('-', ' ')}
                      </span>
                      <div className="ml-3 flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="ml-3 text-right">
                      <span className="text-sm font-medium text-gray-900">{category.count}</span>
                      <span className="text-xs text-gray-500 ml-1">({percentage}%)</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          
          {data.categoryBreakdown.length === 0 && (
            <div className="text-center py-8">
              <TagIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No category data available</p>
            </div>
          )}
        </div>

        {/* Stock Analysis */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Stock Analysis</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{data.stockAnalysis.inStock}</div>
              <div className="text-sm text-gray-600">In Stock</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{data.stockAnalysis.outOfStock}</div>
              <div className="text-sm text-gray-600">Out of Stock</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Stock Health</span>
                <span className={`text-sm font-medium ${getStockHealthColor(stockHealthPercentage)}`}>
                  {stockHealthPercentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${
                    stockHealthPercentage >= 80 ? 'bg-green-500' : 
                    stockHealthPercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${stockHealthPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Low Stock Items:</span>
                  <span className="ml-2 font-medium text-yellow-600">{data.stockAnalysis.lowStock}</span>
                </div>
                <div>
                  <span className="text-gray-600">Stock Value:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    ${data.stockAnalysis.stockValue.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Recently Added Products</h2>
          
          <div className="space-y-3">
            {data.topProducts.slice(0, 5).map((product) => (
              <div key={product.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <ShoppingBagIcon className="w-4 h-4 text-gray-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{product.title}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-600">
                      {typeof product.category === 'object' ? product.category.name : product.category}
                    </span>
                    {typeof product.subcategory === 'object' && product.subcategory.name && (
                      <span className="text-xs text-gray-500">• {product.subcategory.name}</span>
                    )}
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {data.topProducts.length === 0 && (
            <div className="text-center py-8">
              <ShoppingBagIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No products found</p>
            </div>
          )}
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Performance Trends</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Product Growth</h3>
                <p className="text-sm text-gray-600">Compared to previous period</p>
              </div>
              <div className="flex items-center space-x-2">
                {getTrendIcon(data.trends.productGrowth)}
                <span className={`font-bold ${data.trends.productGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.trends.productGrowth > 0 ? '+' : ''}{data.trends.productGrowth.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Stock Health Trend</h3>
                <p className="text-sm text-gray-600">Stock level changes</p>
              </div>
              <div className="flex items-center space-x-2">
                {getTrendIcon(data.trends.stockHealthTrend)}
                <span className={`font-bold ${data.trends.stockHealthTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.trends.stockHealthTrend > 0 ? '+' : ''}{data.trends.stockHealthTrend.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Category Growth</h3>
                <p className="text-sm text-gray-600">New categories added</p>
              </div>
              <div className="flex items-center space-x-2">
                {getTrendIcon(data.trends.categoryGrowth)}
                <span className={`font-bold ${data.trends.categoryGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.trends.categoryGrowth > 0 ? '+' : ''}{data.trends.categoryGrowth.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Metric Card Component
interface MetricCardProps {
  title: string
  value: number
  trend: number
  icon: React.ReactNode
  color: 'blue' | 'green' | 'red' | 'purple'
  subtitle?: string
  unit?: string
}

function MetricCard({ title, value, trend, icon, color, subtitle, unit = '' }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-500'
    if (trend < 0) return 'text-red-500'
    return 'text-gray-400'
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <ArrowTrendingUpIcon className="w-4 h-4" />
    if (trend < 0) return <ArrowTrendingDownIcon className="w-4 h-4" />
    return <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className={`flex items-center space-x-1 ${getTrendColor(trend)}`}>
          {getTrendIcon(trend)}
          <span className="text-sm font-medium">
            {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
          </span>
        </div>
      </div>
      
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">
          {value.toLocaleString()}{unit}
        </p>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  )
}
