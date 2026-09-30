import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import BookingCard from '../../components/BookingCard'
import Loading from '../../components/Loading'
import { useAuth } from '../../context/AuthContext'
import bookingService from '../../services/bookingService'

const MENU = [
  { to: '/provider/jobs',     label: 'Manage Jobs',   icon: '📋', grad: 'from-violet-500 to-indigo-600' },
  { to: '/provider/calendar', label: 'Calendar',      icon: '📅', grad: 'from-emerald-500 to-teal-500' },
  { to: '/provider/earnings', label: 'Earnings',      icon: '💰', grad: 'from-amber-500 to-orange-500' },
  { to: '/provider/profile',  label: 'My Profile',    icon: '👤', grad: 'from-pink-500 to-rose-500' },
]

export default function ProviderDashboard() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    bookingService.getMyBookings({ limit: 6 })
      .then(d => setBookings(Array.isArray(d) ? d : d.bookings || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const pending   = bookings.filter(b => b.status === 'REQUESTED').length
  const active    = bookings.filter(b => ['ACCEPTED','ON_THE_WAY','ARRIVED','IN_PROGRESS'].includes(b.status)).length
  const completed = bookings.filter(b => b.status === 'COMPLETED').length

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 py-10">
        <div className="page-container">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center text-3xl font-black text-white">
              {user?.full_name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Provider Dashboard 🔧</h1>
              <p className="text-teal-200">{user?.full_name}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Pending', value: pending,   icon: '⏳', color: 'text-amber-300' },
              { label: 'Active',  value: active,    icon: '⚡', color: 'text-cyan-300' },
              { label: 'Done',    value: completed, icon: '✅', color: 'text-emerald-300' },
            ].map(s => (
              <div key={s.label} className="bg-white/15 backdrop-blur rounded-2xl p-4 text-center border border-white/20">
                <div className="text-xl mb-1">{s.icon}</div>
                <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-teal-200 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-1 page-container py-8 -mt-4 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {MENU.map(m => (
            <Link key={m.to} to={m.to}
              className={`card-hover p-5 bg-gradient-to-br ${m.grad} flex flex-col gap-2`}>
              <div className="text-3xl">{m.icon}</div>
              <p className="font-bold text-white">{m.label}</p>
            </Link>
          ))}
        </div>
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-extrabold text-gray-900">Recent Bookings</h2>
            <Link to="/provider/jobs" className="text-sm font-bold text-emerald-600 hover:text-emerald-800">View all →</Link>
          </div>
          {loading ? <Loading /> : bookings.length === 0 ? (
            <div className="card p-14 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="font-bold text-gray-700 mb-2">No bookings yet</h3>
              <p className="text-gray-400 text-sm">Complete your profile to attract more customers.</p>
              <Link to="/provider/profile" className="btn-primary mt-4">Complete Profile</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookings.map(b => <BookingCard key={b.id} booking={b} role="provider" />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
