import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const steps = [
  { step: '01', title: 'Describe your problem', desc: 'Tell us what you need in plain language. Our AI understands you.', icon: '💬' },
  { step: '02', title: 'AI finds the right service', desc: 'Our smart system identifies the category, service type, and urgency.', icon: '🤖' },
  { step: '03', title: 'Compare local providers', desc: 'Browse verified local professionals ranked by rating, price, and availability.', icon: '🔍' },
  { step: '04', title: 'Book in seconds', desc: 'Select your preferred time slot and confirm your booking instantly.', icon: '📅' },
  { step: '05', title: 'Service is completed', desc: 'The professional arrives, completes the job, and you get an invoice.', icon: '✅' },
  { step: '06', title: 'Pay & review', desc: 'Make a secure payment and share your experience to help others.', icon: '⭐' },
]

export default function HowItWorks() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="bg-primary-600 text-white py-16 text-center">
          <div className="page-container">
            <h1 className="text-4xl font-bold mb-3">How LocalPro Works</h1>
            <p className="text-primary-100 text-lg">Get quality local services in 6 easy steps</p>
          </div>
        </div>
        <div className="page-container py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.step} className="card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{s.icon}</span>
                  <span className="text-4xl font-extrabold text-primary-100">{s.step}</span>
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
