import React from 'react';
import { Menu, Sun, Moon, Bell } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLocation } from 'react-router-dom';

const PAGE_TITLES = {
  '/dashboard':    { title: 'Dashboard',    sub: 'Track your financial health' },
  '/transactions': { title: 'Transactions', sub: 'All your income & expenses' },
  '/analytics':    { title: 'Analytics',    sub: 'Insights & spending trends'  },
  '/profile':      { title: 'Profile',      sub: 'Your account settings'       },
};

export default function Header() {
  const { darkMode, toggleDark, setSidebarOpen } = useApp();
  const { pathname } = useLocation();
  const info = PAGE_TITLES[pathname] || { title: 'Finely', sub: '' };

  return (
    <header className="sticky top-0 z-20 bg-white/60 dark:bg-surface-900/50 backdrop-blur-2xl border-b border-white/40 dark:border-surface-800/40 px-4 lg:px-6 xl:px-8 py-4 flex items-center justify-between gap-4">
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="btn-ghost p-2.5 lg:hidden rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight tracking-tight">{info.title}</h1>
          <p className="text-xs text-surface-400 dark:text-surface-500 hidden sm:block mt-0.5">{info.sub}</p>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Notification bell - decorative */}
        <button
          className="btn-ghost p-2.5 rounded-xl relative"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-white dark:ring-surface-900" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleDark}
          className="relative p-2.5 rounded-xl overflow-hidden group hover:bg-surface-100 dark:hover:bg-surface-800 transition-all duration-200"
          aria-label="Toggle theme"
        >
          <div className="relative">
            {darkMode ? (
              <Sun size={18} className="text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
            ) : (
              <Moon size={18} className="text-surface-500 group-hover:-rotate-12 transition-transform duration-300" />
            )}
          </div>
        </button>
      </div>
    </header>
  );
}
