import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ServiceCard from '../components/ServiceCard'
import ProviderCard from '../components/ProviderCard'
import Loading from '../components/Loading'
import providerService from '../services/providerService'
import api from '../services/api'

const HOW_IT_WORKS = [
  { icon: '💬', title: 'Describe Problem', desc: 'Tell us what you need in plain language.', color: 'from-violet-500 to-indigo-600' },
  { icon: '🤖', title: 'AI Finds Service', desc: 'Smart AI identifies the right service instantly.', color: 'from-pink-500 to-rose-500' },
  { icon: '🔍', title: 'Compare Experts', desc: 'Browse rated local professionals near you.', color: 'from-amber-500 to-orange-500' },
  { icon: '✅', title: 'Book & Relax', desc: 'Book in seconds, pay securely, leave a review.', color: 'from-emerald-500 to-teal-500' },
]

const WHY_US = [
  { icon: '✅', title: 'Verified Pros', desc: 'Background-checked professionals.', color: 'bg-emerald-500' },
  { icon: '🤖', title: 'AI Matching', desc: 'Smart matching for your exact needs.', color: 'bg-violet-500' },
  { icon: '⭐', title: 'Real Reviews', desc: 'Genuine ratings from real customers.', color: 'bg-amber-500' },
  { icon: '🔒', title: 'Safe Payments', desc: 'Encrypted, secure transactions.', color: 'bg-blue-500' },
  { icon: '📱', title: 'Live Tracking', desc: 'Track your provider in real time.', color: 'bg-pink-500' },
  { icon: '💬', title: '24/7 Support', desc: 'Always here to help you.', color: 'bg-cyan-500' },
]

const POPULAR = [
  { name: 'Plumber', icon: '🔧', color: 'from-blue-400 to-cyan-500' },
  { name: 'Electrician', icon: '⚡', color: 'from-yellow-400 to-orange-500' },
  { name: 'Cleaner', icon: '🧹', color: 'from-emerald-400 to-teal-500' },
  { name: 'AC Repair', icon: '❄️', color: 'from-cyan-400 to-blue-600' },
  { name: 'Beautician', icon: '💅', color: 'from-pink-400 to-rose-500' },
  { name: 'Tutor', icon: '📚', color: 'from-violet-400 to-indigo-600' },
]

export default function Home() {
  const [categories, setCategories] = useState([])
  const [providers, setProviders] = useState([])
  const [health, setHealth] = useState(null)
  const [loadingCats, setLoadingCats] = useState(true)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()


  useEffect(() => {
    api.get('/health').then(r => setHealth(r.data)).catch(() => setHealth({ status: 'error' }))
    providerService.getCategories().then(d => setCategories(d.slice(0, 10))).catch(() => {}).finally(() => setLoadingCats(false))
    providerService.getProviders({ limit: 4 }).then(d => setProviders(Array.isArray(d) ? d : d.providers || [])).catch(() => {})
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) navigate(`/customer/ai-assistant?q=${encodeURIComponent(search)}`)
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* ── HERO ────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700 overflow-hidden min-h-[85vh] flex items-center">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-96 h-96 bg-white/10 blob blur-2xl animate-float-slow" />
          <div className="absolute bottom-10 left-10 w-72 h-72 bg-pink-500/20 blob blur-3xl animate-float" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-cyan-400/15 blob blur-2xl" />
        </div>
        {/* Floating emoji decorations */}
        <div className="absolute top-20 right-20 text-5xl animate-float hidden lg:block">🔧</div>
        <div className="absolute top-40 right-48 text-3xl animate-float-slow hidden lg:block" style={{animationDelay:'1s'}}>⚡</div>
        <div className="absolute bottom-32 right-32 text-4xl animate-float hidden lg:block" style={{animationDelay:'2s'}}>🏠</div>
        <div className="absolute top-28 left-20 text-3xl animate-float-slow hidden lg:block" style={{animationDelay:'0.5s'}}>💅</div>

        <div className="relative page-container py-20 w-full">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-5 py-2 text-sm font-semibold text-white mb-6 border border-white/30">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              AI-Powered • Verified Professionals • Instant Booking
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tight">
              Find the Right<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-cyan-300">
                Local Pro
              </span>
            </h1>
            <p className="text-xl text-indigo-100 max-w-xl mx-auto mb-10 leading-relaxed">
              Describe your problem — our AI instantly finds the perfect local service provider for you.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-3 max-w-xl mx-auto mb-8">
              <input type="text" placeholder="e.g. My kitchen sink is leaking..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="flex-1 px-5 py-4 rounded-2xl text-gray-900 text-sm font-medium outline-none shadow-xl border-2 border-white/50 focus:border-yellow-300 transition-colors" />
              <button type="submit"
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold px-6 py-4 rounded-2xl transition-all duration-200 shadow-xl hover:shadow-orange-300 hover:-translate-y-0.5 whitespace-nowrap">
                Search 🔍
              </button>
            </form>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
              <Link to="/customer/ai-assistant"
                className="bg-white text-violet-700 hover:bg-violet-50 font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200 text-sm">
                🤖 AI Help Me
              </Link>
              <Link to="/services"
                className="bg-white/20 backdrop-blur hover:bg-white/30 border border-white/30 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-200 text-sm">
                Explore Services →
              </Link>
            </div>

            {/* Popular services pills */}
            <div className="flex flex-wrap justify-center gap-2">
              <span className="text-indigo-200 text-xs font-semibold mr-1">Popular:</span>
              {POPULAR.map(p => (
                <button key={p.name} onClick={() => navigate(`/customer/search?search=${p.name}`)}
                  className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200 hover:-translate-y-0.5">
                  {p.icon} {p.name}
                </button>
              ))}
            </div>

            {/* API health indicator */}
            {health && (
              <div className={`inline-flex items-center gap-1.5 mt-6 text-xs px-3 py-1.5 rounded-full border ${health.status === 'ok' ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200' : 'bg-red-500/20 border-red-400/40 text-red-200'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${health.status === 'ok' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                {health.status === 'ok' ? '✓ Live at 192.168.1.26:5174' : 'API Offline'}
              </div>
            )}
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C360,0 1080,0 1440,60 L1440,60 L0,60 Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────── */}
      <section className="bg-slate-50">
        <div className="page-container -mt-1">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-8">
            {[
              { value: '500+', label: 'Verified Providers', icon: '🔧', color: 'text-violet-600' },
              { value: '10K+', label: 'Happy Customers', icon: '😊', color: 'text-pink-600' },
              { value: '40+', label: 'Service Types', icon: '⚙️', color: 'text-amber-600' },
              { value: '4.8★', label: 'Average Rating', icon: '⭐', color: 'text-emerald-600' },
            ].map(s => (
              <div key={s.label} className="card p-4 text-center hover:shadow-md transition-shadow">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-500 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────── */}
      <section className="page-container py-14">
        <div className="text-center mb-10">
          <p className="text-violet-600 font-bold text-sm uppercase tracking-widest mb-2">What do you need?</p>
          <h2 className="section-title">Browse <span className="grad-text">Service Categories</span></h2>
          <p className="section-subtitle">From home repair to personal care — we've got every need covered</p>
        </div>
        {loadingCats ? <Loading /> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.map(cat => (
              <ServiceCard key={cat.id} category={cat}
                onClick={() => navigate(`/customer/search?category=${cat.id}`)} />
            ))}
          </div>
        )}
        <div className="text-center mt-8">
          <Link to="/services" className="btn-secondary">View All 40+ Services →</Link>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section className="bg-gradient-to-br from-slate-900 via-violet-950 to-indigo-950 py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-violet-600/20 blob blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-600/20 blob blur-3xl" />
        </div>
        <div className="relative page-container">
          <div className="text-center mb-12">
            <p className="text-violet-400 font-bold text-sm uppercase tracking-widest mb-2">Simple Process</p>
            <h2 className="text-4xl font-extrabold text-white">How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">Works</span></h2>
            <p className="text-slate-400 mt-3 text-lg">Get quality local services in 4 easy steps</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="relative group">
                {i < 3 && <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-white/20 to-transparent z-0" />}
                <div className="glass-card bg-white/5 border-white/10 p-6 text-center relative z-10 hover:bg-white/10 transition-colors duration-300">
                  <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-3xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                    {step.icon}
                  </div>
                  <div className="text-xs font-black text-white/40 uppercase tracking-widest mb-2">Step {i + 1}</div>
                  <h3 className="font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PROVIDERS ───────────────────────────── */}
      {providers.length > 0 && (
        <section className="page-container py-16">
          <div className="text-center mb-10">
            <p className="text-violet-600 font-bold text-sm uppercase tracking-widest mb-2">Top Rated</p>
            <h2 className="section-title">Featured <span className="grad-text">Providers</span></h2>
            <p className="section-subtitle">Handpicked professionals with the best ratings</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {providers.map((p, i) => <ProviderCard key={p.id} provider={p} index={i} />)}
          </div>
          <div className="text-center mt-8">
            <Link to="/customer/search" className="btn-primary">Find More Providers 🔍</Link>
          </div>
        </section>
      )}

      {/* ── WHY CHOOSE US ────────────────────────────────── */}
      <section className="bg-gradient-to-br from-violet-50 via-indigo-50 to-pink-50 py-16">
        <div className="page-container">
          <div className="text-center mb-12">
            <p className="text-violet-600 font-bold text-sm uppercase tracking-widest mb-2">Why LocalPro?</p>
            <h2 className="section-title">Trusted by <span className="grad-text">Thousands</span></h2>
            <p className="section-subtitle">Here's why customers and providers love us</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY_US.map((item, i) => (
              <div key={i} className="card-hover p-6 group flex items-start gap-4">
                <div className={`w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center text-xl text-white shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="page-container py-16">
        <div className="grad-primary rounded-4xl p-10 sm:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-5 left-5 w-32 h-32 bg-white/10 blob blur-2xl" />
            <div className="absolute bottom-5 right-5 w-40 h-40 bg-pink-500/20 blob blur-2xl" />
          </div>
          <div className="relative">
            <div className="text-5xl mb-4">🚀</div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">Ready to get started?</h2>
            <p className="text-indigo-200 mb-8 max-w-md mx-auto">Join thousands of customers who trust LocalPro for their local service needs.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/register" className="btn-white px-8 text-sm">Create Free Account ✨</Link>
              <Link to="/customer/ai-assistant" className="bg-white/20 hover:bg-white/30 border border-white/30 text-white font-bold px-8 py-3 rounded-2xl transition-all duration-200 text-sm">
                Try AI Help Me 🤖
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
