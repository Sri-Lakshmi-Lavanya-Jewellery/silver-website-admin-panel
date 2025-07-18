'use client'

import { EnquiryStatistics } from '@/types'
import { 
  ClockIcon, 
  PlayIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'

interface EnquiryStatsCardsProps {
  statistics: EnquiryStatistics | null
  loading: boolean
}

export default function EnquiryStatsCards({ statistics, loading }: EnquiryStatsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!statistics) {
    return null
  }

  const stats = [
    {
      name: 'Total Enquiries',
      value: statistics.total,
      icon: ClockIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'Pending',
      value: statistics.pending,
      icon: ClockIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      name: 'In Progress',
      value: statistics.inProgress,
      icon: PlayIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'Resolved',
      value: statistics.resolved,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: 'High Priority',
      value: statistics.high,
      icon: ExclamationTriangleIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      name: 'Urgent',
      value: statistics.urgent,
      icon: ExclamationCircleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
      {stats.map((stat) => (
        <div key={stat.name} className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className={`flex-shrink-0 ${stat.bgColor} rounded-md p-3`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{stat.name}</p>
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
