import React, { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import Loading from '../../components/Loading'
import api from '../../services/api'

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/bookings').then(r => setBookings(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 page-container py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">All Bookings</h1>
        {loading ? <Loading /> : (
          <div className="card overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['ID', 'Customer', 'Provider', 'Service', 'Date', 'Status', 'Amount'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">#{b.id}</td>
                    <td className="px-4 py-3 font-medium">{b.customer_name}</td>
                    <td className="px-4 py-3">{b.provider_name}</td>
                    <td className="px-4 py-3">{b.service_name}</td>
                    <td className="px-4 py-3">{b.scheduled_date ? new Date(b.scheduled_date).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3"><span className="badge-gray text-xs">{b.status}</span></td>
                    <td className="px-4 py-3">₹{b.total_amount || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
