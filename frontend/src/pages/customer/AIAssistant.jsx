import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import api from '../../services/api'
import toast from 'react-hot-toast'

const SUGGESTIONS = [
  { text: 'My kitchen sink is leaking', icon: '🚿' },
  { text: 'Need someone to clean my house', icon: '🧹' },
  { text: 'My AC is not cooling', icon: '❄️' },
  { text: 'Looking for a babysitter', icon: '👶' },
  { text: 'My laptop screen is broken', icon: '💻' },
  { text: 'Need a car wash today', icon: '🚗' },
  { text: 'Want a home cooked meal service', icon: '🍳' },
  { text: 'Need an electrician urgently', icon: '⚡' },
]

const URGENCY_STYLES = {
  LOW:    { class: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: '🟢 Low' },
  NORMAL: { class: 'bg-blue-100 text-blue-700 border-blue-200',         label: '🔵 Normal' },
  HIGH:   { class: 'bg-amber-100 text-amber-700 border-amber-200',      label: '🟡 High' },
  URGENT: { class: 'bg-red-100 text-red-700 border-red-200',            label: '🔴 Urgent' },
}

export default function AIAssistant() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) { setQuery(q); handleAnalyze(q) }
  }, [])

  const handleAnalyze = async (text) => {
    const problem = text || query
    if (!problem.trim()) { toast.error('Please describe your problem'); return }
    setLoading(true); setResult(null)
    try {
      const r = await api.post('/ai/help', { problem })
      setResult(r.data)
    } catch { toast.error('AI service unavailable. Please try again.') }
    finally { setLoading(false) }
  }

  const urgencyStyle = result ? (URGENCY_STYLES[result.urgency] || URGENCY_STYLES.NORMAL) : null

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700 py-14 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-5 right-10 w-48 h-48 bg-pink-500/20 blob blur-3xl animate-float" />
          <div className="absolute bottom-5 left-10 w-40 h-40 bg-cyan-400/20 blob blur-3xl animate-float-slow" />
        </div>
        <div className="relative page-container text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-2xl animate-pulse-ring">🤖</div>
          <h1 className="text-4xl font-black text-white mb-2">AI Help Me</h1>
          <p className="text-indigo-200 text-lg max-w-md mx-auto">Describe your problem in plain language — AI identifies the right service instantly.</p>
        </div>
      </div>

      <main className="flex-1 page-container py-10 -mt-6 relative z-10">
        <div className="max-w-2xl mx-auto">
          {/* Input card */}
          <div className="card p-6 mb-6 shadow-xl">
            <label className="block font-bold text-gray-800 text-base mb-3">💬 What's your problem?</label>
            <textarea value={query} onChange={e => setQuery(e.target.value)}
              placeholder="e.g. My kitchen sink is leaking badly and there's water on the floor..."
              rows={4} className="input-field resize-none text-base mb-4" />
            <button onClick={() => handleAnalyze()} disabled={loading}
              className="btn-primary w-full py-4 text-base">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Analyzing with AI...
                </span>
              ) : '🔍 Analyze My Problem'}
            </button>
          </div>

          {/* Suggestions */}
          {!result && !loading && (
            <div className="card p-5 mb-6">
              <p className="text-sm font-bold text-gray-600 mb-3">✨ Try these examples:</p>
              <div className="grid grid-cols-2 gap-2">
                {SUGGESTIONS.map(s => (
                  <button key={s.text} onClick={() => { setQuery(s.text); handleAnalyze(s.text) }}
                    className="flex items-center gap-2 text-sm bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-100 px-3 py-2.5 rounded-2xl transition-colors text-left font-medium">
                    <span>{s.icon}</span><span className="truncate">{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="card p-6 mb-6 border-2 border-violet-200 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 text-xl">✓</div>
                <div>
                  <h2 className="font-extrabold text-gray-900">AI Analysis Complete</h2>
                  <p className="text-xs text-gray-400">Confidence: {Math.round((result.confidence || 0) * 100)}%</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: 'Category', value: result.category, icon: '📁' },
                  { label: 'Service Needed', value: result.service, icon: '🔧' },
                  { label: 'Problem', value: result.problem_summary, icon: '📝' },
                  { label: 'Urgency', value: null, icon: '⚠️', custom: (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${urgencyStyle.class}`}>
                      {urgencyStyle.label}
                    </span>
                  )},
                ].map(item => (
                  <div key={item.label} className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl p-4 border border-violet-100">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">{item.icon} {item.label}</p>
                    {item.custom || <p className="font-bold text-gray-900 text-sm">{item.value || '—'}</p>}
                  </div>
                ))}
              </div>

              {result.price_estimate && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-5">
                  <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">💰 Price Estimate</p>
                  <p className="font-extrabold text-emerald-800">₹{result.price_estimate.min_price} – ₹{result.price_estimate.max_price}</p>
                  <p className="text-xs text-emerald-600 mt-0.5">{result.price_estimate.note}</p>
                </div>
              )}

              {result.suggestions?.length > 0 && (
                <div className="mb-5">
                  <p className="text-sm font-bold text-gray-700 mb-2">💡 Tips:</p>
                  <ul className="space-y-1.5">
                    {result.suggestions.map((s, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-2 bg-gray-50 rounded-xl px-3 py-2">
                        <span className="text-violet-500 mt-0.5 flex-shrink-0">•</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => navigate(`/customer/search?service_name=${encodeURIComponent(result.service || '')}`)}
                  className="btn-primary flex-1">
                  Find {result.service}s Near You →
                </button>
                <button onClick={() => setResult(null)} className="btn-outline px-4">↺ Try Again</button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
