import React, { useState } from 'react';
import { LogIn, UserPlus, Mail, Lock, User, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function AuthPage({ isLogin, onAuthSuccess, showToast }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  // Show / Hide password state
  const [showPassword, setShowPassword] = useState(false);

  // Validation / Loading states
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const newErrors = {};
    const identifier = email.trim();
    if (isLogin) {
      if (!identifier) {
        newErrors.email = 'Email wajib diisi.';
      } else if (!/\S+@\S+\.\S+/.test(identifier)) {
        newErrors.email = 'Format email tidak valid.';
      }
    } else {
      if (!identifier) {
        newErrors.name = 'Nama wajib diisi.';
      } else if (identifier.length < 3) {
        newErrors.name = 'Nama minimal 3 karakter.';
      }
    }

    if (!isLogin) {
      if (!email.trim()) {
        newErrors.email = 'Email wajib diisi.';
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        newErrors.email = 'Format email tidak valid.';
      }
    }

    if (!password) {
      newErrors.password = 'Password wajib diisi.';
    } else if (password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter.';
    }

    if (!isLogin) {
      if (!passwordConfirmation) {
        newErrors.passwordConfirmation = 'Konfirmasi password wajib diisi.';
      } else if (passwordConfirmation !== password) {
        newErrors.passwordConfirmation = 'Konfirmasi password tidak cocok.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) return;

    setIsLoading(true);
    try {
      if (isLogin) {
        const response = await api.login(email.trim(), password);
        showToast('Login berhasil! Selamat datang kembali.', 'success');
        localStorage.setItem('item_mgmt_token', response.data.token);
        onAuthSuccess(response.data.user);
      } else {
        const response = await api.register(name.trim(), email.trim(), password, passwordConfirmation);
        showToast('Registrasi berhasil! Akun Anda telah dibuat.', 'success');
        onAuthSuccess(response.data.user);
      }
    } catch (err) {
      const errMsg = err.message || 'Terjadi kesalahan sistem.';
      setApiError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-700 to-indigo-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Branding Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-12 h-12 rounded-xl bg-white text-indigo-700 font-black text-2xl flex items-center justify-center shadow-lg">
          IM
        </div>
        <h2 className="mt-4 text-3xl font-extrabold text-white tracking-tight">
          ItemManager App
        </h2>
        <p className="mt-1 text-sm text-indigo-200">
          Sistem Manajemen Inventaris & Kategori Modern
        </p>
      </div>

      {/* Main Card Form */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-indigo-100">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-indigo-900">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {isLogin
                ? 'Silakan masuk menggunakan kredensial admin Anda.'
                : 'Daftarkan admin baru untuk mengakses dashboard.'}
            </p>
          </div>

          {/* Top Level API Error Message */}
          {apiError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-sm mb-5 font-medium">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Identifier (Email in login, Name in register) */}
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">{isLogin ? 'Email' : 'Name'}</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                  {isLogin ? <Mail className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </span>
                <input
                  type={isLogin ? 'email' : 'text'}
                  placeholder={isLogin ? 'nama@email.com' : 'Masukkan nama lengkap'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-800 transition-all ${errors.name ? 'border-rose-500 focus:ring-rose-500' : 'border-gray-300'
                    }`}
                />
              </div>
              {errors.name && (
                <p className="text-rose-500 text-xs font-semibold mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email (only on Register) */}
            {!isLogin && (
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                    <Mail className="w-5 h-5" />
                  </span>
                  <input
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-800 transition-all ${errors.email ? 'border-rose-500 focus:ring-rose-500' : 'border-gray-300'
                      }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-rose-500 text-xs font-semibold mt-1">{errors.email}</p>
                )}
              </div>
            )}

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-gray-700">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-11 pr-11 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-800 transition-all ${errors.password ? 'border-rose-500 focus:ring-rose-500' : 'border-gray-300'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-indigo-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-rose-500 text-xs font-semibold mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password (only on Register) */}
            {!isLogin && (
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700">Confirm Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                    <Lock className="w-5 h-5" />
                  </span>
                  <input
                    type="password"
                    placeholder="Konfirmasi password"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-800 transition-all ${errors.passwordConfirmation ? 'border-rose-500 focus:ring-rose-500' : 'border-gray-300'
                      }`}
                  />
                </div>
                {errors.passwordConfirmation && (
                  <p className="text-rose-500 text-xs font-semibold mt-1">{errors.passwordConfirmation}</p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold rounded-lg py-3.5 px-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-lg hover:shadow-indigo-500/20 cursor-pointer"
            >
              {isLoading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : isLogin ? (
                <LogIn className="w-5 h-5" />
              ) : (
                <UserPlus className="w-5 h-5" />
              )}
              <span>{isLogin ? 'Sign In' : 'Sign Up'}</span>
            </button>
          </form>

          {/* Toggle Login/Register Mode link */}
          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <Link
              to={isLogin ? '/register' : '/login'}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 focus:outline-none cursor-pointer hover:underline"
            >
              {isLogin
                ? 'Belum punya akun? Registrasi di sini'
                : 'Sudah punya akun? Login di sini'}
            </Link>
          </div>

          {/* Help tip for Quick login */}
          {isLogin && (
            <div className="mt-4 p-2.5 bg-indigo-50/50 rounded-lg text-[11px] text-indigo-700 text-center">
              Quick demo login: <strong className="font-bold">admin</strong> / password: <strong className="font-bold">admin123</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
