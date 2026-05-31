import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Shield, ArrowLeft } from 'lucide-react'
import AdminTabs, { type AdminTab } from '../components/admin/AdminTabs'
import SubscriptionsPanel from '../components/admin/SubscriptionsPanel'
import AccessCodesPanel from '../components/admin/AccessCodesPanel'
import AdminsPanel from '../components/admin/AdminsPanel'
import StatsPanel from '../components/admin/StatsPanel'
import AuditPanel from '../components/admin/AuditPanel'

export default function Admin() {
  const [tab, setTab] = useState<AdminTab>('subscriptions')

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

      <div className="flex justify-center mb-8">
        <AdminTabs value={tab} onChange={setTab}/>
      </div>

      {tab === 'subscriptions' && <SubscriptionsPanel/>}
      {tab === 'access-codes' && <AccessCodesPanel/>}
      {tab === 'admins' && <AdminsPanel/>}
      {tab === 'stats' && <StatsPanel/>}
      {tab === 'audit' && <AuditPanel/>}
    </section>
  )
}
