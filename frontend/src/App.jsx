import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Public pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import About from './pages/About'
import HowItWorks from './pages/HowItWorks'
import Services from './pages/Services'

// Customer pages
import CustomerDashboard from './pages/customer/CustomerDashboard'
import AIAssistant from './pages/customer/AIAssistant'
import SearchProviders from './pages/customer/SearchProviders'
import ProviderProfile from './pages/customer/ProviderProfile'
import Booking from './pages/customer/Booking'
import MyBookings from './pages/customer/MyBookings'
import Payments from './pages/customer/Payments'
import Reviews from './pages/customer/Reviews'
import CustomerProfile from './pages/customer/Profile'

// Provider pages
import ProviderDashboard from './pages/provider/ProviderDashboard'
import ProviderProfilePage from './pages/provider/ProviderProfile'
import Jobs from './pages/provider/Jobs'
import Calendar from './pages/provider/Calendar'
import Customers from './pages/provider/Customers'
import Earnings from './pages/provider/Earnings'
import ProviderServices from './pages/provider/Services'
import Portfolio from './pages/provider/Portfolio'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/Users'
import AdminProviders from './pages/admin/Providers'
import AdminBookings from './pages/admin/Bookings'
import AdminPayments from './pages/admin/Payments'
import AdminComplaints from './pages/admin/Complaints'
import Analytics from './pages/admin/Analytics'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/services" element={<Services />} />

        {/* Customer routes */}
        <Route path="/customer/dashboard" element={<ProtectedRoute roles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
        <Route path="/customer/ai-assistant" element={<ProtectedRoute roles={['customer']}><AIAssistant /></ProtectedRoute>} />
        <Route path="/customer/search" element={<ProtectedRoute roles={['customer']}><SearchProviders /></ProtectedRoute>} />
        <Route path="/customer/provider/:id" element={<ProtectedRoute roles={['customer']}><ProviderProfile /></ProtectedRoute>} />
        <Route path="/customer/booking/:providerId" element={<ProtectedRoute roles={['customer']}><Booking /></ProtectedRoute>} />
        <Route path="/customer/bookings" element={<ProtectedRoute roles={['customer']}><MyBookings /></ProtectedRoute>} />
        <Route path="/customer/bookings/:id" element={<ProtectedRoute roles={['customer']}><MyBookings /></ProtectedRoute>} />
        <Route path="/customer/payments" element={<ProtectedRoute roles={['customer']}><Payments /></ProtectedRoute>} />
        <Route path="/customer/reviews" element={<ProtectedRoute roles={['customer']}><Reviews /></ProtectedRoute>} />
        <Route path="/customer/profile" element={<ProtectedRoute roles={['customer']}><CustomerProfile /></ProtectedRoute>} />

        {/* Provider routes */}
        <Route path="/provider/dashboard" element={<ProtectedRoute roles={['provider']}><ProviderDashboard /></ProtectedRoute>} />
        <Route path="/provider/profile" element={<ProtectedRoute roles={['provider']}><ProviderProfilePage /></ProtectedRoute>} />
        <Route path="/provider/jobs" element={<ProtectedRoute roles={['provider']}><Jobs /></ProtectedRoute>} />
        <Route path="/provider/calendar" element={<ProtectedRoute roles={['provider']}><Calendar /></ProtectedRoute>} />
        <Route path="/provider/customers" element={<ProtectedRoute roles={['provider']}><Customers /></ProtectedRoute>} />
        <Route path="/provider/earnings" element={<ProtectedRoute roles={['provider']}><Earnings /></ProtectedRoute>} />
        <Route path="/provider/services" element={<ProtectedRoute roles={['provider']}><ProviderServices /></ProtectedRoute>} />
        <Route path="/provider/portfolio" element={<ProtectedRoute roles={['provider']}><Portfolio /></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/providers" element={<ProtectedRoute roles={['admin']}><AdminProviders /></ProtectedRoute>} />
        <Route path="/admin/bookings" element={<ProtectedRoute roles={['admin']}><AdminBookings /></ProtectedRoute>} />
        <Route path="/admin/payments" element={<ProtectedRoute roles={['admin']}><AdminPayments /></ProtectedRoute>} />
        <Route path="/admin/complaints" element={<ProtectedRoute roles={['admin']}><AdminComplaints /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute roles={['admin']}><Analytics /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
