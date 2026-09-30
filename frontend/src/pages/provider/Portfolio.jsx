import React from 'react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

export default function Portfolio() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 page-container py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Portfolio</h1>
        <div className="card p-10 text-center text-gray-400">
          <div className="text-5xl mb-4">🖼️</div>
          <p>Portfolio image upload coming soon.</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
