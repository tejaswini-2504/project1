import React, { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import Loading from '../../components/Loading'
import api from '../../services/api'

export default function Earnings() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/providers/my/earnings').then(r => setData(r.data)).catch(() => setData({ total: 0, this_month: 0, bookings: [] })).finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 page-container py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Earnings</h1>
        {loading ? <Loading /> : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="card p-6 text-center bg-green-50">
                <p className="text-sm text-gray-500 mb-1">Total Earnings</p>
                <p className="text-3xl font-bold text-green-600">₹{data?.total || 0}</p>
              </div>
              <div className="card p-6 text-center bg-blue-50">
                <p className="text-sm text-gray-500 mb-1">This Month</p>
                <p className="text-3xl font-bold text-blue-600">₹{data?.this_month || 0}</p>
              </div>
            </div>
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Payment History</h2>
              {(!data?.bookings || data.bookings.length === 0) ? (
                <p className="text-gray-400 text-sm text-center py-6">No payments yet.</p>
              ) : (
                <div className="space-y-3">
                  {data.bookings.map((b, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="font-medium text-sm text-gray-900">{b.service_name}</p>
                        <p className="text-xs text-gray-500">{b.date}</p>
                      </div>
                      <span className="font-semibold text-green-600">₹{b.amount}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
