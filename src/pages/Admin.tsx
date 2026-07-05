import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Shield, ArrowLeft } from 'lucide-react'
import AdminTabs, { type AdminTab } from '../components/admin/AdminTabs'
import SubscriptionsPanel from '../components/admin/SubscriptionsPanel'
import AccessCodesPanel from '../components/admin/AccessCodesPanel'
import AdminsPanel from '../components/admin/AdminsPanel'
import StatsPanel from '../components/admin/StatsPanel'
import AuditPanel from '../components/admin/AuditPanel'
import OrganizationsPanel from '../components/admin/OrganizationsPanel'
import OrgMembersPanel from '../components/admin/OrgMembersPanel'
import { useAuth } from '../lib/auth'
import { isSuperAdmin } from '../lib/admin'
import { getMyOrgs } from '../lib/orgs'

export default function Admin() {
  const { profile } = useAuth()
  const superAdmin = isSuperAdmin(profile)
  const [orgAdmin, setOrgAdmin] = useState(false)

  useEffect(() => {
    if (superAdmin) return
    getMyOrgs().then(list => setOrgAdmin(list.some(o => o.role_in_org === 'org_admin')))
  }, [superAdmin])

  const allowed = useMemo<AdminTab[]>(() => {
    if (superAdmin) return ['subscriptions', 'orgs', 'access-codes', 'admins', 'stats', 'audit']
    if (orgAdmin) return ['my-org']
    return []
  }, [superAdmin, orgAdmin])

  const [tab, setTab] = useState<AdminTab>('subscriptions')
  useEffect(() => {
    if (allowed.length > 0 && !allowed.includes(tab)) setTab(allowed[0])
  }, [allowed, tab])

  return (
    <section className="max-w-6xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Shield className="text-[var(--color-primary-2)]"/>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Admin Panel</h1>
        </div>
        <Link to="/dashboard" className="text-sm text-[var(--color-muted)] hover:text-[var(--color-fg)] flex items-center gap-1.5">
          <ArrowLeft size={14}/>Dashboard
        </Link>
      </div>

      {allowed.length > 0 && (
        <div className="flex justify-center mb-8">
          <AdminTabs value={tab} onChange={setTab} allowed={allowed}/>
        </div>
      )}

      {tab === 'subscriptions' && <SubscriptionsPanel/>}
      {tab === 'orgs' && <OrganizationsPanel/>}
      {tab === 'access-codes' && <AccessCodesPanel/>}
      {tab === 'admins' && <AdminsPanel/>}
      {tab === 'stats' && <StatsPanel/>}
      {tab === 'audit' && <AuditPanel/>}
      {tab === 'my-org' && <OrgMembersPanel/>}
    </section>
  )
}
