import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ServiceCard from '../components/ServiceCard'
import Loading from '../components/Loading'
import providerService from '../services/providerService'

export default function Services() {
  const [categories, setCategories] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([providerService.getCategories(), providerService.getServices()])
      .then(([cats, svcs]) => {
        setCategories(cats)
        setServices(svcs)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = services.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-12">
          <div className="page-container text-center">
            <h1 className="text-3xl font-bold mb-3">All Services</h1>
            <p className="text-primary-100 mb-6">Find the right service for any need</p>
            <input
              type="text"
              placeholder="Search services..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full max-w-md px-5 py-3 rounded-xl text-gray-900 text-sm outline-none shadow-sm"
            />
          </div>
        </div>
        <div className="page-container py-10">
          {loading ? <Loading /> : (
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-6">Categories</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-10">
                {categories.map(cat => (
                  <ServiceCard
                    key={cat.id}
                    category={cat}
                    serviceCount={services.filter(s => s.category_id === cat.id).length}
                    onClick={() => navigate(`/customer/search?category=${cat.id}`)}
                  />
                ))}
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                {search ? `Results for "${search}"` : 'All Services'}
              </h2>
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-gray-400">No services found.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map(svc => (
                    <button
                      key={svc.id}
                      onClick={() => navigate(`/customer/search?service=${svc.id}`)}
                      className="card-hover p-4 flex items-center gap-3 text-left"
                    >
                      <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                        ⚙️
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{svc.name}</p>
                        <p className="text-xs text-gray-500">{svc.category_name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
