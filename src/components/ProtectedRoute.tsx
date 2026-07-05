import { Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState, ReactNode } from 'react'
import { useAuth } from '../lib/auth'
import { isSuperAdmin } from '../lib/admin'
import { getMyOrgs } from '../lib/orgs'

type Props = {
  children: ReactNode
  /** super_admin only */
  adminOnly?: boolean
  /** super_admin OR any org_admin */
  adminOrOrgAdmin?: boolean
}

export default function ProtectedRoute({ children, adminOnly = false, adminOrOrgAdmin = false }: Props) {
  const { user, profile, loading } = useAuth()
  const loc = useLocation()

  const [orgCheckLoading, setOrgCheckLoading] = useState(adminOrOrgAdmin)
  const [isAnyOrgAdmin, setIsAnyOrgAdmin] = useState(false)

  useEffect(() => {
    if (!adminOrOrgAdmin || !user) { setOrgCheckLoading(false); return }
    if (isSuperAdmin(profile)) { setIsAnyOrgAdmin(true); setOrgCheckLoading(false); return }
    setOrgCheckLoading(true)
    getMyOrgs().then(list => {
      setIsAnyOrgAdmin(list.some(o => o.role_in_org === 'org_admin'))
      setOrgCheckLoading(false)
    })
  }, [user?.id, profile?.role, adminOrOrgAdmin])

  if (loading || orgCheckLoading) {
    return <div className="min-h-screen flex items-center justify-center text-[var(--color-muted)]">Loading…</div>
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  }
  if (adminOnly && !isSuperAdmin(profile)) {
    return <Navigate to="/dashboard" replace />
  }
  if (adminOrOrgAdmin && !isSuperAdmin(profile) && !isAnyOrgAdmin) {
    return <Navigate to="/dashboard" replace />
  }
  return <>{children}</>
}
