import React, { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import Loading from '../../components/Loading'
import Rating from '../../components/Rating'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminProviders() {
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    api.get('/admin/providers').then(r => setProviders(r.data)).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const verify = async (id, verified) => {
    try {
      await api.put(`/admin/providers/${id}`, { is_verified: !verified })
      toast.success(verified ? 'Provider unverified' : 'Provider verified!')
      load()
    } catch { toast.error('Failed') }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 page-container py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Providers</h1>
        {loading ? <Loading /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.map(p => (
              <div key={p.id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{p.business_name || p.user_name}</h3>
                    <p className="text-sm text-gray-500">{p.service_area}</p>
                    <Rating value={p.average_rating || 0} count={p.total_reviews || 0} size="sm" />
                  </div>
                  <span className={p.is_verified ? 'badge-success' : 'badge-warning'}>
                    {p.is_verified ? '✓ Verified' : 'Pending'}
                  </span>
                </div>
                <button onClick={() => verify(p.id, p.is_verified)}
                  className={`text-sm px-4 py-1.5 rounded-lg font-medium ${p.is_verified ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {p.is_verified ? 'Revoke Verification' : 'Verify Provider'}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
