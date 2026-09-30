import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', confirm_password: '', role: 'customer' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.full_name || !form.email || !form.password) { toast.error('Fill in all required fields'); return }
    if (form.password !== form.confirm_password) { toast.error('Passwords do not match'); return }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const { confirm_password, ...payload } = form
      const user = await register({ ...payload, phone: payload.phone || null })
      toast.success('Account created! Welcome 🎉')
      if (user.role === 'admin') navigate('/admin/dashboard')
      else if (user.role === 'provider') navigate('/provider/dashboard')
      else navigate('/customer/dashboard')
    } catch (err) {
      const msg = err.response?.data?.detail
      if (Array.isArray(msg)) {
        toast.error(msg.map(m => m.msg || m.message).join(' | '))
      } else if (typeof msg === 'string') {
        toast.error(msg)
      } else {
        toast.error('Registration failed. Please check your details.')
      }
    } finally { setLoading(false) }

  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-600 via-violet-600 to-indigo-700 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-10 right-10 w-72 h-72 bg-yellow-400/20 blob blur-3xl animate-float-slow" />
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-cyan-400/20 blob blur-3xl animate-float" />

      <div className="relative w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-3xl font-black text-white">LocalPro</span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-white">Create your account ✨</h1>
          <p className="text-pink-200 mt-1">Join thousands of happy users</p>
        </div>

        <div className="glass-card bg-white/10 border-white/20 p-8">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { role: 'customer', label: 'I need services', icon: '🛒' },
              { role: 'provider', label: 'I provide services', icon: '🔧' },
            ].map(({ role, label, icon }) => (
              <button key={role} type="button" onClick={() => setForm({ ...form, role })}
                className={`p-4 rounded-2xl border-2 text-sm font-bold transition-all duration-200 flex flex-col items-center gap-1 ${
                  form.role === role
                    ? 'border-yellow-300 bg-yellow-300/20 text-white'
                    : 'border-white/20 bg-white/5 text-white/70 hover:border-white/40'
                }`}>
                <span className="text-2xl">{icon}</span>{label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'full_name', label: 'Full Name *', type: 'text', placeholder: 'John Doe' },
              { key: 'email', label: 'Email *', type: 'email', placeholder: 'you@example.com' },
              { key: 'phone', label: 'Phone', type: 'tel', placeholder: '+91 98765 43210' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-semibold text-white/80 mb-1.5">{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full px-4 py-3.5 bg-white/10 border-2 border-white/20 focus:border-yellow-300 rounded-2xl text-white placeholder-white/40 outline-none transition-colors font-medium" />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'password', label: 'Password *', placeholder: '••••••••' },
                { key: 'confirm_password', label: 'Confirm *', placeholder: '••••••••' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-semibold text-white/80 mb-1.5">{f.label}</label>
                  <input type="password" placeholder={f.placeholder} value={form[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full px-4 py-3.5 bg-white/10 border-2 border-white/20 focus:border-yellow-300 rounded-2xl text-white placeholder-white/40 outline-none transition-colors font-medium" />
                </div>
              ))}
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-4 rounded-2xl transition-all duration-200 shadow-xl hover:-translate-y-0.5 disabled:opacity-50 mt-2">
              {loading ? 'Creating account...' : 'Create Account 🚀'}
            </button>
          </form>
          <p className="text-center text-sm text-white/60 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-yellow-300 font-bold hover:text-yellow-200">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
