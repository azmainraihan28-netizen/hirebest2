import { Outlet } from 'react-router-dom'
import DashboardSidebar from './DashboardSidebar'

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <DashboardSidebar />
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  )
}
