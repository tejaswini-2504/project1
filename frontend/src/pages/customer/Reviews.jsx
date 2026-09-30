import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function Reviews() {
  const [searchParams] = useSearchParams()
  const bookingId = searchParams.get('booking_id')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!bookingId) { toast.error('No booking selected'); return }
    setSubmitting(true)
    try {
      await api.post('/reviews', { booking_id: parseInt(bookingId), rating, comment })
      setSubmitted(true)
      toast.success('Review submitted!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 page-container py-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Leave a Review</h1>
          {submitted ? (
            <div className="card p-10 text-center">
              <div className="text-5xl mb-4">⭐</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h2>
              <p className="text-gray-500 mb-6">Your review helps other customers find great providers.</p>
              <button onClick={() => navigate('/customer/bookings')} className="btn-primary w-full">Back to Bookings</button>
            </div>
          ) : (
            <div className="card p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="label">Rating</label>
                  <div className="flex gap-2 mt-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} type="button" onClick={() => setRating(n)}
                        className={`text-3xl transition-transform hover:scale-110 ${n <= rating ? 'text-yellow-400' : 'text-gray-200'}`}>
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">Your Review</label>
                  <textarea className="input-field resize-none" rows={4}
                    placeholder="Share your experience..."
                    value={comment} onChange={e => setComment(e.target.value)} />
                </div>
                <button type="submit" className="btn-primary w-full" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
