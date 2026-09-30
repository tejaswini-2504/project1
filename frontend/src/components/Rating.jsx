import React from 'react'

export default function Rating({ value = 0, max = 5, size = 'md', showValue = true, count = null }) {
  const sizes = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' }
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }, (_, i) => (
          <svg key={i} className={`${sizes[size]} ${i < Math.floor(value) ? 'text-amber-400' : i < value ? 'text-amber-300' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-bold text-gray-800">
          {value.toFixed(1)}
          {count !== null && <span className="text-gray-400 font-normal text-xs"> ({count})</span>}
        </span>
      )}
    </div>
  )
}
