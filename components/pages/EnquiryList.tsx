'use client'

import { useState } from 'react'
import { Enquiry, EnquiryFilters, ENQUIRY_STATUSES } from '@/types'
import { 
  ClockIcon, 
  UserIcon, 
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  TagIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline'
import EnquiryDetailModal from '@/components/ui/EnquiryDetailModal'

interface EnquiryListProps {
  enquiries: Enquiry[]
  loading: boolean
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  onUpdateStatus: (id: string, status: string) => void
  onAssignEnquiry: (id: string, userId: string) => void
  onAddResponse: (id: string, message: string) => void
  onDelete: (id: string) => void
  onBulkStatusUpdate: (enquiryIds: string[], status: string) => void
  onFiltersChange: (filters: any) => void
}

export default function EnquiryList({ 
  enquiries, 
  loading, 
  pagination, 
  onUpdateStatus,
  onAssignEnquiry,
  onAddResponse,
  onDelete,
  onBulkStatusUpdate,
  onFiltersChange
}: EnquiryListProps) {
  const [selectedEnquiries, setSelectedEnquiries] = useState<string[]>([])
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const handlePageChange = (page: number) => {
    onFiltersChange({ page })
  }

  const handleSelectEnquiry = (id: string) => {
    setSelectedEnquiries(prev => 
      prev.includes(id) 
        ? prev.filter(enquiryId => enquiryId !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedEnquiries.length === enquiries.length) {
      setSelectedEnquiries([])
    } else {
      setSelectedEnquiries(enquiries.map(e => e.id))
    }
  }

  const handleBulkAction = (status: string) => {
    if (selectedEnquiries.length === 0) return
    onBulkStatusUpdate(selectedEnquiries, status)
    setSelectedEnquiries([])
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'complaint': return 'text-red-600 bg-red-50'
      case 'product': return 'text-blue-600 bg-blue-50'
      case 'order': return 'text-purple-600 bg-purple-50'
      case 'suggestion': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="space-y-6">
      {/* Bulk Actions */}
      {selectedEnquiries.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedEnquiries.length} enquiries selected
            </span>
            <div className="flex space-x-2">
              {Object.entries(ENQUIRY_STATUSES).map(([key, value]) => (
                <button
                  key={value}
                  onClick={() => handleBulkAction(value)}
                  className="px-3 py-1 text-xs bg-white text-blue-700 border border-blue-300 rounded hover:bg-blue-50"
                >
                  Mark as {key.replace('_', ' ').toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Enquiries Grid */}
      {enquiries.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">📧</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No enquiries found</h3>
          <p className="text-gray-500">No enquiries match your current filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedEnquiries.length === enquiries.length && enquiries.length > 0}
                onChange={handleSelectAll}
                className="form-checkbox h-4 w-4 text-primary-600"
              />
              <span className="ml-3 text-sm font-medium text-gray-700">
                {selectedEnquiries.length > 0 ? `${selectedEnquiries.length} selected` : 'Select all'}
              </span>
            </div>
          </div>

          {/* Enquiries List */}
          <div className="divide-y divide-gray-200">
            {enquiries.map((enquiry) => (
              <EnquiryCard
                key={enquiry.id}
                enquiry={enquiry}
                isSelected={selectedEnquiries.includes(enquiry.id)}
                onSelect={() => handleSelectEnquiry(enquiry.id)}
                onView={() => {
                  setSelectedEnquiry(enquiry)
                  setShowDetailModal(true)
                }}
                onUpdateStatus={onUpdateStatus}
                onDelete={onDelete}
                getPriorityColor={getPriorityColor}
                getStatusColor={getStatusColor}
                getTypeColor={getTypeColor}
              />
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} enquiries
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
              >
                Previous
              </button>
              
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 text-sm rounded-md ${
                    page === pagination.page
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedEnquiry && (
        <EnquiryDetailModal
          enquiry={selectedEnquiry}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedEnquiry(null)
          }}
          onUpdateStatus={onUpdateStatus}
          onAssignEnquiry={onAssignEnquiry}
          onAddResponse={onAddResponse}
          onDelete={onDelete}
        />
      )}
    </div>
  )
}

interface EnquiryCardProps {
  enquiry: Enquiry
  isSelected: boolean
  onSelect: () => void
  onView: () => void
  onUpdateStatus: (id: string, status: string) => void
  onDelete: (id: string) => void
  getPriorityColor: (priority: string) => string
  getStatusColor: (status: string) => string
  getTypeColor: (type: string) => string
}

function EnquiryCard({ 
  enquiry, 
  isSelected, 
  onSelect, 
  onView, 
  onUpdateStatus, 
  onDelete,
  getPriorityColor,
  getStatusColor,
  getTypeColor
}: EnquiryCardProps) {
  const [showActions, setShowActions] = useState(false)

  return (
    <div className={`p-6 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}>
      <div className="flex items-start space-x-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="form-checkbox h-4 w-4 text-primary-600 mt-1"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h3 
                className="text-sm font-medium text-gray-900 cursor-pointer hover:text-primary-600"
                onClick={onView}
              >
                {enquiry.subject}
              </h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(enquiry.priority)}`}>
                {enquiry.priority}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(enquiry.status)}`}>
                {enquiry.status.replace('-', ' ')}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(enquiry.type)}`}>
                {enquiry.type}
              </span>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <EllipsisVerticalIcon className="w-5 h-5" />
              </button>
              
              {showActions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onView()
                        setShowActions(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      View Details
                    </button>
                    {Object.entries(ENQUIRY_STATUSES).map(([key, value]) => (
                      <button
                        key={value}
                        onClick={() => {
                          onUpdateStatus(enquiry.id, value)
                          setShowActions(false)
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Mark as {key.replace('_', ' ').toLowerCase()}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        onDelete(enquiry.id)
                        setShowActions(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <UserIcon className="w-4 h-4" />
              <span>{enquiry.customerName}</span>
            </div>
            <div className="flex items-center space-x-1">
              <EnvelopeIcon className="w-4 h-4" />
              <span>{enquiry.customerEmail}</span>
            </div>
            {enquiry.customerPhone && (
              <div className="flex items-center space-x-1">
                <PhoneIcon className="w-4 h-4" />
                <span>{enquiry.customerPhone}</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <CalendarIcon className="w-4 h-4" />
              <span>{new Date(enquiry.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">{enquiry.message}</p>
          
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {enquiry.responses.length > 0 && (
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                  <span>{enquiry.responses.length} responses</span>
                </div>
              )}
              {enquiry.assignedTo && (
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <UserGroupIcon className="w-4 h-4" />
                  <span>Assigned to {enquiry.assignedTo.name}</span>
                </div>
              )}
              {enquiry.tags.length > 0 && (
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <TagIcon className="w-4 h-4" />
                  <span>{enquiry.tags.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
