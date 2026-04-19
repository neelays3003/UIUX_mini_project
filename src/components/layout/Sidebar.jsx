import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, BarChart2, User, X, LogOut, Wallet, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const NAV = [
  { to: '/dashboard',    label: 'Dashboard',    Icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', Icon: ArrowLeftRight  },
  { to: '/analytics',    label: 'Analytics',    Icon: BarChart2       },
  { to: '/profile',      label: 'Profile',      Icon: User            },
];

export default function Sidebar() {
  const { user, logout, sidebarOpen, setSidebarOpen } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-[272px] z-40
        bg-white/70 dark:bg-surface-900/80
        backdrop-blur-2xl
        border-r border-white/50 dark:border-surface-800/60
        flex flex-col transition-all duration-300 ease-out
        lg:translate-x-0 lg:static lg:z-auto
        ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/30 group-hover:shadow-brand-500/50 transition-shadow">
              <Wallet size={18} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">Finely</span>
              <span className="flex items-center gap-1 text-[10px] text-brand-500 font-medium">
                <Sparkles size={10} /> Smart Tracker
              </span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden btn-ghost p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Divider */}
        <div className="mx-5 h-px bg-gradient-to-r from-transparent via-surface-200 dark:via-surface-700 to-transparent" />

        {/* Navigation */}
        <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest text-surface-400 dark:text-surface-500 px-3 mb-3">
            Menu
          </p>
          {NAV.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `nav-item group relative ${isActive ? 'nav-item-active' : 'nav-item-idle'}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-500 rounded-r-full" />
                  )}
                  <Icon size={18} className={isActive ? 'text-brand-600 dark:text-brand-400' : 'group-hover:scale-110 transition-transform'} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 mx-3 mb-3 rounded-2xl bg-surface-50/80 dark:bg-surface-800/50 backdrop-blur-xl border border-surface-100 dark:border-surface-700/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-brand-500/20 flex-shrink-0">
              {user?.avatar || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-surface-400 dark:text-surface-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
          >
            <LogOut size={14} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
