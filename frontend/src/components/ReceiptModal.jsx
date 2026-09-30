import React from 'react'

export default function ReceiptModal({ receipt, onClose }) {
  if (!receipt) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-scale-up">
        {/* Header banner */}
        <div className="grad-primary text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-lg transition-colors">
            ✕
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
              🧾
            </div>
            <div>
              <h2 className="text-xl font-black">Official Payment Receipt</h2>
              <p className="text-indigo-200 text-xs mt-0.5">LocalPro AI-Powered Services Platform</p>
            </div>
          </div>
        </div>

        {/* Invoice details body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Top Status & IDs */}
          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Invoice No</p>
              <p className="font-extrabold text-slate-800 text-sm mt-0.5">{receipt.invoice_number || `INV-${receipt.booking_id}`}</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black uppercase">
                ✅ Paid
              </span>
              <p className="text-xs text-slate-500 mt-1">
                {receipt.created_at ? new Date(receipt.created_at).toLocaleDateString() : 'Today'}
              </p>
            </div>
          </div>

          {/* Details breakdown */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Customer</p>
              <p className="font-bold text-slate-800 mt-0.5">{receipt.customer_name || 'Customer'}</p>
              <p className="text-xs text-slate-500">{receipt.customer_email || ''}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">Service Provider</p>
              <p className="font-bold text-slate-800 mt-0.5">{receipt.provider_name || receipt.provider_business || 'Provider'}</p>
              <p className="text-xs text-slate-500">{receipt.provider_business || receipt.provider_phone || ''}</p>
            </div>
          </div>

          {/* Service & Schedule info */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Service</span>
              <span className="font-bold text-slate-800">{receipt.service_name || 'Service Booking'}</span>
            </div>
            {receipt.scheduled_date && (
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Scheduled For</span>
                <span className="text-slate-700">{receipt.scheduled_date} {receipt.scheduled_time ? `at ${receipt.scheduled_time}` : ''}</span>
              </div>
            )}
            {receipt.transaction_id && (
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Transaction ID</span>
                <span className="font-mono text-xs font-bold text-indigo-600">{receipt.transaction_id}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Payment Method</span>
              <span className="font-semibold text-slate-700 uppercase">
                {receipt.payment_method || 'MOCK'} {receipt.card_last4 ? `(**** ${receipt.card_last4})` : receipt.upi_id ? `(${receipt.upi_id})` : ''}
              </span>
            </div>
          </div>

          {/* Financial summary */}
          <div className="border-t border-slate-200 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>₹{receipt.subtotal != null ? Number(receipt.subtotal).toFixed(2) : Number(receipt.total_amount || receipt.amount || 0).toFixed(2)}</span>
            </div>
            {receipt.discount_amount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Discount</span>
                <span>-₹{Number(receipt.discount_amount).toFixed(2)}</span>
              </div>
            )}
            {receipt.tax_amount > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>GST / Tax</span>
                <span>₹{Number(receipt.tax_amount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center border-t border-slate-200 pt-3 text-lg font-black text-slate-900">
              <span>Total Paid</span>
              <span className="text-emerald-600">₹{Number(receipt.total_amount || receipt.amount || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button
            onClick={() => window.print()}
            className="btn-outline flex-1 flex items-center justify-center gap-2 text-sm py-2.5">
            🖨️ Print Receipt
          </button>
          <button
            onClick={onClose}
            className="btn-primary flex-1 text-sm py-2.5">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
