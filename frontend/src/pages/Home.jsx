// pages/Home.jsx — Homepage with hero carousel and product catalogue
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
      <section className="px-4 py-6 max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Category pills */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => {
              const val = cat === 'All' ? '' : cat.toLowerCase()
              return (
                <button
                  key={cat}
                  id={`filter-cat-${cat.toLowerCase()}`}
                  onClick={() => setFilter('category', val)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                    activeCategory === val
                      ? 'bg-brand-600 border-brand-500 text-white'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:border-brand-500'
                  }`}
                >
                  {cat}
                </button>
              )
            })}
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-white/10 hidden sm:block" />

          {/* Shape pills */}
          <div className="flex gap-2 flex-wrap">
            {SHAPES.map((shape) => {
              const val = shape === 'All Shapes' ? '' : shape.toLowerCase()
              return (
                <button
                  key={shape}
                  id={`filter-shape-${shape.toLowerCase().replace(' ', '-')}`}
                  onClick={() => setFilter('shape', val)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                    activeShape === val
                      ? 'bg-accent-500 border-accent-400 text-white'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-accent-400'
                  }`}
                >
                  {shape}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Product grid ── */}
        <ProductGrid />
      </section>
    </main>
  )
}
