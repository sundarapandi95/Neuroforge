import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function OrgAdminRoute() {
  const { user } = useAuth()
  if (user && user.role !== 'ORG_ADMIN') {
    return <Navigate to="/dashboard" replace />
  }
  return <Outlet />
}
