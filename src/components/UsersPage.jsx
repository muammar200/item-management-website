import React, { useState, useEffect } from 'react';
import { Shield, Mail, Calendar, UserCheck } from 'lucide-react';
import { api } from '../api';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const data = await api.getUsers();
        setUsers(data);
      } catch (err) {
        console.error('Failed to load users', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsers();
  }, []);

  return (
    <div id="users-page-container" className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-indigo-950">Users Management</h2>
        <p className="text-sm text-gray-500">Daftar administrator yang memiliki akses ke sistem inventaris.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm space-y-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((u) => (
            <div
              key={u.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 font-bold text-lg flex items-center justify-center shrink-0">
                  {u.username.substring(0, 2).toUpperCase()}
                </div>

                <div className="space-y-1 overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-gray-900 truncate">{u.username}</span>
                    <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[10px] font-bold shrink-0 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Admin
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="truncate">{u.email}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-500" /> Active Session
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Created June 2026
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
