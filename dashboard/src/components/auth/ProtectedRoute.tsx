import { Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth, type AuthRole } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children?: ReactNode
  roles?: AuthRole[]
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const location = useLocation()
  const { isAuthenticated, user, authLoading } = useAuth()

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (roles && roles.length > 0) {
    if (!user?.role || !roles.includes(user.role)) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  return children ?? <Outlet />
}
