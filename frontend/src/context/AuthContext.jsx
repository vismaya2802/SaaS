// context/AuthContext.jsx — JWT auth context + OTP modal state
import React, { createContext, useContext, useState, useCallback } from 'react'
import api from '../hooks/useAPI'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Hydrate from localStorage on boot
    const stored = localStorage.getItem('vf_user')
    return stored ? JSON.parse(stored) : null
  })
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // ── Request OTP ─────────────────────────────────────────────────
  const requestOTP = useCallback(async (identifier) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/auth/otp', { identifier })
      return data // { message, mock_otp }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send OTP')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Verify OTP & login ───────────────────────────────────────────
  const verifyOTP = useCallback(async (identifier, otp) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/auth/verify', { identifier, otp })
      // data: { access_token, token_type, user_id }
      const userData = { token: data.access_token, userId: data.user_id, identifier }
      localStorage.setItem('vf_user', JSON.stringify(userData))
      localStorage.setItem('vf_token', data.access_token)
      setUser(userData)
      setShowOTPModal(false)
      return userData
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid OTP')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Logout ───────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('vf_user')
    localStorage.removeItem('vf_token')
    setUser(null)
  }, [])

  const value = {
    user,
    isLoggedIn: !!user,
    loading,
    error,
    showOTPModal,
    setShowOTPModal,
    requestOTP,
    verifyOTP,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ── Hook ──────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}

