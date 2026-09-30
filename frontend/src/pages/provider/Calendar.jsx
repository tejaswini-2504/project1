import React from 'react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

export default function Calendar() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 page-container py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Availability Calendar</h1>
        <div className="card p-10 text-center text-gray-400">
          <div className="text-5xl mb-4">📅</div>
          <p className="font-medium">Calendar management coming soon.</p>
          <p className="text-sm mt-1">Set your working hours and availability here.</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
