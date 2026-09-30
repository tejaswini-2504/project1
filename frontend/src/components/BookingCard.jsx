import React from 'react'
import { Link } from 'react-router-dom'

const STATUS_STYLES = {
  REQUESTED:   { badge: 'bg-amber-100 text-amber-700',   icon: '⏳', label: 'Requested' },
  ACCEPTED:    { badge: 'bg-blue-100 text-blue-700',     icon: '✅', label: 'Accepted' },
  ON_THE_WAY:  { badge: 'bg-cyan-100 text-cyan-700',     icon: '🚗', label: 'On the Way' },
  ARRIVED:     { badge: 'bg-indigo-100 text-indigo-700', icon: '📍', label: 'Arrived' },
  IN_PROGRESS: { badge: 'bg-violet-100 text-violet-700', icon: '🔧', label: 'In Progress' },
  COMPLETED:   { badge: 'bg-emerald-100 text-emerald-700', icon: '🎉', label: 'Completed' },
  CANCELLED:   { badge: 'bg-red-100 text-red-700',       icon: '❌', label: 'Cancelled' },
}

export default function BookingCard({ booking, role = 'customer' }) {
  if (!booking) return null
  const s = STATUS_STYLES[booking.status] || { badge: 'bg-gray-100 text-gray-600', icon: '•', label: booking.status }
  return (
    <div className="card-hover p-5 group">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-gray-900">{booking.service_name || 'Service Booking'}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{role === 'customer' ? booking.provider_name : booking.customer_name}</p>
        </div>
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${s.badge}`}>
          {s.icon} {s.label}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs mb-4">
        {booking.scheduled_date && (
          <span className="bg-gray-50 border border-gray-100 text-gray-600 px-2.5 py-1 rounded-xl font-medium">
            📅 {new Date(booking.scheduled_date).toLocaleDateString()}
          </span>
        )}
        {booking.scheduled_time && (
          <span className="bg-gray-50 border border-gray-100 text-gray-600 px-2.5 py-1 rounded-xl font-medium">
            🕐 {booking.scheduled_time}
          </span>
        )}
        {booking.total_amount && (
          <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-2.5 py-1 rounded-xl font-bold">
            ₹{booking.total_amount}
          </span>
        )}
        {booking.is_paid ? (
          <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-xl font-semibold flex items-center gap-1">
            💳 Paid
          </span>
        ) : booking.status !== 'CANCELLED' ? (
          <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-xl font-semibold flex items-center gap-1">
            ⏳ Unpaid
          </span>
        ) : null}
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <Link to={`/${role}/bookings/${booking.id}`}
          className="text-sm font-bold text-violet-600 hover:text-violet-800 flex items-center gap-1 group-hover:gap-2 transition-all">
          View Details <span>→</span>
        </Link>
        {role === 'customer' && !booking.is_paid && booking.status !== 'CANCELLED' && (
          <Link
            to={`/customer/payments?booking_id=${booking.id}`}
            className="text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1">
            💳 Pay Now
          </Link>
        )}
      </div>
    </div>
  )
}

