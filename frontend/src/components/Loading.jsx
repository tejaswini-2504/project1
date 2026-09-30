import React from 'react'

export default function Loading({ message = 'Loading...', fullPage = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-violet-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-violet-600 border-r-indigo-600 rounded-full animate-spin"></div>
        <div className="absolute inset-3 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full animate-pulse"></div>
      </div>
      {message && <p className="text-gray-500 text-sm font-semibold">{message}</p>}
    </div>
  )
  if (fullPage) return <div className="min-h-screen flex items-center justify-center bg-slate-50">{content}</div>
  return <div className="flex items-center justify-center py-20">{content}</div>
}
