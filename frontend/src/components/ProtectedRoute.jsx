import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loading from './Loading'

export default function ProtectedRoute({ children, roles = [] }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Loading fullPage />

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    // Redirect to the appropriate dashboard
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />
    if (user.role === 'provider') return <Navigate to="/provider/dashboard" replace />
    return <Navigate to="/customer/dashboard" replace />
  }

  return children
}
