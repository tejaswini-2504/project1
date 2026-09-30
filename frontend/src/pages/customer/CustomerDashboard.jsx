import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import BookingCard from '../../components/BookingCard'
import Loading from '../../components/Loading'
import ReceiptModal from '../../components/ReceiptModal'
import { useAuth } from '../../context/AuthContext'
import bookingService from '../../services/bookingService'
import paymentService from '../../services/paymentService'

const QUICK_ACTIONS = [
  { to: '/customer/ai-assistant', label: 'AI Help Me', desc: 'Describe your problem', icon: '🤖', grad: 'from-violet-600 to-indigo-600' },
  { to: '/customer/search',       label: 'Find Providers', desc: 'Browse local experts', icon: '🔍', grad: 'from-pink-500 to-rose-500' },
  { to: '/customer/bookings',     label: 'My Bookings',   desc: 'Track your services', icon: '📅', grad: 'from-emerald-500 to-teal-500' },
  { to: '/customer/payments',     label: 'Payments & Bills', desc: 'Pay bookings & view invoices', icon: '💳', grad: 'from-amber-500 to-orange-500' },
]

export default function CustomerDashboard() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReceipt, setSelectedReceipt] = useState(null)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    Promise.all([
      bookingService.getMyBookings({ limit: 10 }).catch(() => []),
      paymentService.getMyPaymentHistory().catch(() => []),
    ]).then(([bData, pData]) => {
      setBookings(Array.isArray(bData) ? bData : bData.bookings || [])
      setPayments(Array.isArray(pData) ? pData : [])
    }).finally(() => {
      setLoading(false)
    })
  }, [])

  const unpaidBookings = bookings.filter(b => !b.is_paid && b.status !== 'CANCELLED')
  const totalSpent = payments
    .filter(p => p.status === 'SUCCESS')
    .reduce((acc, p) => acc + (Number(p.amount) || 0), 0)

  const stats = {
    total: bookings.length,
    active: bookings.filter(b => !['COMPLETED','CANCELLED'].includes(b.status)).length,
    unpaid: unpaidBookings.length,
    totalSpent: Math.round(totalSpent),
  }

  const handleOpenReceipt = async (payment) => {
    try {
      const receipt = await paymentService.getReceipt(payment.id)
      setSelectedReceipt(receipt)
    } catch {
      setSelectedReceipt(payment)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Header banner */}
      <div className="grad-primary text-white py-10">
        <div className="page-container">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center text-3xl font-black shadow-inner">
              {user?.full_name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold">Welcome back, {user?.full_name?.split(' ')[0]}! 👋</h1>
              <p className="text-indigo-200 mt-0.5">Manage your service bookings, payments, and invoices</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Total Bookings', value: stats.total, icon: '📋' },
              { label: 'Active Services', value: stats.active, icon: '⚡' },
              { label: 'Pending Payments', value: stats.unpaid, icon: '⏳', highlight: stats.unpaid > 0 },
              { label: 'Total Paid', value: `₹${stats.totalSpent}`, icon: '💳' },
            ].map(s => (
              <div
                key={s.label}
                className={`backdrop-blur rounded-2xl p-4 text-center border transition-all ${
                  s.highlight
                    ? 'bg-amber-500/25 border-amber-300 ring-2 ring-amber-300'
                    : 'bg-white/15 border-white/20'
                }`}>
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-3xl font-black text-white">{s.value}</div>
                <div className="text-indigo-200 text-xs font-semibold uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-1 page-container py-8 -mt-6 relative z-10 space-y-8">
        {/* Unpaid Bookings Alert Banner */}
        {unpaidBookings.length > 0 && (
          <div className="bg-amber-50 border-2 border-amber-300/80 rounded-2xl p-5 shadow-lg shadow-amber-100/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-200/80 text-amber-900 flex items-center justify-center text-2xl font-black shrink-0">
                💳
              </div>
              <div>
                <h3 className="font-extrabold text-amber-950 text-base">
                  You have {unpaidBookings.length} pending service payment{unpaidBookings.length > 1 ? 's' : ''}
                </h3>
                <p className="text-amber-800 text-xs mt-0.5">
                  Complete payment to ensure your service provider is immediately confirmed and dispatched.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Link
                to={`/customer/payments?booking_id=${unpaidBookings[0].id}`}
                className="btn-primary text-xs py-2.5 px-5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-md shadow-amber-600/30 w-full md:w-auto text-center font-bold">
                ⚡ Pay Latest (₹{unpaidBookings[0].total_amount || unpaidBookings[0].estimated_amount || 0})
              </Link>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map(a => (
            <Link
              key={a.to}
              to={a.to}
              className={`card-hover p-5 bg-gradient-to-br ${a.grad} flex flex-col gap-2 rounded-2xl shadow-md shadow-indigo-100`}>
              <div className="text-3xl">{a.icon}</div>
              <div>
                <p className="font-bold text-white text-base">{a.label}</p>
                <p className="text-xs text-white/80 mt-0.5">{a.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Bookings Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <span>📅</span> Recent Bookings
              </h2>
              <p className="text-slate-500 text-xs">Track active requests and service status</p>
            </div>
            <Link to="/customer/bookings" className="text-xs font-bold text-violet-600 hover:text-violet-800">
              View all bookings →
            </Link>
          </div>

          {loading ? (
            <Loading />
          ) : bookings.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="text-5xl mb-3">📋</div>
              <h3 className="font-bold text-slate-700 text-base mb-1">No bookings yet</h3>
              <p className="text-slate-400 mb-5 text-xs">Use AI Help Me to find the perfect service provider</p>
              <Link to="/customer/ai-assistant" className="btn-primary text-xs py-2 px-4">
                🤖 Try AI Help Me
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookings.slice(0, 4).map(b => (
                <BookingCard key={b.id} booking={b} role="customer" />
              ))}
            </div>
          )}
        </div>

        {/* Payment History & Invoices List Section */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <span>💳</span> Payment History & Invoices
              </h2>
              <p className="text-slate-500 text-xs">All past transactions, invoices, and receipts for your bookings</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/customer/payments"
                className="text-xs font-bold bg-violet-50 text-violet-700 hover:bg-violet-100 px-3.5 py-2 rounded-xl border border-violet-200 transition-colors flex items-center gap-1">
                <span>⚡ Make a Payment</span>
              </Link>
            </div>
          </div>

          {loading ? (
            <Loading />
          ) : payments.length === 0 ? (
            <div className="p-10 text-center rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-4xl mb-2">🧾</div>
              <p className="font-bold text-slate-700 text-sm">No payment records yet</p>
              <p className="text-slate-400 text-xs mt-1">
                Payments made for your service bookings will appear here with downloadable receipts.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3 px-3">Invoice & Txn</th>
                    <th className="pb-3 px-3">Service & Provider</th>
                    <th className="pb-3 px-3">Method</th>
                    <th className="pb-3 px-3">Date</th>
                    <th className="pb-3 px-3">Amount</th>
                    <th className="pb-3 px-3">Status</th>
                    <th className="pb-3 px-3 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {payments.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3">
                        <p className="font-bold text-slate-900">{p.invoice_number || `INV-${p.booking_id}`}</p>
                        <p className="text-[11px] font-mono text-slate-400">{p.transaction_id || `TXN-${p.id}`}</p>
                      </td>
                      <td className="py-3.5 px-3">
                        <p className="font-bold text-slate-800">{p.service_name || 'Service Booking'}</p>
                        <p className="text-[11px] text-slate-500">{p.provider_name || p.provider_business || 'Provider'}</p>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center gap-1 font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-[11px]">
                          {p.payment_method === 'UPI' ? '📱 UPI' : p.payment_method === 'CARD' ? '💳 Card' : '⚡ Mock Gateway'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                        {p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                      </td>
                      <td className="py-3.5 px-3 font-extrabold text-emerald-700 text-sm whitespace-nowrap">
                        ₹{Number(p.amount).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            p.status === 'SUCCESS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                          {p.status === 'SUCCESS' ? '✅ Paid' : p.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenReceipt(p)}
                          className="font-bold text-violet-600 hover:text-violet-900 bg-violet-50 hover:bg-violet-100 border border-violet-200 px-3 py-1.5 rounded-xl transition-all shadow-sm">
                          📄 View Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <ReceiptModal
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}

      <Footer />
    </div>
  )
}
