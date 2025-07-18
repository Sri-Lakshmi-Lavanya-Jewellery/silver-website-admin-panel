import EnquiryDetailPage from '@/components/pages/EnquiryDetailPage'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export const metadata = {
  title: 'Enquiry Details - Silver Shop Admin',
  description: 'View and manage enquiry details',
}

interface EnquiryDetailRouteProps {
  params: {
    id: string
  }
}

export default function EnquiryDetailRoute({ params }: EnquiryDetailRouteProps) {
  return (
    <ProtectedRoute allowedRoles={['admin', 'editor']}>
      <EnquiryDetailPage enquiryId={params.id} />
    </ProtectedRoute>
  )
}
