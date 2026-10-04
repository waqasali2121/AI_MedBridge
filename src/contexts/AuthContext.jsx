import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function initUser() {
      try {
        const current = await authService.getCurrentUser()
        setUser(current)
      } catch (err) {
        console.error('Failed to load user:', err)
      } finally {
        setLoading(false)
      }
    }
    initUser()
  }, [])

  const login = async (credentials) => {
    setLoading(true)
    try {
      const { user: loggedUser, error } = await authService.login(credentials)
      if (error) throw new Error(error)
      setUser(loggedUser)
      return loggedUser
    } finally {
      setLoading(false)
    }
  }

  const register = async (data) => {
    setLoading(true)
    try {
      const { user: newUser, error } = await authService.register(data)
      if (error) throw new Error(error)
      setUser(newUser)
      return newUser
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await authService.logout()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const switchRole = async (targetRole) => {
    setLoading(true)
    try {
      const switched = await authService.switchDemoRole(targetRole)
      setUser(switched)
      return switched
    } finally {
      setLoading(false)
    }
  }

  const getRoleDashboardRoute = (role) => {
    switch (role) {
      case 'patient': return '/patient/dashboard'
      case 'doctor': return '/doctor/dashboard'
      case 'pharmacist': return '/pharmacist/dashboard'
      case 'pharmacy_operator': return '/pharmacy/dashboard'
      case 'admin': return '/admin'
      default: return '/'
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      role: user?.role || null,
      loading,
      login,
      register,
      logout,
      switchRole,
      getRoleDashboardRoute
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
