'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Enquiry, ENQUIRY_STATUSES } from '@/types'
import { 
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  TagIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'

interface EnquiryDetailModalProps {
  enquiry: Enquiry
  isOpen: boolean
  onClose: () => void
  onUpdateStatus: (id: string, status: string) => void
  onAssignEnquiry: (id: string, userId: string) => void
  onAddResponse: (id: string, message: string) => void
  onDelete: (id: string) => void
}

export default function EnquiryDetailModal({
  enquiry,
  isOpen,
  onClose,
  onUpdateStatus,
  onAssignEnquiry,
  onAddResponse,
  onDelete
}: EnquiryDetailModalProps) {
  const router = useRouter()
  const [responseMessage, setResponseMessage] = useState('')
  const [isAddingResponse, setIsAddingResponse] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [localStatus, setLocalStatus] = useState<'pending' | 'in-progress' | 'resolved' | 'closed'>(enquiry.status)
  const [productDetails, setProductDetails] = useState<any>(null)
  const [loadingProduct, setLoadingProduct] = useState(false)

  if (!isOpen) return null

  // Update local status when enquiry prop changes
  useEffect(() => {
    setLocalStatus(enquiry.status)
  }, [enquiry.status])

  // Fetch product details if we only have an ID
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (typeof enquiry.productId === 'string' && enquiry.productId && !productDetails && !loadingProduct) {
        try {
          setLoadingProduct(true)
          const { productApi } = await import('@/lib/api')
          const response = await productApi.getProduct(enquiry.productId)
          if (response.success && response.data) {
            setProductDetails(response.data)
          }
        } catch (error) {
          console.error('Failed to fetch product details:', error)
        } finally {
          setLoadingProduct(false)
        }
      }
    }

    fetchProductDetails()
  }, [enquiry.productId, productDetails, loadingProduct])

  // Helper function to get the correct enquiry ID
  const getEnquiryId = () => {
    return enquiry.id || enquiry._id || ''
  }

  // Helper function to get product ID and details
  const getProductInfo = () => {
    if (!enquiry.productId) return null
    
    // Handle different cases of productId structure
    let productId = ''
    let productTitle = 'Unknown Product'
    let productImages: string[] = []
    
    if (typeof enquiry.productId === 'string') {
      // If productId is just a string ID
      productId = enquiry.productId
      // Use fetched product details if available
      if (productDetails) {
        productTitle = productDetails.title || 'Unknown Product'
        productImages = productDetails.images || []
      } else if (loadingProduct) {
        productTitle = 'Loading product...'
      }
    } else if (typeof enquiry.productId === 'object') {
      // If productId is a populated object
      productId = enquiry.productId.id || enquiry.productId._id || ''
      productTitle = enquiry.productId.title || 'Unknown Product'
      productImages = enquiry.productId.images || []
    }
    
    return { productId, productTitle, productImages }
  }

  const handleAddResponse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!responseMessage.trim()) return

    try {
      setIsAddingResponse(true)
      await onAddResponse(getEnquiryId(), responseMessage)
      setResponseMessage('')
    } finally {
      setIsAddingResponse(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    const validStatus = newStatus as 'pending' | 'in-progress' | 'resolved' | 'closed'
    
    try {
      setIsUpdatingStatus(true)
      setLocalStatus(validStatus) // Optimistic update for immediate UI feedback
      await onUpdateStatus(getEnquiryId(), newStatus)
    } catch (error) {
      // Revert on error
      setLocalStatus(enquiry.status)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleProductClick = () => {
    const productInfo = getProductInfo()
    if (productInfo?.productId) {
      router.push(`/products/${productInfo.productId}`)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50'
      case 'in-progress': return 'text-blue-600 bg-blue-50'
      case 'resolved': return 'text-green-600 bg-green-50'
      case 'closed': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">{enquiry.subject}</h2>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(enquiry.priority)}`}>
              {enquiry.priority}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(localStatus)}`}>
              {localStatus.replace('-', ' ')}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-6 space-y-6">
            {/* Customer Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <UserIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-900">{enquiry.customerName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-900">{enquiry.customerEmail}</span>
                </div>
                {enquiry.customerPhone && (
                  <div className="flex items-center space-x-2">
                    <PhoneIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-900">{enquiry.customerPhone}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {new Date(enquiry.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Enquiry Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Enquiry Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <span className="text-sm text-gray-900 capitalize">{enquiry.type}</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Message</label>
                  <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{enquiry.message}</p>
                </div>
                {enquiry.productId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Related Product</label>
                    {loadingProduct ? (
                      <div className="mt-1 p-2 bg-gray-50 rounded-md">
                        <span className="text-sm text-gray-600">Loading product details...</span>
                      </div>
                    ) : getProductInfo()?.productId ? (
                      <div 
                        className="flex items-center space-x-3 mt-1 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
                        onClick={handleProductClick}
                        title="Click to view product details"
                      >
                        {getProductInfo()?.productImages?.[0] && (
                          <img
                            src={getProductInfo()!.productImages[0]}
                            alt={getProductInfo()!.productTitle}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex flex-col">
                          <span className="text-sm text-blue-600 hover:text-blue-800 font-medium underline">
                            {getProductInfo()?.productTitle}
                          </span>
                          <span className="text-xs text-gray-500">
                            ID: {getProductInfo()?.productId} • Click to view product
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-1 p-2 bg-yellow-50 rounded-md">
                        <span className="text-sm text-yellow-800">
                          Product reference found but details unavailable
                        </span>
                        {typeof enquiry.productId === 'string' && (
                          <div className="text-xs text-yellow-600 mt-1">
                            Product ID: {enquiry.productId}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {enquiry.tags.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tags</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {enquiry.tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Responses */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
                Responses ({enquiry.responses.length})
              </h3>
              
              <div className="space-y-4">
                {enquiry.responses.map((response, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {response.respondedBy?.name || 'Admin'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(response.respondedAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{response.message}</p>
                  </div>
                ))}
                
                {enquiry.responses.length === 0 && (
                  <p className="text-sm text-gray-500 italic">No responses yet</p>
                )}
              </div>

              {/* Add Response Form */}
              <form onSubmit={handleAddResponse} className="mt-4">
                <textarea
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  placeholder="Add a response..."
                  rows={3}
                  className="form-textarea w-full"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={!responseMessage.trim() || isAddingResponse}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAddingResponse ? 'Adding...' : 'Add Response'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <select
                value={localStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isUpdatingStatus}
                className={`form-select text-sm ${isUpdatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {Object.entries(ENQUIRY_STATUSES).map(([key, value]) => (
                  <option key={value} value={value}>
                    {key.replace('_', ' ')}
                  </option>
                ))}
              </select>
              {isUpdatingStatus && (
                <div className="flex items-center text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                  Updating...
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => onDelete(getEnquiryId())}
                className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50"
              >
                Delete
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
