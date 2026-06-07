import { NavLink } from 'react-router-dom'
import { Library, Settings, BookOpen, PanelLeft } from 'lucide-react'
import { clsx } from 'clsx'

export function Sidebar() {
  const navItems = [
    { icon: Library, label: '书库', hint: 'Library', path: '/' },
    { icon: Settings, label: '设置', hint: 'Preferences', path: '/settings' },
  ]

  return (
    <div className="flex h-screen w-64 shrink-0 flex-col border-r border-[#cfd8d2] bg-[#20332e] text-[#f8faf7]">
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#d6a05d] text-[#1d2f2a] shadow-sm">
          <BookOpen className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-[15px] font-semibold leading-tight">UniversalReader</div>
          <div className="text-xs text-[#b5c5bd]">Local reading desk</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                'group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors',
                isActive
                  ? 'bg-[#edf1ee] text-[#1f332e] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.36)]'
                  : 'text-[#b5c5bd] hover:bg-white/10 hover:text-white'
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="min-w-0 flex-1 truncate font-medium">{item.label}</span>
            <span className="text-[10px] uppercase tracking-[0.08em] text-current opacity-55">
              {item.hint}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-xs text-[#b5c5bd]">
          <PanelLeft className="h-3.5 w-3.5" />
          <span>v0.1.0 Alpha</span>
        </div>
      </div>
    </div>
  )
}
