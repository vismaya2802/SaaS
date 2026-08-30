// pages/Checkout.jsx — Multi-step checkout flow
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import api from '../hooks/useAPI'

const PAYMENT_METHODS = [
  { value: 'upi',        label: '📱 UPI',        desc: 'Google Pay, PhonePe, Paytm' },
  { value: 'card',       label: '💳 Card',        desc: 'Credit / Debit card' },
  { value: 'netbanking', label: '🏦 Net Banking', desc: 'All major banks' },
  { value: 'cod',        label: '📦 COD',         desc: 'Cash on delivery' },
]

export default function Checkout() {
  const navigate        = useNavigate()
  const items           = useCartStore((s) => s.items)
  const clearCart       = useCartStore((s) => s.clearCart)
  const { isLoggedIn, user, setShowOTPModal } = useAuth()

  const [step, setStep]                 = useState(1) // 1=review 2=promo 3=payment 4=success
  const [promoCode, setPromoCode]       = useState('')
  const [promoResult, setPromoResult]   = useState(null)
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoError, setPromoError]     = useState(null)
  const [payMethod, setPayMethod]       = useState('upi')
  const [paying, setPaying]             = useState(false)
  const [confirmedOrder, setConfirmedOrder] = useState(null)

  const subtotal     = items.reduce((a, i) => a + i.price * i.quantity, 0)
  const discount     = promoResult?.discount_amount ?? 0
  const finalAmount  = promoResult?.final_amount ?? subtotal

  // ── Redirect if cart empty ───────────────────────────────────────
  if (!items.length && step !== 4) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-4xl">🛒</p>
        <p className="text-gray-400">Your cart is empty.</p>
        <button onClick={() => navigate('/')} className="btn-primary">Browse Products</button>
      </div>
    )
  }

  // ── Promo validation ─────────────────────────────────────────────
  async function applyPromo() {
    setPromoLoading(true)
    setPromoError(null)
    try {
      const { data } = await api.post('/promos/validate', {
        code: promoCode,
        cart_amount: subtotal,
      })
      setPromoResult(data)
    } catch (err) {
      setPromoError(err.response?.data?.detail ?? 'Invalid promo code')
      setPromoResult(null)
    } finally {
      setPromoLoading(false)
    }
  }

  // ── Payment flow (mock) ──────────────────────────────────────────
  async function handlePay() {
    if (!isLoggedIn) { setShowOTPModal(true); return }
    setPaying(true)
    try {
      // Step 1: Create order
      const { data: order } = await api.post('/payment/create-order', {
        user_id: user.userId,
        cart_amount: subtotal,
        promo_code: promoResult ? promoCode : null,
        payment_method: payMethod,
      })

      // Step 2: Mock verify (simulate Razorpay callback)
      const { data: verified } = await api.post('/payment/verify', {
        order_id: order.order_id,
        razorpay_payment_id: `pay_MOCK${Date.now()}`,
        razorpay_signature: `sig_MOCK${Date.now()}`,
      })

      setConfirmedOrder({ ...order, ...verified })
      clearCart()
      setStep(4)
    } catch (err) {
      alert('Payment failed. Please try again.')
    } finally {
      setPaying(false)
    }
  }

  // ── Success screen ───────────────────────────────────────────────
  if (step === 4 && confirmedOrder) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 page-enter">
        <div className="glass-card p-10 max-w-md w-full text-center space-y-4">
          <div className="text-6xl">🎉</div>
          <h1 className="text-3xl font-extrabold text-white">Order Confirmed!</h1>
          <p className="text-gray-400">Your glasses are on their way.</p>
          <div className="bg-brand-900/40 border border-brand-500/30 rounded-xl p-4">
            <p className="text-sm text-gray-400">Order ID</p>
            <p id="confirmed-order-id" className="text-xl font-mono font-bold text-brand-400">
              {confirmedOrder.order_id}
            </p>
          </div>
          <p className="text-sm text-gray-400">Amount Paid: <strong className="text-white">₹{confirmedOrder.amount?.toLocaleString()}</strong></p>
          <button onClick={() => navigate('/')} className="btn-primary w-full">Continue Shopping</button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen page-enter">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <h1 className="text-3xl font-extrabold text-white">Checkout</h1>

        {/* ── Step 1: Order summary ── */}
        <section className="glass-card p-6 space-y-3">
          <h2 className="font-bold text-white mb-4">Order Summary</h2>
          {items.map((item) => (
            <div key={`${item.productId}-${item.lensType}`}
              className="flex items-center justify-between text-sm">
              <div>
                <p className="text-white font-medium">{item.title}</p>
                <p className="text-gray-400 capitalize text-xs">{item.lensType.replace('_', ' ')} × {item.quantity}</p>
              </div>
              <p className="text-brand-400 font-semibold">₹{(item.price * item.quantity).toLocaleString()}</p>
            </div>
          ))}
        </section>

        {/* ── Step 2: Promo ── */}
        <section className="glass-card p-6 space-y-3">
          <h2 className="font-bold text-white">Promo Code</h2>
          <div className="flex gap-2">
            <input
              id="promo-input"
              type="text"
              placeholder="Enter promo code"
              className="input-field"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            />
            <button
              id="promo-apply-btn"
              onClick={applyPromo}
              disabled={!promoCode || promoLoading}
              className="btn-primary whitespace-nowrap"
            >
              {promoLoading ? '…' : 'Apply'}
            </button>
          </div>
          {promoError  && <p className="text-red-400 text-xs">{promoError}</p>}
          {promoResult && <p className="text-green-400 text-xs font-medium">{promoResult.message}</p>}
        </section>

        {/* ── Step 3: Payment ── */}
        <section className="glass-card p-6 space-y-4">
          <h2 className="font-bold text-white">Payment Method</h2>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((pm) => (
              <button
                key={pm.value}
                id={`pay-method-${pm.value}`}
                onClick={() => setPayMethod(pm.value)}
                className={`p-3 rounded-xl text-left border transition-all ${
                  payMethod === pm.value
                    ? 'border-brand-500 bg-brand-600/20'
                    : 'border-white/10 bg-white/5 hover:border-white/30'
                }`}
              >
                <p className="text-sm font-semibold text-white">{pm.label}</p>
                <p className="text-xs text-gray-400">{pm.desc}</p>
              </button>
            ))}
          </div>
        </section>

        {/* ── Order total ── */}
        <section className="glass-card p-6 space-y-2">
          <div className="flex justify-between text-sm text-gray-300">
            <span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-400">
              <span>Promo Discount</span><span>−₹{discount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-xl font-bold text-white border-t border-white/10 pt-2 mt-2">
            <span>Total</span><span className="text-brand-400">₹{finalAmount.toLocaleString()}</span>
          </div>
        </section>

        {/* ── Pay button ── */}
        <button
          id="pay-now-btn"
          onClick={handlePay}
          disabled={paying}
          className="btn-primary w-full text-lg py-4"
        >
          {paying ? '⏳ Processing…' : `Pay ₹${finalAmount.toLocaleString()} →`}
        </button>
      </div>
    </main>
  )
}
