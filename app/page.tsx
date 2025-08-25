import { ProtectedRoute } from '@/components/auth/protected-route'
import Dashboard from '@/components/dashboard/dashboard'

export default function Home() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  )
} 