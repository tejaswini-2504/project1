import React from 'react'
import { Link } from 'react-router-dom'
import Rating from './Rating'

const GRAD_COLORS = [
  'from-violet-500 to-indigo-600',
  'from-pink-500 to-rose-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-amber-600',
  'from-cyan-500 to-blue-600',
  'from-fuchsia-500 to-purple-600',
]

export default function ProviderCard({ provider, index = 0 }) {
  if (!provider) return null
  const grad = GRAD_COLORS[index % GRAD_COLORS.length]

  return (
    <Link to={`/customer/provider/${provider.id}`} className="card-hover block group">
      {/* Colorful top strip */}
      <div className={`h-2 bg-gradient-to-r ${grad}`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-14 h-14 bg-gradient-to-br ${grad} rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0`}>
            {provider.business_name?.[0]?.toUpperCase() || provider.user_name?.[0]?.toUpperCase() || 'P'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-bold text-gray-900 truncate">{provider.business_name || provider.user_name}</h3>
              {provider.is_verified && (
                <span className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0" title="Verified">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 truncate mt-0.5">{provider.tagline || provider.primary_service}</p>
          </div>
        </div>

        {/* Rating */}
        <Rating value={provider.average_rating || 0} count={provider.total_reviews || 0} size="sm" />

        {/* Chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          {provider.experience_years > 0 && (
            <span className="badge-info text-xs">⏰ {provider.experience_years}y exp</span>
          )}
          {provider.service_area && (
            <span className="badge-gray text-xs">📍 {provider.service_area.split(',')[0]}</span>
          )}
          {provider.hourly_rate && (
            <span className="badge-success text-xs">₹{provider.hourly_rate}/hr</span>
          )}
        </div>
      </div>

      <div className={`bg-gradient-to-r ${grad} px-5 py-3 flex items-center justify-between`}>
        <span className="text-white text-sm font-semibold">View Profile</span>
        <svg className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}
