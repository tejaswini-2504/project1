import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import Loading from '../../components/Loading'
import api from '../../services/api'

const MENU = [
  { to: '/admin/users',      label: 'Manage Users',    icon: '👥', grad: 'from-violet-500 to-indigo-600', desc: 'View all users' },
  { to: '/admin/providers',  label: 'Providers',       icon: '🔧', grad: 'from-emerald-500 to-teal-500',  desc: 'Verify providers' },
  { to: '/admin/bookings',   label: 'All Bookings',    icon: '📋', grad: 'from-blue-500 to-cyan-600',     desc: 'View bookings' },
  { to: '/admin/payments',   label: 'Payments',        icon: '💳', grad: 'from-amber-500 to-orange-500',  desc: 'Transactions' },
  { to: '/admin/complaints', label: 'Complaints',      icon: '⚠️', grad: 'from-red-500 to-rose-500',     desc: 'Handle tickets' },
  { to: '/admin/analytics',  label: 'Analytics',       icon: '📊', grad: 'from-pink-500 to-fuchsia-600',  desc: 'Reports' },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setStats(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="bg-gradient-to-br from-red-600 via-orange-600 to-amber-600 py-10">
        <div className="page-container">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center text-3xl">🛡️</div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Admin Dashboard</h1>
              <p className="text-orange-200">Platform management & analytics</p>
            </div>
          </div>
          {loading ? null : stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Users',   value: stats.total_users,     icon: '👥', color: 'text-yellow-300' },
                { label: 'Providers',     value: stats.total_providers, icon: '🔧', color: 'text-cyan-300' },
                { label: 'Bookings',      value: stats.total_bookings,  icon: '📋', color: 'text-white' },
                { label: 'Revenue',       value: `₹${stats.total_revenue || 0}`, icon: '💰', color: 'text-emerald-300' },
              ].map(s => (
                <div key={s.label} className="bg-white/15 backdrop-blur rounded-2xl p-4 text-center border border-white/20">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
                  <div className="text-orange-200 text-sm">{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <main className="flex-1 page-container py-8 -mt-4 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MENU.map(m => (
            <Link key={m.to} to={m.to}
              className={`card-hover p-6 bg-gradient-to-br ${m.grad} flex items-center gap-4`}>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                {m.icon}
              </div>
              <div>
                <p className="font-extrabold text-white text-lg">{m.label}</p>
                <p className="text-white/70 text-sm">{m.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
