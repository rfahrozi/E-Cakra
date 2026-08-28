import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/app.store'
import { authApi } from '@/features/auth/api'
import {
  LayoutDashboard, Scale, Users, ClipboardList, LogOut, FileText, UserCog
} from 'lucide-react'

const navItems = [
  { to: '/dashboard',       label: 'Dashboard',     icon: LayoutDashboard, adminOnly: false },
  { to: '/hearings',        label: 'Daftar Sidang', icon: FileText,        adminOnly: false },
  { to: '/hearings/new',    label: 'Buat Sidang',   icon: Scale,           adminOnly: false },
  { to: '/audit-logs',      label: 'Audit Log',     icon: ClipboardList,   adminOnly: false },
  { to: '/users',           label: 'Pengguna',      icon: UserCog,         adminOnly: true },
]

export default function MainLayout() {
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try { await authApi.logout() } catch {}
    clearAuth()
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-slate-900 flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-slate-700">
          <h1 className="text-white font-bold text-xl tracking-wide">E-CAKRA</h1>
          <p className="text-slate-400 text-xs mt-0.5">Portal Sidang Elektronik</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems
            .filter(item => !item.adminOnly || user?.role === 'admin')
            .map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-700 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className="px-4 py-4 border-t border-slate-700">
          <p className="text-slate-300 text-sm font-medium truncate">{user?.nama}</p>
          <p className="text-slate-500 text-xs capitalize">{user?.role}</p>
          <button
            onClick={handleLogout}
            className="mt-3 flex items-center gap-2 text-slate-400 hover:text-red-400 text-sm transition-colors"
          >
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  )
}
