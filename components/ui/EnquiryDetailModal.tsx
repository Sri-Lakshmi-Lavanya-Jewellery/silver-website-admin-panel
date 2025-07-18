'use client'

import { useState } from 'react'
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
  const [responseMessage, setResponseMessage] = useState('')
  const [isAddingResponse, setIsAddingResponse] = useState(false)

  if (!isOpen) return null

  const handleAddResponse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!responseMessage.trim()) return

    try {
      setIsAddingResponse(true)
      await onAddResponse(enquiry.id, responseMessage)
      setResponseMessage('')
    } finally {
      setIsAddingResponse(false)
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
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(enquiry.status)}`}>
              {enquiry.status.replace('-', ' ')}
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
                    <div className="flex items-center space-x-3 mt-1">
                      {enquiry.productId.images?.[0] && (
                        <img
                          src={enquiry.productId.images[0]}
                          alt={enquiry.productId.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <span className="text-sm text-gray-900">{enquiry.productId.title}</span>
                    </div>
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
                value={enquiry.status}
                onChange={(e) => onUpdateStatus(enquiry.id, e.target.value)}
                className="form-select text-sm"
              >
                {Object.entries(ENQUIRY_STATUSES).map(([key, value]) => (
                  <option key={value} value={value}>
                    {key.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => onDelete(enquiry.id)}
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
