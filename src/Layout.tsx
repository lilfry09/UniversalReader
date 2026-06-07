import { Outlet } from 'react-router-dom'
import { Sidebar } from './components/Sidebar'

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#edf1ee] text-slate-950">
      <Sidebar />
      <main className="relative flex-1 overflow-auto bg-[#f6f7f4]">
        <Outlet />
      </main>
    </div>
  )
}
