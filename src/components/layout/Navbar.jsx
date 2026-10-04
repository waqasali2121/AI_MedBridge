import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Activity,
  Bell,
  Check,
  ChevronDown,
  Globe,
  LogOut,
  Menu,
  Shield,
  User,
  X
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useNotifications } from '../../contexts/NotificationContext'
import { ThemeToggle } from '../common/ThemeToggle'
import { LanguageToggle } from '../common/LanguageToggle'

export function Navbar({ onMobileMenuToggle }) {
  const { user, role, logout } = useAuth()
  const { t, language } = useLanguage()
  const { notifications, unreadCount, markAsRead } = useNotifications()
  const navigate = useNavigate()

  const [notifOpen, setNotifOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-30 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile hamburger & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={onMobileMenuToggle}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight leading-tight flex items-center gap-1.5">
                  {t('brand.name')}
                  <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 rounded">
                    MVP
                  </span>
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block font-medium">
                  {t('brand.tagline')}
                </span>
              </div>
            </Link>
          </div>

          {/* Right: Theme toggle, Language toggle, Notifications, User Profile */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LanguageToggle />

            {/* Notification Bell */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="View notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notifOpen && (
                  <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                        Notifications ({notifications.length})
                      </span>
                      {unreadCount > 0 && (
                        <span className="text-[11px] text-emerald-600 font-semibold">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-400">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              markAsRead(n.id)
                              if (n.link_url) {
                                navigate(n.link_url)
                                setNotifOpen(false)
                              }
                            }}
                            className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                              !n.read ? 'bg-emerald-50/50' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-semibold text-slate-900">{n.title}</p>
                              {!n.read && (
                                <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-left rtl:text-right"
                >
                  <img
                    src={user.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={user.full_name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                  <div className="hidden sm:block text-xs leading-tight">
                    <p className="font-bold text-slate-800 truncate max-w-[120px]">{user.full_name}</p>
                    <p className="text-slate-500 text-[10px] capitalize">{role?.replace('_', ' ')}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3.5 py-2 border-b border-slate-100 sm:hidden">
                      <p className="font-bold text-xs text-slate-900">{user.full_name}</p>
                      <p className="text-[11px] text-slate-500 capitalize">{role?.replace('_', ' ')}</p>
                    </div>
                    <Link
                      to={role === 'patient' ? '/patient/profile' : `/${role}/dashboard`}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t('nav.profile')}</span>
                    </Link>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false)
                        handleLogout()
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left rtl:text-right cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t('nav.logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
