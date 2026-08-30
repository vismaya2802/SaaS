// components/CartDrawer.jsx — Slide-in cart sidebar
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../context/CartContext'

export default function CartDrawer({ open, onClose }) {
  const items        = useCartStore((s) => s.items)
  const removeItem   = useCartStore((s) => s.removeItem)
  const updateQty    = useCartStore((s) => s.updateQuantity)
  const clearCart    = useCartStore((s) => s.clearCart)
  const navigate     = useNavigate()

  const totalPrice = items.reduce((a, i) => a + i.price * i.quantity, 0)

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 z-50 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        id="cart-drawer"
        className={`fixed right-0 top-0 h-full w-80 md:w-96 z-50 glass-card rounded-none
                    border-r-0 border-t-0 border-b-0 flex flex-col 
                    transform transition-transform duration-300 ${
                      open ? 'translate-x-0' : 'translate-x-full'
                    }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">Your Cart</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors" aria-label="Close cart">
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">🛒</p>
              <p>Your cart is empty</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={`${item.productId}-${item.lensType}`}
                className="glass-card p-3 flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-brand-900/50 flex items-center justify-center text-xl flex-shrink-0">
                  🕶️
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{item.title}</p>
                  <p className="text-xs text-gray-400 capitalize">{item.lensType.replace('_', ' ')}</p>
                  <p className="text-sm font-bold text-brand-400">₹{(item.price * item.quantity).toLocaleString()}</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQty(item.productId, item.lensType, item.quantity - 1)}
                      className="w-6 h-6 rounded-md bg-white/10 hover:bg-white/20 text-white text-sm flex items-center justify-center"
                    >−</button>
                    <span className="text-white text-sm w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.productId, item.lensType, item.quantity + 1)}
                      className="w-6 h-6 rounded-md bg-white/10 hover:bg-white/20 text-white text-sm flex items-center justify-center"
                    >+</button>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId, item.lensType)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >Remove</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-white/10 space-y-3">
            <div className="flex justify-between text-sm text-gray-300">
              <span>Subtotal ({items.reduce((a, i) => a + i.quantity, 0)} items)</span>
              <span className="font-bold text-white">₹{totalPrice.toLocaleString()}</span>
            </div>
            <button
              id="checkout-btn"
              onClick={() => { onClose(); navigate('/checkout') }}
              className="btn-primary w-full text-center"
            >
              Proceed to Checkout
            </button>
            <button onClick={clearCart} className="btn-ghost w-full text-center text-sm">
              Clear Cart
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
