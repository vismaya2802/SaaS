// components/HeroCarousel.jsx — Luxurious hero banner
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const SLIDES = [
  {
    id: 1,
    title: 'Luxury Eyewear Redefined',
    subtitle: 'Experience premium craftsmanship with advanced virtual try-on technology',
    cta: 'Explore Collection',
    gradient: 'from-charcoal-950 via-luxury-900 to-gold-900',
    query: '?collection_type=trending',
  },
  {
    id: 2,
    title: 'Exclusive Summer Collection',
    subtitle: 'Designer sunglasses crafted for the discerning eye',
    cta: 'Shop Now',
    gradient: 'from-luxury-950 via-luxury-800 to-gold-700',
    query: '?collection_type=new_arrival&category=sunglasses',
  },
  {
    id: 3,
    title: 'Try Before You Buy',
    subtitle: 'Cutting-edge AR technology brings luxury frames to life',
    cta: 'Try AR Experience',
    gradient: 'from-charcoal-950 via-charcoal-800 to-luxury-900',
    query: '/',
  },
]

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % SLIDES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const slide = SLIDES[current]

  return (
    <div className="relative overflow-hidden rounded-3xl mx-4 mt-6 h-80 md:h-96 border border-gold-500/20">
      {/* Background gradient with luxury styling */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} transition-all duration-1000`}
      />

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(234, 179, 8, 0.3) 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}
      />

      {/* Gold accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-10 md:px-16 max-w-3xl">
        <div className="inline-block mb-3">
          <span className="text-xs font-semibold text-gold-400 tracking-widest uppercase border border-gold-500/30 px-3 py-1 rounded-full bg-gold-500/10">
            Premium Collection
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-gold-200 to-gold-400 leading-tight mb-4">
          {slide.title}
        </h1>
        <p className="text-gray-300 text-base md:text-xl mb-8 max-w-xl">{slide.subtitle}</p>
        <button
          id={`hero-cta-${slide.id}`}
          onClick={() => navigate(`/${slide.query}`)}
          className="btn-primary w-fit text-base"
        >
          {slide.cta} →
        </button>
      </div>

      {/* Navigation dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current 
                ? 'w-8 bg-gradient-to-r from-gold-400 to-gold-600' 
                : 'w-2 bg-gold-500/30 hover:bg-gold-500/50'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
