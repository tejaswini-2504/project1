import React, { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import Loading from '../../components/Loading'
import bookingService from '../../services/bookingService'
import toast from 'react-hot-toast'

const STATUS_FLOW = {
  REQUESTED: ['ACCEPTED', 'CANCELLED'],
  ACCEPTED: ['ON_THE_WAY', 'CANCELLED'],
  ON_THE_WAY: ['ARRIVED'],
  ARRIVED: ['IN_PROGRESS'],
  IN_PROGRESS: ['COMPLETED'],
}

const STATUS_LABELS = {
  REQUESTED: 'Requested',
  ACCEPTED: 'Accepted',
  ON_THE_WAY: 'On the Way',
  ARRIVED: 'Arrived',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

const STATUS_BADGE = {
  REQUESTED: 'badge-warning',
  ACCEPTED: 'badge-info',
  ON_THE_WAY: 'badge-info',
  ARRIVED: 'badge-info',
  IN_PROGRESS: 'badge-info',
  COMPLETED: 'badge-success',
  CANCELLED: 'badge-error',
}

export default function Jobs() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  const loadBookings = () => {
    bookingService.getMyBookings()
      .then(data => setBookings(Array.isArray(data) ? data : data.bookings || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadBookings() }, [])

  const updateStatus = async (id, status) => {
    setUpdating(id)
    try {
      await bookingService.updateBookingStatus(id, status)
      toast.success(`Status updated to ${STATUS_LABELS[status]}`)
      loadBookings()
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 page-container py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Jobs</h1>
        {loading ? <Loading /> : bookings.length === 0 ? (
          <div className="card p-12 text-center text-gray-400">
            <div className="text-5xl mb-4">📭</div>
            <p>No bookings yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(b => (
              <div key={b.id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{b.service_name || 'Service'}</h3>
                    <p className="text-sm text-gray-500">Customer: {b.customer_name}</p>
                    <p className="text-sm text-gray-500">
                      {b.scheduled_date && new Date(b.scheduled_date).toLocaleDateString()} at {b.scheduled_time}
                    </p>
                    {b.address && <p className="text-sm text-gray-500">📍 {b.address}</p>}
                  </div>
                  <span className={STATUS_BADGE[b.status] || 'badge-gray'}>{STATUS_LABELS[b.status]}</span>
                </div>
                {STATUS_FLOW[b.status] && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    {STATUS_FLOW[b.status].map(nextStatus => (
                      <button
                        key={nextStatus}
                        onClick={() => updateStatus(b.id, nextStatus)}
                        disabled={updating === b.id}
                        className={nextStatus === 'CANCELLED' ? 'btn-danger text-sm py-1.5 px-3' : 'btn-primary text-sm py-1.5 px-3'}
                      >
                        {updating === b.id ? '...' : STATUS_LABELS[nextStatus]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
