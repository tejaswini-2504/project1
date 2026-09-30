import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import ProviderCard from '../../components/ProviderCard'
import Loading from '../../components/Loading'
import providerService from '../../services/providerService'

export default function SearchProviders() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [providers, setProviders] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    service_name: searchParams.get('service_name') || '',
    search: searchParams.get('search') || '',
  })

  useEffect(() => {
    providerService.getCategories().then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    providerService.getProviders(filters)
      .then(data => setProviders(Array.isArray(data) ? data : data.providers || []))
      .catch(() => setProviders([]))
      .finally(() => setLoading(false))
  }, [filters])

  const handleFilter = (key, value) => {
    const next = { ...filters, [key]: value }
    setFilters(next)
    setSearchParams(Object.fromEntries(Object.entries(next).filter(([, v]) => v)))
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-10">
          <div className="page-container">
            <h1 className="text-2xl font-bold mb-4">Find Local Providers</h1>
            <input
              type="text"
              placeholder="Search by name or service..."
              value={filters.search}
              onChange={e => handleFilter('search', e.target.value)}
              className="w-full max-w-lg px-4 py-2.5 rounded-xl text-gray-900 text-sm outline-none"
            />
          </div>
        </div>
        <div className="page-container py-8">
          <div className="flex gap-8">
            {/* Filters */}
            <div className="hidden md:block w-56 flex-shrink-0">
              <div className="card p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Category</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => handleFilter('category', '')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${!filters.category ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    All Categories
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleFilter('category', cat.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm ${filters.category == cat.id ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* Results */}
            <div className="flex-1">
              {loading ? <Loading /> : providers.length === 0 ? (
                <div className="card p-12 text-center text-gray-400">
                  <div className="text-5xl mb-4">🔍</div>
                  <p className="font-medium text-lg">No providers found</p>
                  <p className="text-sm mt-1">Try adjusting your filters</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-500 mb-4">{providers.length} provider(s) found</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {providers.map(p => <ProviderCard key={p.id} provider={p} />)}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
