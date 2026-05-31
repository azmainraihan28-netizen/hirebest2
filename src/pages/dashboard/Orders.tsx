import { Link } from 'react-router-dom'
import { Package, MessageCircle } from 'lucide-react'
import DashboardTopBar from '../../components/dashboard/DashboardTopBar'

export default function Orders() {
  return (
    <>
      <DashboardTopBar title="Orders"/>
      <div className="p-6 max-w-3xl mx-auto">
        <div className="card p-10 text-center">
          <Package size={32} className="mx-auto text-[var(--color-primary-2)]"/>
          <h2 className="mt-4 text-2xl font-bold">You're on the Free plan</h2>
          <p className="mt-2 text-sm text-[var(--color-muted)]">50 free screenings included. Upgrade to unlock unlimited usage, multi-user, and custom integrations.</p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Link to="/pricing" className="btn-primary">See plans</Link>
            <a href="https://wa.me/8801324419060" target="_blank" rel="noreferrer" className="btn-ghost"><MessageCircle size={14}/>Talk to us</a>
          </div>
        </div>
      </div>
    </>
  )
}
