'use client'

import { useState, useEffect } from 'react'
import { Enquiry, EnquiryFilters, EnquiryStatistics } from '@/types'
import { enquiryApi } from '@/lib/api'
import { toast } from 'react-hot-toast'
import EnquiryList from './EnquiryList'
import EnquiryFiltersComponent from '@/components/forms/EnquiryFilters'
import EnquiryStatsCards from '@/components/ui/EnquiryStatsCards'
import { PlusIcon } from '@heroicons/react/24/outline'

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [statistics, setStatistics] = useState<EnquiryStatistics | null>(null)
  const [filters, setFilters] = useState<EnquiryFilters>({
    page: 1,
    limit: 12,
    isActive: true,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })
  const [loading, setLoading] = useState(false)
  const [statsLoading, setStatsLoading] = useState(false)

  useEffect(() => {
    fetchEnquiries()
    fetchStatistics()
  }, [filters])

  const fetchEnquiries = async () => {
    try {
      setLoading(true)
      const response = await enquiryApi.getEnquiries(filters)
      
      if (response.success && response.data) {
        setEnquiries(response.data)
        if (response.pagination) {
          setPagination(response.pagination)
        }
      }
    } catch (error) {
      toast.error('Failed to load enquiries')
      console.error('Enquiries error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      setStatsLoading(true)
      const response = await enquiryApi.getEnquiryStatistics()
      
      if (response.success && response.data) {
        setStatistics(response.data)
      }
    } catch (error) {
      console.error('Statistics error:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      // Ensure we have a valid ID
      if (!id) {
        toast.error('Invalid enquiry ID')
        return
      }

      const response = await enquiryApi.updateEnquiryStatus(id, status)
      if (response.success && response.data) {
        toast.success(`Enquiry status updated to ${status}`)
        // Update the enquiry in the list using both id and _id for compatibility
        setEnquiries(enquiries.map(e => 
          (e.id === id || e._id === id) ? response.data! : e
        ))
        fetchStatistics() // Refresh stats
      }
    } catch (error) {
      toast.error('Failed to update enquiry status')
      console.error('Status update error:', error)
    }
  }

  const handleAssignEnquiry = async (id: string, userId: string) => {
    try {
      if (!id) {
        toast.error('Invalid enquiry ID')
        return
      }

      const response = await enquiryApi.assignEnquiry(id, userId)
      if (response.success && response.data) {
        toast.success('Enquiry assigned successfully')
        setEnquiries(enquiries.map(e => 
          (e.id === id || e._id === id) ? response.data! : e
        ))
      }
    } catch (error) {
      toast.error('Failed to assign enquiry')
      console.error('Assignment error:', error)
    }
  }

  const handleAddResponse = async (id: string, message: string) => {
    try {
      if (!id) {
        toast.error('Invalid enquiry ID')
        return
      }

      const response = await enquiryApi.addResponse(id, message)
      if (response.success && response.data) {
        toast.success('Response added successfully')
        setEnquiries(enquiries.map(e => 
          (e.id === id || e._id === id) ? response.data! : e
        ))
      }
    } catch (error) {
      toast.error('Failed to add response')
      console.error('Response error:', error)
    }
  }

  const handleDeleteEnquiry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this enquiry?')) {
      return
    }

    try {
      if (!id) {
        toast.error('Invalid enquiry ID')
        return
      }

      const response = await enquiryApi.deleteEnquiry(id)
      if (response.success) {
        toast.success('Enquiry deleted successfully')
        setEnquiries(enquiries.filter(e => e.id !== id && e._id !== id))
        fetchStatistics() // Refresh stats
      }
    } catch (error) {
      toast.error('Failed to delete enquiry')
      console.error('Delete enquiry error:', error)
    }
  }

  const handleFiltersChange = (newFilters: Partial<EnquiryFilters>) => {
    setFilters({ ...filters, ...newFilters })
  }

  const handleBulkStatusUpdate = async (enquiryIds: string[], status: string) => {
    try {
      const response = await enquiryApi.bulkUpdateStatus({ 
        enquiryIds, 
        status: status as 'pending' | 'in-progress' | 'resolved' | 'closed'
      })
      if (response.success && response.data) {
        toast.success(`${response.data.updated} enquiries updated successfully`)
        fetchEnquiries() // Refresh the list
        fetchStatistics() // Refresh stats
      }
    } catch (error) {
      toast.error('Failed to update enquiries')
      console.error('Bulk update error:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enquiries</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage customer enquiries and support requests
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <EnquiryStatsCards statistics={statistics} loading={statsLoading} />

      {/* Filters */}
      <EnquiryFiltersComponent
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      {/* Enquiries List */}
      <EnquiryList
        enquiries={enquiries}
        loading={loading}
        pagination={pagination}
        onUpdateStatus={handleUpdateStatus}
        onAssignEnquiry={handleAssignEnquiry}
        onAddResponse={handleAddResponse}
        onDelete={handleDeleteEnquiry}
        onBulkStatusUpdate={handleBulkStatusUpdate}
        onFiltersChange={handleFiltersChange}
      />
    </div>
  )
}
