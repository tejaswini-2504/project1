import React, { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import Loading from '../../components/Loading'
import api from '../../services/api'

export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/analytics').then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 page-container py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>
        {loading ? <Loading /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Booking Statistics</h2>
              <dl className="space-y-2">
                {data && Object.entries(data.booking_stats || {}).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <dt className="text-gray-500 capitalize">{k.replace(/_/g, ' ')}</dt>
                    <dd className="font-medium text-gray-900">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Top Services</h2>
              <ul className="space-y-2">
                {data?.top_services?.map((s, i) => (
                  <li key={i} className="flex justify-between text-sm">
                    <span className="text-gray-700">{s.name}</span>
                    <span className="font-medium text-primary-600">{s.count} bookings</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
