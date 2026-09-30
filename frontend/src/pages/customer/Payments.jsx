import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import ReceiptModal from '../../components/ReceiptModal'
import Loading from '../../components/Loading'
import api from '../../services/api'
import paymentService from '../../services/paymentService'
import bookingService from '../../services/bookingService'
import toast from 'react-hot-toast'

export default function Payments() {
  const [searchParams] = useSearchParams()
  const bookingId = searchParams.get('booking_id')
  const navigate = useNavigate()

  const [booking, setBooking] = useState(null)
  const [unpaidBookings, setUnpaidBookings] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [paidReceipt, setPaidReceipt] = useState(null)
  const [selectedReceipt, setSelectedReceipt] = useState(null)

  // Payment form state
  const [method, setMethod] = useState('MOCK')
  const [upiId, setUpiId] = useState('customer@okhdfcbank')
  const [card, setCard] = useState({ number: '4111 2222 3333 4444', name: 'Demo Customer', expiry: '12/28', cvv: '123' })
  const [discountCode, setDiscountCode] = useState('')
  const [discountApplied, setDiscountApplied] = useState(false)
  const [discountAmount, setDiscountAmount] = useState(0)

  const loadData = async () => {
    setLoading(true)
    try {
      if (bookingId) {
        const bRes = await api.get(`/bookings/${bookingId}`)
        setBooking(bRes.data)
      }
      const [hist, allBookings] = await Promise.all([
        paymentService.getMyPaymentHistory().catch(() => []),
        bookingService.getMyBookings().catch(() => []),
      ])
      setHistory(Array.isArray(hist) ? hist : [])
      const bList = Array.isArray(allBookings) ? allBookings : allBookings.bookings || []
      setUnpaidBookings(bList.filter(b => !b.is_paid && b.status !== 'CANCELLED'))
    } catch {
      toast.error('Failed to load payment details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [bookingId])

  const applyCoupon = () => {
    const code = discountCode.trim().toUpperCase()
    const baseAmt = Number(booking?.total_amount || booking?.estimated_amount || 0)
    if (code === 'WELCOME50' || code === 'FIRST50' || code === 'LOCALPRO50') {
      const disc = Math.min(50, baseAmt * 0.5)
      setDiscountAmount(disc)
      setDiscountApplied(true)
      toast.success(`Coupon applied! Saved ₹${disc.toFixed(2)}`)
    } else if (code === 'SAVE20' || code === 'LOCAL20') {
      const disc = Math.round(baseAmt * 0.2 * 100) / 100
      setDiscountAmount(disc)
      setDiscountApplied(true)
      toast.success(`Coupon applied! 20% discount saved: ₹${disc.toFixed(2)}`)
    } else {
      toast.error('Invalid coupon code. Try WELCOME50 or SAVE20')
    }
  }

  const handlePay = async () => {
    if (!booking) {
      toast.error('No booking selected to pay for')
      return
    }
    setProcessing(true)
    try {
      const targetAmount = Math.max(0, Number(booking.total_amount || booking.estimated_amount || 0) - discountAmount)
      const res = await paymentService.createPayment({
        booking_id: parseInt(booking.id),
        amount: targetAmount,
        payment_method: method,
        upi_id: method === 'UPI' ? upiId : null,
        card_last4: method === 'CARD' ? card.number.replace(/\s+/g, '').slice(-4) : null,
        card_network: method === 'CARD' ? 'Visa' : null,
        cardholder_name: method === 'CARD' ? card.name : null,
        discount_code: discountApplied ? discountCode.trim().toUpperCase() : null,
      })

      toast.success('Payment completed successfully!')
      // Fetch full receipt
      try {
        const receipt = await paymentService.getReceipt(res.id)
        setPaidReceipt(receipt)
      } catch {
        setPaidReceipt(res)
      }
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Payment failed')
    } finally {
      setProcessing(false)
    }
  }

  const handleOpenReceipt = async (p) => {
    try {
      const r = await paymentService.getReceipt(p.id)
      setSelectedReceipt(r)
    } catch {
      setSelectedReceipt(p)
    }
  }

  const baseAmount = Number(booking?.total_amount || booking?.estimated_amount || 0)
  const payableAmount = Math.max(0, baseAmount - discountAmount)

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 page-container py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
            <span>💳</span> Payments & Invoices
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Complete bookings payment, view transaction history, and download official receipts.
          </p>
        </div>

        {/* Payment Checkout Area */}
        {bookingId && booking && !booking.is_paid && !paidReceipt && (
          <div className="mb-10">
            <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <div>
                  <span className="text-xs font-bold text-violet-600 bg-violet-50 border border-violet-100 px-3 py-1 rounded-full uppercase">
                    Order Checkout
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 mt-2">Complete Your Booking</h2>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-semibold">Booking ID</p>
                  <p className="font-extrabold text-slate-800">#{booking.id}</p>
                </div>
              </div>

              {/* Service & Provider Details */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-6 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Service</span>
                  <span className="font-bold text-slate-800">{booking.service_name || 'Home Service'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Service Provider</span>
                  <span className="font-bold text-slate-800">{booking.provider_name || 'Verified Provider'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Scheduled Date</span>
                  <span className="font-medium text-slate-700">{booking.scheduled_date} at {booking.scheduled_time || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Address</span>
                  <span className="font-medium text-slate-700 text-right truncate max-w-xs">{booking.address || 'Your address'}</span>
                </div>
              </div>

              {/* Coupon Code Section */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Have a Promo / Discount Code?</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. WELCOME50 or SAVE20"
                    value={discountCode}
                    disabled={discountApplied}
                    onChange={e => setDiscountCode(e.target.value)}
                    className="input-field flex-1 font-mono uppercase"
                  />
                  {discountApplied ? (
                    <button
                      onClick={() => { setDiscountApplied(false); setDiscountAmount(0); setDiscountCode('') }}
                      className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition-colors">
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={applyCoupon}
                      className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm">
                      Apply
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Use <b>WELCOME50</b> for ₹50 off or <b>SAVE20</b> for 20% off</p>
              </div>

              {/* Payment Methods */}
              <div className="space-y-4 mb-6">
                <label className="block text-xs font-bold text-slate-700 uppercase">Select Payment Method</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'MOCK', label: '⚡ Instant Mock', desc: 'Demo Gateway' },
                    { id: 'UPI',  label: '📱 UPI',         desc: 'GPay / PhonePe' },
                    { id: 'CARD', label: '💳 Credit / Debit', desc: 'Visa / Mastercard' },
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        method === m.id
                          ? 'border-violet-600 bg-violet-50/70 ring-2 ring-violet-500/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}>
                      <p className="font-bold text-slate-900 text-xs">{m.label}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{m.desc}</p>
                    </button>
                  ))}
                </div>

                {/* UPI Fields */}
                {method === 'UPI' && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 animate-fade-in">
                    <label className="block text-xs font-bold text-slate-700 mb-1">UPI ID (Virtual Payment Address)</label>
                    <input
                      type="text"
                      className="input-field text-sm"
                      placeholder="username@upi"
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                    />
                  </div>
                )}

                {/* Card Fields */}
                {method === 'CARD' && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3 animate-fade-in">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Card Number</label>
                      <input
                        className="input-field text-sm font-mono"
                        placeholder="4111 2222 3333 4444"
                        value={card.number}
                        onChange={e => setCard({ ...card, number: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Cardholder Name</label>
                        <input
                          className="input-field text-sm"
                          placeholder="Name on card"
                          value={card.name}
                          onChange={e => setCard({ ...card, name: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Expiry</label>
                          <input
                            className="input-field text-sm font-mono text-center"
                            placeholder="MM/YY"
                            value={card.expiry}
                            onChange={e => setCard({ ...card, expiry: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">CVV</label>
                          <input
                            className="input-field text-sm font-mono text-center"
                            type="password"
                            maxLength={4}
                            placeholder="123"
                            value={card.cvv}
                            onChange={e => setCard({ ...card, cvv: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Price Calculation Summary */}
              <div className="border-t border-slate-200 pt-4 mb-6 space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Base Service Fee</span>
                  <span>₹{baseAmount.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount Applied ({discountCode.toUpperCase()})</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Taxes & Platform Fee</span>
                  <span className="text-emerald-600 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 pt-3 text-xl font-black text-slate-900">
                  <span>Payable Amount</span>
                  <span className="text-emerald-700">₹{payableAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handlePay}
                disabled={processing}
                className="btn-primary w-full py-4 text-base font-extrabold shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2">
                {processing ? (
                  <>⚡ Processing Secure Payment...</>
                ) : (
                  <>💳 Pay ₹{payableAmount.toFixed(2)} Now</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Paid Confirmation Screen */}
        {paidReceipt && (
          <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 border border-emerald-100 shadow-xl text-center mb-10">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-4 font-black">
              ✅
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-1">Payment Successful!</h2>
            <p className="text-slate-500 text-sm mb-6">
              Your service is confirmed and the invoice has been generated.
            </p>
            <div className="bg-slate-50 rounded-2xl p-4 text-xs font-mono text-slate-600 mb-6 flex justify-between">
              <span>Txn: {paidReceipt.transaction_id || `TXN-${paidReceipt.id}`}</span>
              <span className="font-bold text-emerald-600">₹{Number(paidReceipt.total_amount || paidReceipt.amount).toFixed(2)} PAID</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setSelectedReceipt(paidReceipt)}
                className="btn-primary flex-1 py-3 text-xs flex items-center justify-center gap-2">
                📄 View / Print Receipt
              </button>
              <button
                onClick={() => navigate('/customer/dashboard')}
                className="btn-outline flex-1 py-3 text-xs">
                Back to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Unpaid Bookings Prompt (when no specific booking is active in query) */}
        {!bookingId && unpaidBookings.length > 0 && (
          <div className="mb-10 bg-amber-50 border border-amber-200 rounded-3xl p-6">
            <h3 className="text-lg font-black text-amber-950 flex items-center gap-2 mb-3">
              <span>⚠️</span> Bookings Pending Payment ({unpaidBookings.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unpaidBookings.map(b => (
                <div key={b.id} className="bg-white rounded-2xl p-4 border border-amber-100 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{b.service_name || 'Service Booking'}</p>
                    <p className="text-xs text-slate-500">with {b.provider_name}</p>
                    <p className="text-xs font-black text-emerald-600 mt-1">₹{b.total_amount || b.estimated_amount || 0}</p>
                  </div>
                  <Link
                    to={`/customer/payments?booking_id=${b.id}`}
                    className="btn-primary text-xs py-2 px-4 shadow-sm">
                    💳 Pay Now
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Complete Payment & Invoices History Table */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <span>🧾</span> Payment & Invoice History
              </h2>
              <p className="text-slate-500 text-xs">Full records of all completed and processed transactions</p>
            </div>
          </div>

          {loading ? (
            <Loading />
          ) : history.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-5xl mb-3">📋</div>
              <h3 className="font-bold text-slate-700 text-base mb-1">No payment history yet</h3>
              <p className="text-slate-400 text-xs">
                When you book a service and make a payment, your receipts and transaction records will be saved here.
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
                    <th className="pb-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {history.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-3">
                        <p className="font-bold text-slate-900">{p.invoice_number || `INV-${p.booking_id}`}</p>
                        <p className="text-[11px] font-mono text-slate-400">{p.transaction_id || `TXN-${p.id}`}</p>
                      </td>
                      <td className="py-4 px-3">
                        <p className="font-bold text-slate-800">{p.service_name || 'Service Booking'}</p>
                        <p className="text-[11px] text-slate-500">{p.provider_name || p.provider_business || 'Provider'}</p>
                      </td>
                      <td className="py-4 px-3">
                        <span className="inline-flex items-center gap-1 font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-[11px]">
                          {p.payment_method === 'UPI' ? '📱 UPI' : p.payment_method === 'CARD' ? '💳 Card' : '⚡ Mock Gateway'}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-slate-500 whitespace-nowrap">
                        {p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                      </td>
                      <td className="py-4 px-3 font-extrabold text-emerald-700 text-sm whitespace-nowrap">
                        ₹{Number(p.amount).toFixed(2)}
                      </td>
                      <td className="py-4 px-3 whitespace-nowrap">
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
                      <td className="py-4 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenReceipt(p)}
                          className="font-bold text-violet-600 hover:text-violet-900 bg-violet-50 hover:bg-violet-100 border border-violet-200 px-3.5 py-1.5 rounded-xl transition-all shadow-sm">
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
