import { ProtectedRoute } from '@/components/auth/protected-route'
import InvoiceDashboard from '@/components/invoice/invoice-dashboard'

export default function TagihanPage() {
  return (
    <ProtectedRoute>
      <InvoiceDashboard />
    </ProtectedRoute>
  )
}
