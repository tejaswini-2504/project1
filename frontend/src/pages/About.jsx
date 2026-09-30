import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 page-container py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="section-title mb-4">About LocalPro</h1>
          <p className="section-subtitle mb-8">
            We're on a mission to connect communities with trusted local professionals using the power of AI.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
            {[
              { label: 'Service Providers', value: '500+', icon: '🔧' },
              { label: 'Happy Customers', value: '10,000+', icon: '😊' },
              { label: 'Service Categories', value: '40+', icon: '📋' },
            ].map(stat => (
              <div key={stat.label} className="card p-6 text-center">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold text-primary-600 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
