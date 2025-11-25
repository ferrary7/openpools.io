'use client'

import { useState, useEffect, useRef } from 'react'

export default function DNAConstellation({ keywords = [] }) {
  const [mounted, setMounted] = useState(false)
  const [hoveredKeyword, setHoveredKeyword] = useState(null)
  const containerRef = useRef(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Generate positions for keywords in a constellation pattern
  const keywordPositions = keywords.map((keyword, index) => {
    // Create spiral galaxy pattern
    const angle = index * 137.5 * (Math.PI / 180) // Golden angle
    const radius = Math.sqrt(index) * 25
    const x = 50 + Math.cos(angle) * radius
    const y = 50 + Math.sin(angle) * radius

    return {
      keyword,
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(5, Math.min(95, y)),
      size: Math.random() * 0.5 + 0.8,
      brightness: Math.random() * 0.4 + 0.6,
      index
    }
  })

  // Find connections between nearby keywords
  const connections = []
  keywordPositions.forEach((kw1, i) => {
    keywordPositions.slice(i + 1).forEach(kw2 => {
      const dx = kw1.x - kw2.x
      const dy = kw1.y - kw2.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 15) {
        connections.push({
          x1: kw1.x,
          y1: kw1.y,
          x2: kw2.x,
          y2: kw2.y,
          distance
        })
      }
    })
  })

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1E1E1E] via-[#1a1a2e] to-[#1E1E1E]"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* Section Title */}
        <div className={`text-center mb-20 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary-500 via-purple-500 to-primary-500 bg-clip-text text-transparent">
              Your Keyword Constellation
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            {keywords.length} unique professional markers forming your DNA signature
          </p>
        </div>

        {/* Constellation Visualization */}
        {keywords.length > 0 ? (
          <div
            ref={containerRef}
            className="relative w-full h-[700px] rounded-3xl overflow-hidden border border-white/10"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(232, 68, 153, 0.1) 0%, transparent 50%), linear-gradient(180deg, #0a0a0a 0%, #1a0a1a 100%)'
            }}
          >
            {/* SVG for connection lines */}
            <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
              {connections.map((conn, idx) => (
                <line
                  key={idx}
                  x1={`${conn.x1}%`}
                  y1={`${conn.y1}%`}
                  x2={`${conn.x2}%`}
                  y2={`${conn.y2}%`}
                  stroke="rgba(232, 68, 153, 0.2)"
                  strokeWidth="1"
                  className={`transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}
                  style={{ transitionDelay: `${idx * 5}ms` }}
                />
              ))}
            </svg>

            {/* Keywords as stars */}
            {keywordPositions.map((item, index) => {
              const isHovered = hoveredKeyword === index

              return (
                <div
                  key={index}
                  className={`absolute cursor-pointer group transition-all duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}
                  style={{
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                    transform: 'translate(-50%, -50%)',
                    transitionDelay: `${index * 20}ms`
                  }}
                  onMouseEnter={() => setHoveredKeyword(index)}
                  onMouseLeave={() => setHoveredKeyword(null)}
                >
                  {/* Star glow */}
                  <div
                    className={`absolute inset-0 rounded-full blur-xl transition-all duration-300 ${
                      isHovered ? 'scale-150' : 'scale-100'
                    }`}
                    style={{
                      width: `${30 * item.size}px`,
                      height: `${30 * item.size}px`,
                      background: `radial-gradient(circle, rgba(232, 68, 153, ${item.brightness * 0.8}) 0%, transparent 70%)`,
                      animation: `pulse ${2 + Math.random() * 2}s ease-in-out infinite`
                    }}
                  />

                  {/* Star core */}
                  <div
                    className={`relative rounded-full transition-all duration-300 ${
                      isHovered ? 'scale-125' : 'scale-100'
                    }`}
                    style={{
                      width: `${10 * item.size}px`,
                      height: `${10 * item.size}px`,
                      background: `radial-gradient(circle, rgba(255, 255, 255, ${item.brightness}) 0%, rgba(232, 68, 153, ${item.brightness * 0.8}) 100%)`,
                      boxShadow: `0 0 ${20 * item.size}px rgba(232, 68, 153, ${item.brightness})`
                    }}
                  />

                  {/* Keyword label */}
                  <div
                    className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-3 whitespace-nowrap transition-all duration-300 ${
                      isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
                    }`}
                  >
                    <div className="bg-black/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-primary-500/50 shadow-xl">
                      <p className="text-sm font-semibold text-primary-400">
                        {typeof item.keyword === 'string' ? item.keyword : (item.keyword.keyword || item.keyword.name || '')}
                      </p>
                      {typeof item.keyword === 'object' && item.keyword.category && (
                        <p className="text-xs text-gray-500">{item.keyword.category}</p>
                      )}
                    </div>
                  </div>

                  {/* Sparkle effect on hover */}
                  {isHovered && (
                    <>
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1 h-1 bg-white rounded-full animate-ping"
                          style={{
                            top: `${Math.cos(i * Math.PI / 2) * 20}px`,
                            left: `${Math.sin(i * Math.PI / 2) * 20}px`,
                            animationDelay: `${i * 100}ms`
                          }}
                        />
                      ))}
                    </>
                  )}
                </div>
              )
            })}

            {/* Center label */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-purple-500 blur-3xl opacity-30"></div>
                <div className="relative bg-black/60 backdrop-blur-xl px-8 py-6 rounded-2xl border border-white/20">
                  <div className="text-sm text-gray-400 mb-1">Professional Identity</div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                    {keywords.length} Markers
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-gray-500 text-lg">No keywords yet. Add keywords to see your constellation!</div>
          </div>
        )}

        {/* Legend */}
        {keywords.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Hover over any star to reveal the skill • Brighter stars indicate stronger markers
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
        }
      `}</style>
    </section>
  )
}
