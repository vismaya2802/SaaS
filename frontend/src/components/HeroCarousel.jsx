// components/HeroCarousel.jsx — Auto-advancing hero banner
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const SLIDES = [
  {
    id: 1,
    title: 'See the World in Style',
    subtitle: 'Premium eyewear with AI-powered virtual try-on',
    cta: 'Shop Now',
    gradient: 'from-brand-900 via-brand-700 to-accent-500',
    query: '?collection_type=trending',
  },
  {
    id: 2,
    title: 'New Summer Collection',
    subtitle: 'Discover sunglasses that turn heads',
    cta: 'Explore Collection',
    gradient: 'from-purple-900 via-brand-700 to-orange-500',
    query: '?collection_type=new_arrival&category=sunglasses',
  },
  {
    id: 3,
    title: 'Try Before You Buy',
    subtitle: 'Our AR try-on puts glasses on your face in seconds',
    cta: 'Try AR Now',
    gradient: 'from-teal-900 via-brand-700 to-accent-500',
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
    <div className="relative overflow-hidden rounded-3xl mx-4 mt-6 h-72 md:h-96">
      {/* Background gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} transition-all duration-1000`}
      />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-10 md:px-16 max-w-2xl">
        <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-3">
          {slide.title}
        </h1>
        <p className="text-gray-200 text-base md:text-lg mb-6">{slide.subtitle}</p>
        <button
          id={`hero-cta-${slide.id}`}
          onClick={() => navigate(`/${slide.query}`)}
          className="btn-primary w-fit"
        >
          {slide.cta} →
        </button>
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === current ? 'w-6 bg-white' : 'bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
