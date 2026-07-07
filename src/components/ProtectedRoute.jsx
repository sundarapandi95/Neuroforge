import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute() {
  const { token, loading } = useAuth()

  if (loading) {
    return <div style={{ padding: 48, textAlign: 'center', color: 'var(--ink-500)' }}>Loading...</div>
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
