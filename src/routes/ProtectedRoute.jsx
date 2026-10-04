import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, role, loading, getRoleDashboardRoute } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-xs text-slate-400">
        Authenticating session...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // If user's role does not match, redirect to their role's dashboard
    return <Navigate to={getRoleDashboardRoute(role)} replace />
  }

  return children
}

export function RoleRedirect() {
  const { user, role, loading, getRoleDashboardRoute } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-xs text-slate-400">
        Redirecting to portal...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Navigate to={getRoleDashboardRoute(role)} replace />
}
