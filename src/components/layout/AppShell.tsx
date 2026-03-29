import { Outlet } from 'react-router-dom'
import SidebarNav from './SidebarNav'

export default function AppShell() {
  return (
    <div className="h-screen flex flex-row overflow-hidden bg-background">
      <SidebarNav />
      <main className="flex-1 h-full overflow-y-auto bg-radial-purple">
        <Outlet />
      </main>
    </div>
  )
}
