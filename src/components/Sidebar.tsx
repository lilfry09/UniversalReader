import { NavLink } from 'react-router-dom'
import { Library, Settings, BookOpen } from 'lucide-react'
import { clsx } from 'clsx'

export function Sidebar() {
  const navItems = [
    { icon: Library, label: 'Library', path: '/' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ]

  return (
    <div className="w-64 h-screen bg-gray-900 text-white flex flex-col border-r border-gray-800">
      <div className="p-4 border-b border-gray-800 flex items-center gap-2">
        <BookOpen className="w-6 h-6 text-blue-400" />
        <span className="font-bold text-lg">UniReader</span>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="text-xs text-gray-500">v0.1.0 Alpha</div>
      </div>
    </div>
  )
}
