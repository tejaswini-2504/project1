import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || null
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Please fill in all fields'); return }
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.full_name.split(' ')[0]}! 🎉`)
      if (from) return navigate(from, { replace: true })
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
        toast.error('Invalid email or password')
      }
    } finally { setLoading(false) }

  }

  const fillDemo = (role) => {
    const creds = {
      admin:    { email: 'admin@localpro.com',  password: 'admin123' },
      customer: { email: 'customer1@demo.com',  password: 'customer123' },
      provider: { email: 'provider1@demo.com',  password: 'provider123' },
    }
    setForm(creds[role])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-pink-500/20 blob blur-3xl animate-float-slow" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-400/20 blob blur-3xl animate-float" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center shadow-xl">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-3xl font-black text-white">LocalPro</span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-white">Welcome back! 👋</h1>
          <p className="text-indigo-200 mt-1">Sign in to your account</p>
        </div>

        {/* Quick demo */}
        <div className="glass-card bg-white/10 border-white/20 p-4 mb-4">
          <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-3 text-center">Quick Demo Login</p>
          <div className="grid grid-cols-3 gap-2">
            {[['admin','🛡️'],['customer','👤'],['provider','🔧']].map(([role, icon]) => (
              <button key={role} onClick={() => fillDemo(role)}
                className="flex flex-col items-center gap-1 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl transition-all duration-200 text-white">
                <span className="text-xl">{icon}</span>
                <span className="text-xs font-semibold capitalize">{role}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="glass-card bg-white/10 border-white/20 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-1.5">Email address</label>
              <input type="email" placeholder="you@example.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3.5 bg-white/10 border-2 border-white/20 focus:border-yellow-300 rounded-2xl text-white placeholder-white/40 outline-none transition-colors font-medium" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-1.5">Password</label>
              <input type="password" placeholder="••••••••" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3.5 bg-white/10 border-2 border-white/20 focus:border-yellow-300 rounded-2xl text-white placeholder-white/40 outline-none transition-colors font-medium" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-4 rounded-2xl transition-all duration-200 shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none mt-2">
              {loading ? 'Signing in...' : 'Sign In 🚀'}
            </button>
          </form>
          <p className="text-center text-sm text-white/60 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-yellow-300 font-bold hover:text-yellow-200">Create one ✨</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
