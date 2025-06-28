'use client'

import { useState } from 'react'
import { healthApi, productApi, categoryApi, analyticsApi, apiDemo, apiUtils } from '@/lib/api'
import { API_CONFIG } from '@/lib/apiConfig'

interface TestResult {
  endpoint: string
  status: 'success' | 'error' | 'pending'
  message: string
  duration?: number
}

export default function ApiTestPanel() {
  const [results, setResults] = useState<TestResult[]>([])
  const [testing, setTesting] = useState(false)

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    const startTime = Date.now()
    
    setResults(prev => [...prev, { 
      endpoint: testName, 
      status: 'pending', 
      message: 'Testing...' 
    }])

    try {
      await testFn()
      const duration = Date.now() - startTime
      
      setResults(prev => prev.map(result => 
        result.endpoint === testName 
          ? { ...result, status: 'success', message: 'OK', duration }
          : result
      ))
    } catch (error) {
      const duration = Date.now() - startTime
      
      setResults(prev => prev.map(result => 
        result.endpoint === testName 
          ? { ...result, status: 'error', message: apiUtils.handleError(error), duration }
          : result
      ))
    }
  }

  const runAllTests = async () => {
    setTesting(true)
    setResults([])

    // Test individual endpoints
    await runTest('Health Check', () => healthApi.check())
    await runTest('API Info', () => healthApi.getApiInfo())
    await runTest('Products List', () => productApi.getProducts({ limit: 1 }))
    await runTest('Categories', () => categoryApi.getCategories())
    await runTest('Statistics', () => analyticsApi.getStatistics())
    await runTest('Category Counts', () => analyticsApi.getCategoryCounts())

    setTesting(false)
  }

  const testProductCRUD = async () => {
    setTesting(true)
    const result = await apiDemo.testProductCRUD()
    
    setResults(prev => [...prev, {
      endpoint: 'Product CRUD Test',
      status: result.status as 'success' | 'error',
      message: result.message
    }])
    
    setTesting(false)
  }

  const clearResults = () => {
    setResults([])
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">API Test Panel</h2>
        <div className="space-x-2">
          <button
            onClick={runAllTests}
            disabled={testing}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {testing ? 'Testing...' : 'Test All Endpoints'}
          </button>
          <button
            onClick={testProductCRUD}
            disabled={testing}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            Test Product CRUD
          </button>
          <button
            onClick={clearResults}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Configuration Info */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">Current Configuration</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <div><strong>Base URL:</strong> {API_CONFIG.BASE_URL}</div>
          <div><strong>Health URL:</strong> {API_CONFIG.HEALTH_URL}</div>
          <div><strong>Available Categories:</strong> {API_CONFIG.CATEGORIES.join(', ')}</div>
        </div>
      </div>

      {/* Test Results */}
      <div className="space-y-2">
        {results.map((result, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border ${
              result.status === 'success' 
                ? 'bg-green-50 border-green-200'
                : result.status === 'error'
                ? 'bg-red-50 border-red-200'
                : 'bg-yellow-50 border-yellow-200'
            }`}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${
                  result.status === 'success' 
                    ? 'bg-green-500'
                    : result.status === 'error'
                    ? 'bg-red-500'
                    : 'bg-yellow-500'
                }`} />
                <span className="font-medium">{result.endpoint}</span>
              </div>
              {result.duration && (
                <span className="text-xs text-gray-500">{result.duration}ms</span>
              )}
            </div>
            <div className={`text-sm mt-1 ${
              result.status === 'error' ? 'text-red-700' : 'text-gray-600'
            }`}>
              {result.message}
            </div>
          </div>
        ))}
      </div>

      {results.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No tests run yet. Click "Test All Endpoints" to start testing the API integration.
        </div>
      )}
    </div>
  )
}
