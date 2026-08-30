// pages/Home.jsx — Homepage with luxury styling
import React from 'react'
import HeroCarousel from '../components/HeroCarousel'
import ProductGrid  from '../components/ProductGrid'
import { useSearchParams } from 'react-router-dom'

const CATEGORIES = ['All', 'Eyeglasses', 'Sunglasses', 'Lenses']
const SHAPES     = ['All Shapes', 'Round', 'Rectangle', 'Cat-Eye', 'Aviator']

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = searchParams.get('category') ?? ''
  const activeShape    = searchParams.get('shape') ?? ''

  function setFilter(key, value) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  return (
    <main className="min-h-screen page-enter">
      {/* ── Hero ── */}
      <HeroCarousel />

      {/* ── Filter bar ── */}
      <section className="px-4 py-8 max-w-7xl mx-auto">
        <div className="glass-card p-6 mb-8">
          <h2 className="text-sm font-semibold text-gold-400 tracking-widest uppercase mb-4">
            Filter by Category & Style
          </h2>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Category pills */}
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((cat) => {
                const val = cat === 'All' ? '' : cat.toLowerCase()
                return (
                  <button
                    key={cat}
                    id={`filter-cat-${cat.toLowerCase()}`}
                    onClick={() => setFilter('category', val)}
                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 border ${
                      activeCategory === val
                        ? 'bg-gradient-to-r from-gold-400 to-gold-600 border-gold-500 text-charcoal-950 shadow-lg shadow-gold-500/30'
                        : 'bg-charcoal-900/50 border-gold-500/20 text-gray-300 hover:border-gold-500/50 hover:text-gold-400'
                    }`}
                  >
                    {cat}
                  </button>
                )
              })}
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-gold-500/20 hidden sm:block" />

            {/* Shape pills */}
            <div className="flex gap-2 flex-wrap">
              {SHAPES.map((shape) => {
                const val = shape === 'All Shapes' ? '' : shape.toLowerCase()
                return (
                  <button
                    key={shape}
                    id={`filter-shape-${shape.toLowerCase().replace(' ', '-')}`}
                    onClick={() => setFilter('shape', val)}
                    className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 border ${
                      activeShape === val
                        ? 'bg-luxury-600 border-luxury-500 text-white shadow-md shadow-luxury-500/30'
                        : 'bg-charcoal-900/30 border-luxury-500/20 text-gray-400 hover:border-luxury-500/50 hover:text-luxury-400'
                    }`}
                  >
                    {shape}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Product grid ── */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">
              Our Collection
            </h2>
            <span className="text-sm text-gray-400">
              Handcrafted Premium Eyewear
            </span>
          </div>
          <ProductGrid />
        </div>
      </section>
    </main>
  )
}
