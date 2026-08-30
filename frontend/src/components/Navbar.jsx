// components/Navbar.jsx — Top navigation bar
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
      <nav className="sticky top-0 z-50 glass-card rounded-none border-x-0 border-t-0 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
              LK
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">
              Lenskart
            </span>
            <span className="text-xs text-gray-400 font-medium mt-1">v3.0</span>
          </Link>

          {/* ── Nav links ── */}
          <div className="hidden md:flex items-center gap-8">
            {['Eyeglasses', 'Sunglasses', 'Lenses'].map((cat) => (
              <Link
                key={cat}
                to={`/?category=${cat.toLowerCase()}`}
                className="text-gray-300 hover:text-white text-sm font-medium transition-colors duration-200"
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
              className="relative p-2 rounded-xl hover:bg-white/10 transition-colors"
              aria-label="Open cart"
            >
              <svg className="w-6 h-6 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m5-9v9m4-9v9m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent-500 text-white text-xs flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Auth button */}
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-300 hidden sm:block">
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
                className="btn-primary text-sm px-4 py-2"
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
