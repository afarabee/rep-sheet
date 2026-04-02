import { Outlet } from 'react-router-dom'
import SidebarNav from './SidebarNav'
import BottomNav from './BottomNav'

export default function AppShell() {
  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden bg-background">
      <div className="hidden lg:flex">
        <SidebarNav />
      </div>
      <main className="flex-1 h-full overflow-y-auto pb-14 lg:pb-0 bg-radial-purple">
        <Outlet />
      </main>
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  )
}
