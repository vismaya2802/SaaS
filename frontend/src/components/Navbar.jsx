// components/Navbar.jsx — Luxury themed navigation bar
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCartStore } from '../context/CartContext'
import CartDrawer from './CartDrawer'

export default function Navbar() {
  const { isLoggedIn, user, logout, setShowOTPModal } = useAuth()
  const items = useCartStore((s) => s.items)
  const cartCount = items.reduce((a, i) => a + i.quantity, 0)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <>
      <nav className="sticky top-0 z-50 glass-card rounded-none border-x-0 border-t-0 px-6 py-4 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-400 via-gold-500 to-gold-600 flex items-center justify-center text-charcoal-950 font-bold text-lg shadow-lg shadow-gold-500/30">
              VF
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 bg-clip-text text-transparent">
                VisionFrame
              </span>
              <span className="text-xs text-gold-600 font-medium -mt-1">Luxury Eyewear</span>
            </div>
          </Link>

          {/* ── Nav links ── */}
          <div className="hidden md:flex items-center gap-8">
            {['Eyeglasses', 'Sunglasses', 'Lenses'].map((cat) => (
              <Link
                key={cat}
                to={`/?category=${cat.toLowerCase()}`}
                className="text-gray-300 hover:text-gold-400 text-sm font-medium transition-colors duration-200 border-b-2 border-transparent hover:border-gold-500"
              >
                {cat}
              </Link>
            ))}
          </div>

          {/* ── Actions ── */}
          <div className="flex items-center gap-3">
            {/* Cart button */}
            <button
              id="cart-toggle-btn"
              onClick={() => setDrawerOpen(true)}
              className="relative p-2 rounded-xl hover:bg-gold-500/10 border border-transparent hover:border-gold-500/30 transition-all duration-200"
              aria-label="Open cart"
            >
              <svg className="w-6 h-6 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m5-9v9m4-9v9m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-gold-500 to-gold-600 text-charcoal-950 text-xs flex items-center justify-center font-bold shadow-lg">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Auth button */}
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gold-500 hidden sm:block font-medium">
                  {user.identifier.slice(0, 12)}…
                </span>
                <button
                  id="logout-btn"
                  onClick={logout}
                  className="btn-ghost text-sm px-4 py-2"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                id="login-btn"
                onClick={() => setShowOTPModal(true)}
                className="btn-primary text-sm px-5 py-2"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}
