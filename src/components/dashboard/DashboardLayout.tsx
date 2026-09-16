import { Outlet } from 'react-router-dom'
import { createContext, useContext, useState } from 'react'
import DashboardSidebar from './DashboardSidebar'
import CommandPalette from './CommandPalette'

type Ctx = { open: boolean; setOpen: (v: boolean) => void }
const SidebarCtx = createContext<Ctx>({ open: false, setOpen: () => {} })
export const useSidebar = () => useContext(SidebarCtx)

export default function DashboardLayout() {
  const [open, setOpen] = useState(false)
  return (
    <SidebarCtx.Provider value={{ open, setOpen }}>
      <div className="app-shell flex min-h-screen">
        <DashboardSidebar />
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
        <CommandPalette />
      </div>
    </SidebarCtx.Provider>
  )
}
