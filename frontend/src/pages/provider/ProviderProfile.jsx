import React, { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import providerService from '../../services/providerService'
import toast from 'react-hot-toast'

export default function ProviderProfilePage() {
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({
    business_name: '',
    tagline: '',
    bio: '',
    service_area: '',
    hourly_rate: '',
    experience_years: '',
    category_id: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    providerService.getCategories().then(setCategories).catch(() => {})
    api.get('/providers/me').then(r => {
      setForm(prev => ({ ...prev, ...r.data }))
    }).catch(() => {})
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/providers/me', form)
      toast.success('Profile saved!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 page-container py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Provider Profile</h1>
          <div className="card p-6">
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="label">Business Name</label>
                <input type="text" className="input-field" value={form.business_name}
                  onChange={e => setForm({ ...form, business_name: e.target.value })} />
              </div>
              <div>
                <label className="label">Tagline</label>
                <input type="text" className="input-field" placeholder="e.g. Expert plumber with 10 years experience"
                  value={form.tagline} onChange={e => setForm({ ...form, tagline: e.target.value })} />
              </div>
              <div>
                <label className="label">About / Bio</label>
                <textarea className="input-field resize-none" rows={4} value={form.bio}
                  onChange={e => setForm({ ...form, bio: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Category</label>
                  <select className="input-field" value={form.category_id}
                    onChange={e => setForm({ ...form, category_id: e.target.value })}>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Service Area</label>
                  <input type="text" className="input-field" placeholder="e.g. Andheri, Mumbai"
                    value={form.service_area} onChange={e => setForm({ ...form, service_area: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Hourly Rate (₹)</label>
                  <input type="number" className="input-field" value={form.hourly_rate}
                    onChange={e => setForm({ ...form, hourly_rate: e.target.value })} />
                </div>
                <div>
                  <label className="label">Years of Experience</label>
                  <input type="number" className="input-field" value={form.experience_years}
                    onChange={e => setForm({ ...form, experience_years: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full" disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
