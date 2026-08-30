// components/OTPModal.jsx — Global OTP login modal
import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function OTPModal() {
  const { showOTPModal, setShowOTPModal, requestOTP, verifyOTP, loading, error } = useAuth()
  const [step, setStep]             = useState('input') // 'input' | 'verify'
  const [identifier, setIdentifier] = useState('')
  const [otp, setOtp]               = useState('')
  const [mockOTP, setMockOTP]       = useState(null)   // dev helper

  if (!showOTPModal) return null

  async function handleRequestOTP(e) {
    e.preventDefault()
    try {
      const data = await requestOTP(identifier)
      setMockOTP(data.mock_otp)
      setStep('verify')
    } catch {}
  }

  async function handleVerify(e) {
    e.preventDefault()
    try {
      await verifyOTP(identifier, otp)
      setStep('input')
      setIdentifier('')
      setOtp('')
      setMockOTP(null)
    } catch {}
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => setShowOTPModal(false)} />

      {/* Modal */}
      <div id="otp-modal" className="relative glass-card p-8 w-full max-w-sm">
        <h2 className="text-2xl font-bold text-white mb-1">
          {step === 'input' ? 'Welcome Back' : 'Verify OTP'}
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          {step === 'input'
            ? 'Enter your mobile number or email to continue'
            : `OTP sent to ${identifier}`}
        </p>

        {/* ── Step 1: Identifier ── */}
        {step === 'input' && (
          <form onSubmit={handleRequestOTP} className="space-y-4">
            <input
              id="otp-identifier-input"
              type="text"
              placeholder="Mobile number or email"
              className="input-field"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button id="otp-send-btn" type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Sending…' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* ── Step 2: OTP entry ── */}
        {step === 'verify' && (
          <form onSubmit={handleVerify} className="space-y-4">
            {mockOTP && (
              <div className="bg-brand-900/50 border border-brand-500/30 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400 mb-1">🔐 Dev Mode — Mock OTP</p>
                <p className="text-2xl font-mono font-bold text-brand-400 tracking-widest">{mockOTP}</p>
              </div>
            )}
            <input
              id="otp-code-input"
              type="text"
              inputMode="numeric"
              placeholder="Enter 6-digit OTP"
              className="input-field text-center text-xl tracking-widest"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              required
            />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button id="otp-verify-btn" type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Verifying…' : 'Verify & Login'}
            </button>
            <button type="button" onClick={() => setStep('input')}
              className="btn-ghost w-full text-sm">← Change number</button>
          </form>
        )}
      </div>
    </div>
  )
}
