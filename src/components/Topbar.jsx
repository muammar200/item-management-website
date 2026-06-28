import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, User, LogOut, ShieldAlert } from 'lucide-react';

export default function Topbar({ onToggleSidebar, pageTitle, user, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      id="app-topbar"
      className="sticky top-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-30 shadow-sm"
    >
      {/* Left section: Hamburger + Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Buka menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-lg md:text-xl font-semibold text-indigo-900 capitalize">
          {pageTitle}
        </h1>
      </div>

      {/* Right section: Notifications + User Avatar Dropdown */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 relative"
            aria-label="Notifikasi"
          >
            <Bell className="w-5.5 h-5.5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
          </button>

          {/* Notification Menu */}
          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-40 animate-fade-in text-sm text-gray-700">
              <div className="px-4 py-2 font-semibold border-b border-gray-100 text-indigo-950 flex justify-between items-center">
                <span>Notifikasi</span>
                <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">Baru</span>
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-gray-50">
                <div className="px-4 py-3 hover:bg-gray-50 transition-colors">
                  <p className="font-medium text-gray-900">Stok Item Menipis</p>
                  <p className="text-xs text-gray-500 mt-0.5">Quantity "Ergonomic Desk Chair" tersisa 8.</p>
                </div>
                <div className="px-4 py-3 hover:bg-gray-50 transition-colors">
                  <p className="font-medium text-gray-900">Sistem Berjalan Baik</p>
                  <p className="text-xs text-gray-500 mt-0.5">Server mock API lokal aktif otomatis.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Dropdown Divider */}
        <div className="h-6 w-[1px] bg-gray-200" />

        {/* User Info / Profile */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1 rounded-full md:rounded-lg md:px-3 md:py-1.5 hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {/* User Avatar Initials */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white font-semibold text-sm flex items-center justify-center">
              {user?.username?.substring(0, 2).toUpperCase() || 'US'}
            </div>
            <span className="hidden md:inline font-medium text-sm text-gray-700">
              {user?.username || 'User'}
            </span>
          </button>

          {/* User Dropdown Panel */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-40 animate-fade-in">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="font-semibold text-sm text-gray-900">{user?.username || 'User'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
              </div>
              <div className="py-1">
                <div className="px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 transition-colors cursor-pointer flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>Profil Saya</span>
                </div>
              </div>
              <div className="border-t border-gray-100 py-1">
                <button
                  onClick={onLogout}
                  className="w-full text-left px-4 py-2 hover:bg-rose-50 text-sm text-rose-600 transition-colors cursor-pointer flex items-center gap-2 focus:outline-none"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
