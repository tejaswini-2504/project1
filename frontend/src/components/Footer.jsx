import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-violet-950 to-indigo-950 text-white overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-violet-600/20 blob blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-600/20 blob blur-3xl translate-x-1/4 translate-y-1/4" />

      <div className="relative page-container pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 grad-primary rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/40">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-2xl font-extrabold text-white">LocalPro</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              AI-powered platform connecting customers with trusted local professionals. Fast, reliable, and affordable.
            </p>
            {/* Social icons */}
            <div className="flex gap-3 mt-5">
              {['📘','🐦','📸','▶️'].map((icon, i) => (
                <button key={i} className="w-9 h-9 bg-white/10 hover:bg-violet-600 rounded-xl flex items-center justify-center text-sm transition-colors duration-200">
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Platform links */}
          <div>
            <h4 className="font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-5 grad-primary rounded-full inline-block"></span>
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { to: '/services', label: 'Browse Services' },
                { to: '/how-it-works', label: 'How It Works' },
                { to: '/register', label: 'Join as Provider' },
                { to: '/about', label: 'About Us' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-slate-400 hover:text-violet-400 transition-colors flex items-center gap-2">
                    <span className="text-violet-500">›</span>{link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-gradient-to-b from-pink-500 to-orange-500 rounded-full inline-block"></span>
              Support
            </h4>
            <ul className="space-y-2.5 text-sm">
              {['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'].map(item => (
                <li key={item}>
                  <a href="#" className="text-slate-400 hover:text-pink-400 transition-colors flex items-center gap-2">
                    <span className="text-pink-500">›</span>{item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 bg-white/5 rounded-3xl p-6 mb-10 border border-white/10">
          {[
            { value: '500+', label: 'Providers', icon: '🔧' },
            { value: '10K+', label: 'Customers', icon: '😊' },
            { value: '40+', label: 'Services', icon: '⚡' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-extrabold text-white">{s.value}</div>
              <div className="text-xs text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-slate-500">© 2026 LocalPro. All rights reserved.</p>
          <p className="text-sm text-slate-500">Made with <span className="text-pink-500">❤️</span> for local communities</p>
        </div>
      </div>
    </footer>
  )
}
