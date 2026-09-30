import React, { createContext, useContext, useState, useEffect } from 'react'
import authService from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    const token = localStorage.getItem('access_token')
    if (stored && token) {
      try { setUser(JSON.parse(stored)) }
      catch {
        localStorage.removeItem('user')
        localStorage.removeItem('access_token')
      }
    }
    setLoading(false)
  }, [])

  // login: calls API, stores token + user, returns user
  const login = async (email, password) => {
    const data = await authService.login(email, password)
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  // register: registers then auto-logs in so user lands on dashboard
  const register = async (formData) => {
    await authService.register(formData)
    // auto login after register
    const data = await authService.login(formData.email, formData.password)
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const isCustomer = () => user?.role === 'customer'
  const isProvider = () => user?.role === 'provider'
  const isAdmin    = () => user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isCustomer, isProvider, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export default AuthContext
