import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = () => { logout(); navigate('/'); setProfileOpen(false) }

  const getDashboardLink = () => {
    if (!user) return null
    if (user.role === 'admin') return '/admin/dashboard'
    if (user.role === 'provider') return '/provider/dashboard'
    return '/customer/dashboard'
  }

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/services', label: 'Services' },
    { to: '/how-it-works', label: 'How It Works' },
    { to: '/about', label: 'About' },
  ]

  const roleColors = { admin: 'from-red-500 to-orange-500', provider: 'from-emerald-500 to-teal-500', customer: 'from-violet-500 to-indigo-500' }

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-xl shadow-lg shadow-violet-100 border-b border-violet-50' : 'bg-white/80 backdrop-blur-md'}`}>
      <div className="page-container">
        <div className="flex items-center justify-between h-18 py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 grad-primary rounded-2xl flex items-center justify-center shadow-lg shadow-violet-300 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-extrabold grad-text">LocalPro</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  location.pathname === link.to
                    ? 'bg-violet-100 text-violet-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2.5 bg-gray-50 hover:bg-violet-50 border-2 border-gray-200 hover:border-violet-300 rounded-2xl px-3 py-2 transition-all duration-200">
                  <div className={`w-8 h-8 bg-gradient-to-br ${roleColors[user.role]} rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md`}>
                    {user.full_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900 leading-none">{user.full_name?.split(' ')[0]}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 glass-card py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-bold text-gray-900">{user.full_name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <Link to={getDashboardLink()} onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors">
                      <span>🏠</span> Dashboard
                    </Link>
                    <button onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <span>🚪</span> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-outline text-sm py-2.5 px-5">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2.5 px-5">Get Started ✨</Link>
              </>
            )}
          </div>

          {/* Mobile burger */}
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 rounded-2xl text-sm font-semibold ${location.pathname === link.to ? 'bg-violet-100 text-violet-700' : 'text-gray-700 hover:bg-gray-100'}`}>
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-gray-100">
            {user ? (
              <>
                <Link to={getDashboardLink()} onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-2xl text-sm font-semibold text-violet-700 hover:bg-violet-50">
                  🏠 Dashboard
                </Link>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-3 rounded-2xl text-sm font-semibold text-red-600 hover:bg-red-50">
                  🚪 Logout
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 btn-outline text-sm text-center">Login</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 btn-primary text-sm text-center">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
