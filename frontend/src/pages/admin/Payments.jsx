import React, { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import Loading from '../../components/Loading'
import api from '../../services/api'

export default function AdminPayments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/payments').then(r => setPayments(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 page-container py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Payments</h1>
        {loading ? <Loading /> : (
          <div className="card overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['ID', 'Booking', 'Amount', 'Method', 'Status', 'Date'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">#{p.id}</td>
                    <td className="px-4 py-3">#{p.booking_id}</td>
                    <td className="px-4 py-3 font-medium text-green-600">₹{p.amount}</td>
                    <td className="px-4 py-3">{p.payment_method}</td>
                    <td className="px-4 py-3"><span className={p.status === 'SUCCESS' ? 'badge-success' : 'badge-warning'}>{p.status}</span></td>
                    <td className="px-4 py-3">{p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</td>
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
