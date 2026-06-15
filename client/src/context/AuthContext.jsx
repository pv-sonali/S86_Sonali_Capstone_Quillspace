/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react'
import api from '../services/api'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user')
      return savedUser && savedUser !== 'undefined' ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })
  // Track if initial auth check is done (#24 — prevents stale isLoggedIn)
  const [isAuthChecked, setIsAuthChecked] = useState(false)

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // Validate token and sync latest user data
      api.get('/auth/me')
        .then((res) => {
          if (res.data?.data?.user) {
            const u = res.data.data.user
            setUser(u)
            localStorage.setItem('user', JSON.stringify(u))
          }
        })
        .catch(() => {
          // Token is invalid/expired — log out
          logout()
        })
        .finally(() => {
          setIsAuthChecked(true)
        })
    } else {
      delete api.defaults.headers.common['Authorization']
      setIsAuthChecked(true)
    }
  }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (credentials) => {
    const res = await api.post('/auth/login', credentials)
    const t = res.data.data.token
    const u = res.data.data.user

    localStorage.setItem('token', t)
    localStorage.setItem('user', JSON.stringify(u))

    setToken(t)
    setUser(u)
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`
    return res.data
  }

  const register = async (payload) => {
    const res = await api.post('/auth/register', payload)
    const t = res.data.data.token
    const u = res.data.data.user

    localStorage.setItem('token', t)
    localStorage.setItem('user', JSON.stringify(u))

    setToken(t)
    setUser(u)
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`
    return res.data
  }

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
  }, [])

  // isLoggedIn is only true after auth check AND token is valid (#24)
  const isLoggedIn = isAuthChecked ? !!token : false

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      register,
      logout,
      updateUser,
      isLoggedIn,
      isAuthChecked,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// Convenience hook — single source of truth (#25 — replaces useAuth.js)
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
