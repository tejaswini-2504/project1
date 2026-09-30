import React, { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import BookingCard from '../../components/BookingCard'
import Loading from '../../components/Loading'
import bookingService from '../../services/bookingService'

const TABS = ['All', 'Active', 'Completed', 'Cancelled']

export default function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('All')

  useEffect(() => {
    bookingService.getMyBookings()
      .then(data => setBookings(Array.isArray(data) ? data : data.bookings || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = bookings.filter(b => {
    if (tab === 'All') return true
    if (tab === 'Active') return !['COMPLETED', 'CANCELLED'].includes(b.status)
    if (tab === 'Completed') return b.status === 'COMPLETED'
    if (tab === 'Cancelled') return b.status === 'CANCELLED'
    return true
  })

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 page-container py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h1>
        <div className="flex gap-2 mb-6">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              {t}
            </button>
          ))}
        </div>
        {loading ? <Loading /> : filtered.length === 0 ? (
          <div className="card p-12 text-center text-gray-400">
            <div className="text-5xl mb-4">📋</div>
            <p className="font-medium">No bookings found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(b => <BookingCard key={b.id} booking={b} role="customer" />)}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
