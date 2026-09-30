import React from 'react'

const CATEGORY_STYLES = {
  'Home Repair':    { icon: '🔧', grad: 'from-orange-400 to-red-500',    bg: 'bg-orange-50' },
  'Home Care':      { icon: '🏠', grad: 'from-blue-400 to-cyan-500',     bg: 'bg-blue-50' },
  'Care':           { icon: '👶', grad: 'from-pink-400 to-rose-500',     bg: 'bg-pink-50' },
  'Food':           { icon: '🍳', grad: 'from-yellow-400 to-orange-500', bg: 'bg-yellow-50' },
  'Personal Care':  { icon: '💇', grad: 'from-purple-400 to-pink-500',   bg: 'bg-purple-50' },
  'Vehicle':        { icon: '🚗', grad: 'from-slate-500 to-gray-700',    bg: 'bg-slate-50' },
  'Tech Repair':    { icon: '💻', grad: 'from-cyan-500 to-blue-600',     bg: 'bg-cyan-50' },
  'Appliance':      { icon: '🔌', grad: 'from-indigo-400 to-violet-600', bg: 'bg-indigo-50' },
  'Small Business': { icon: '🏪', grad: 'from-emerald-400 to-teal-600',  bg: 'bg-emerald-50' },
  'Learning':       { icon: '📚', grad: 'from-violet-400 to-indigo-600', bg: 'bg-violet-50' },
}

export default function ServiceCard({ category, serviceCount, onClick }) {
  const style = CATEGORY_STYLES[category?.name] || { icon: '⚙️', grad: 'from-gray-400 to-gray-600', bg: 'bg-gray-50' }

  return (
    <button onClick={onClick}
      className="group card-hover p-5 flex flex-col items-center text-center gap-3 w-full">
      <div className={`w-16 h-16 bg-gradient-to-br ${style.grad} rounded-3xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        {style.icon}
      </div>
      <div>
        <h3 className="font-bold text-gray-900 text-sm leading-tight">{category?.name}</h3>
        {serviceCount != null && (
          <p className="text-xs text-gray-400 mt-0.5">{serviceCount} services</p>
        )}
      </div>
    </button>
  )
}
