import { Navigate, useLocation } from 'react-router-dom'
import { ReactNode } from 'react'
import { useAuth } from '../lib/auth'

export default function ProtectedRoute({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
  const { user, profile, loading } = useAuth()
  const loc = useLocation()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-[var(--color-muted)]">Loading…</div>
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  }
  if (adminOnly && profile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }
  return <>{children}</>
}
