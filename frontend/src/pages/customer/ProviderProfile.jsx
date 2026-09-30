import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import Rating from '../../components/Rating'
import Loading from '../../components/Loading'
import providerService from '../../services/providerService'

export default function ProviderProfile() {
  const { id } = useParams()
  const [provider, setProvider] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      providerService.getProviderById(id),
      providerService.getProviderReviews(id),
    ]).then(([p, r]) => {
      setProvider(p)
      setReviews(r)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="min-h-screen flex flex-col"><Navbar /><Loading fullPage /></div>
  if (!provider) return <div className="min-h-screen flex flex-col"><Navbar /><div className="page-container py-20 text-center text-gray-500">Provider not found.</div><Footer /></div>

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 page-container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="card p-6 mb-6">
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
                {provider.business_name?.[0]?.toUpperCase() || provider.user_name?.[0]?.toUpperCase() || 'P'}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{provider.business_name || provider.user?.full_name}</h1>
                  {provider.is_verified && (
                    <span className="badge-success">✓ Verified</span>
                  )}
                </div>
                <p className="text-gray-500 mb-3">{provider.tagline}</p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <Rating value={provider.average_rating || 0} count={provider.total_reviews || 0} />
                  {provider.experience_years && <span>🕐 {provider.experience_years} years experience</span>}
                  {provider.service_area && <span>📍 {provider.service_area}</span>}
                  {provider.hourly_rate && <span>💰 ₹{provider.hourly_rate}/hr</span>}
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                {provider.user_phone && <a href={`tel:${provider.user_phone}`} className="text-sm text-gray-700">📞 {provider.user_phone}</a>}
                <Link to={`/customer/booking/${provider.id}`} className="btn-primary flex-shrink-0">
                Book Now
              </Link>
              </div>
            </div>
          </div>

          {/* About */}
          {provider.bio && (
            <div className="card p-6 mb-6">
              <h2 className="font-semibold text-gray-900 mb-3">About</h2>
              <p className="text-gray-600 leading-relaxed">{provider.bio}</p>
            </div>
          )}

          {/* Reviews */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Reviews ({reviews.length})</h2>
            {reviews.length === 0 ? (
              <p className="text-gray-400 text-sm">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map(r => (
                  <div key={r.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm text-gray-900">{r.customer_name || 'Customer'}</span>
                      <Rating value={r.rating} showValue={false} size="sm" />
                    </div>
                    {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
