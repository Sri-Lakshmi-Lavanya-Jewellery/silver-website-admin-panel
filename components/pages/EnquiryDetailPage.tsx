'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Enquiry } from '@/types'
import { enquiryApi } from '@/lib/api'
import { toast } from 'react-hot-toast'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import EnquiryDetailModal from '@/components/ui/EnquiryDetailModal'

interface EnquiryDetailPageProps {
  enquiryId: string
}

export default function EnquiryDetailPage({ enquiryId }: EnquiryDetailPageProps) {
  const router = useRouter()
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEnquiry()
  }, [enquiryId])

  const fetchEnquiry = async () => {
    try {
      setLoading(true)
      const response = await enquiryApi.getEnquiryById(enquiryId)
      
      if (response.success && response.data) {
        setEnquiry(response.data)
      } else {
        toast.error('Enquiry not found')
        router.push('/enquiries')
      }
    } catch (error) {
      toast.error('Failed to load enquiry')
      router.push('/enquiries')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      if (!id) {
        toast.error('Invalid enquiry ID')
        return
      }

      const response = await enquiryApi.updateEnquiryStatus(id, status)
      if (response.success && response.data) {
        toast.success(`Enquiry status updated to ${status}`)
        setEnquiry(response.data)
      }
    } catch (error) {
      toast.error('Failed to update enquiry status')
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
        setEnquiry(response.data)
      }
    } catch (error) {
      toast.error('Failed to assign enquiry')
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
        setEnquiry(response.data)
      }
    } catch (error) {
      toast.error('Failed to add response')
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
        router.push('/enquiries')
      }
    } catch (error) {
      toast.error('Failed to delete enquiry')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!enquiry) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Enquiry not found</h2>
        <p className="text-gray-600 mt-2">The enquiry you're looking for doesn't exist.</p>
        <button
          onClick={() => router.push('/enquiries')}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Back to Enquiries
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.push('/enquiries')}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enquiry Details</h1>
          <p className="mt-1 text-sm text-gray-600">
            View and manage enquiry information
          </p>
        </div>
      </div>

      {/* Enquiry Detail Modal as Page Content */}
      <div className="bg-white rounded-lg shadow-sm">
        <EnquiryDetailModal
          enquiry={enquiry}
          isOpen={true}
          onClose={() => router.push('/enquiries')}
          onUpdateStatus={handleUpdateStatus}
          onAssignEnquiry={handleAssignEnquiry}
          onAddResponse={handleAddResponse}
          onDelete={handleDeleteEnquiry}
        />
      </div>
    </div>
  )
}
