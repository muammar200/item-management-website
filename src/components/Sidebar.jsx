import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Layers, Users, LogOut, X } from 'lucide-react';

export default function Sidebar({ isOpen, onClose, onLogout }) {
  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/items', label: 'Items', icon: Package },
    { path: '/categories', label: 'Categories', icon: Layers },
    // { path: '/users', label: 'Users', icon: Users },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          id="sidebar-overlay"
          className="fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed top-0 left-0 h-screen w-64 bg-indigo-950 text-white flex flex-col z-50 transition-transform duration-350 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Header Branding */}
        <div className="p-6 border-b border-indigo-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-lg text-white">
              IM
            </div>
            <span className="font-bold text-xl tracking-tight text-white">ItemManager</span>
          </div>
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="md:hidden p-1 text-indigo-300 hover:text-white rounded-md hover:bg-indigo-800 transition-colors focus:outline-none"
            aria-label="Tutup menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-indigo-200 hover:bg-indigo-900 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <IconComponent className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-indigo-300'}`} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout at bottom */}
        <div className="p-4 border-t border-indigo-900/60">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 py-3 px-4 rounded-lg font-medium text-sm text-rose-300 hover:bg-rose-950/40 hover:text-rose-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <LogOut className="w-5 h-5 shrink-0 text-rose-400" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
