import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import Loading from '../../components/Loading'
import providerService from '../../services/providerService'
import bookingService from '../../services/bookingService'
import toast from 'react-hot-toast'

export default function Booking() {
  const { providerId } = useParams()
  const navigate = useNavigate()
  const [provider, setProvider] = useState(null)
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    service_id: '',
    scheduled_date: '',
    scheduled_time: '',
    address: '',
    notes: '',
  })

  useEffect(() => {
    Promise.all([
      providerService.getProviderById(providerId),
      providerService.getServices(),
    ]).then(([p, s]) => {
      setProvider(p)
      setServices(s)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [providerId])

  const selectedService = services.find(s => String(s.id) === String(form.service_id))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.service_id || !form.scheduled_date || !form.scheduled_time || !form.address) {
      toast.error('Please fill in all required fields')
      return
    }
    setSubmitting(true)
    try {
      const estimated_amount = selectedService?.base_price || 299
      const booking = await bookingService.createBooking({
        provider_id: parseInt(providerId),
        ...form,
        service_id: parseInt(form.service_id),
        estimated_amount,
      })
      toast.success('Booking created! Please complete payment to confirm.')
      navigate(`/customer/payments?booking_id=${booking.id}`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create booking')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="min-h-screen flex flex-col"><Navbar /><Loading fullPage /></div>

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 page-container py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Book Service</h1>
          {provider && (
            <p className="text-gray-500 mb-6">with {provider.business_name || provider.user?.full_name}</p>
          )}
          <div className="card p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Service *</label>
                <select className="input-field" value={form.service_id}
                  onChange={e => setForm({ ...form, service_id: e.target.value })}>
                  <option value="">Select a service</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.base_price ? `(₹${s.base_price} ${s.price_unit || ''})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Date *</label>
                  <input type="date" className="input-field" value={form.scheduled_date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setForm({ ...form, scheduled_date: e.target.value })} />
                </div>
                <div>
                  <label className="label">Time *</label>
                  <input type="time" className="input-field" value={form.scheduled_time}
                    onChange={e => setForm({ ...form, scheduled_time: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">Service Address *</label>
                <input type="text" className="input-field" placeholder="Full address where service is needed"
                  value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
              </div>
              <div>
                <label className="label">Additional Notes</label>
                <textarea className="input-field resize-none" rows={3}
                  placeholder="Any specific requirements or details..."
                  value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>

              {selectedService && (
                <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-violet-900">{selectedService.name}</p>
                    <p className="text-xs text-violet-600">Estimated Total</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-violet-700">₹{selectedService.base_price || 299}</p>
                    <p className="text-xs text-gray-500">{selectedService.price_unit || 'per visit'}</p>
                  </div>
                </div>
              )}

              <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={submitting}>
                {submitting ? 'Creating Booking...' : '💳 Book & Proceed to Pay'}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
