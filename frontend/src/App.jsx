// src/App.jsx — Root application with routing and global providers
import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Navbar from './components/Navbar'
import { AuthProvider } from './context/AuthContext'
import OTPModal from './components/OTPModal'

// ── Lazy-loaded pages for code-splitting ──────────────────────────
const Home         = lazy(() => import('./pages/Home'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Checkout     = lazy(() => import('./pages/Checkout'))

// ── Page loading fallback ─────────────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
        <p className="text-gray-400 text-sm">Loading…</p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* ── Global navigation ── */}
        <Navbar />

        {/* ── OTP login modal (shown globally when auth required) ── */}
        <OTPModal />

        {/* ── Page routes ── */}
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Home / product catalogue */}
            <Route path="/" element={<Home />} />

            {/* Product detail + AR try-on */}
            <Route path="/product/:productId" element={<ProductDetail />} />

            {/* Checkout flow */}
            <Route path="/checkout" element={<Checkout />} />

            {/* Catch-all → redirect home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}
