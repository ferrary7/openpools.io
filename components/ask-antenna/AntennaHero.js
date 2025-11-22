'use client'

import { useState, useEffect, useRef, useMemo } from 'react'

// Curated list of meaningful tech/professional keywords
const FABRIC_KEYWORDS = [
  'Python', 'React', 'JavaScript', 'TypeScript', 'Node.js', 'AWS', 'Docker', 'Kubernetes',
  'ML', 'AI', 'Data', 'Analytics', 'Cloud', 'DevOps', 'API', 'SQL',
  'MongoDB', 'Redis', 'GraphQL', 'REST', 'Microservices', 'Serverless',
  'Frontend', 'Backend', 'Full Stack', 'Mobile', 'iOS', 'Android', 'Flutter', 'Swift',
  'Design', 'UI/UX', 'Figma', 'Product', 'Agile', 'Scrum', 'Leadership', 'Strategy',
  'Marketing', 'Sales', 'Growth', 'SEO', 'Content', 'Branding', 'Ads',
  'Finance', 'Fintech', 'Blockchain', 'Web3', 'Crypto', 'Trading', 'Banking',
  'Healthcare', 'EdTech', 'E-commerce', 'SaaS', 'B2B', 'Startup', 'Enterprise',
  'Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Pune', 'Hyderabad', 'Remote',
  'Stanford', 'MIT', 'IIT', 'NIT', 'LPU', 'Harvard', 'Berkeley',
  'Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Uber',
  'Consulting', 'Research', 'Engineering', 'Operations', 'HR', 'Legal',
  'Java', 'Go', 'Rust', 'C++', 'Ruby', 'PHP', 'Kotlin',
  'TensorFlow', 'PyTorch', 'Pandas', 'Spark', 'Kafka',
  'Vue.js', 'Angular', 'Svelte', 'Next.js', 'Tailwind',
  'Git', 'CI/CD', 'GitHub', 'Terraform', 'Linux'
]

// Pre-generate fabric positions using blue noise distribution (looks random but no overlap)
function generateFabricPositions(count) {
  const positions = []
  const minDistance = 5.8 // Minimum distance between points (percentage) - tighter for more density

  // Seed-based pseudo-random for consistency
  const seededRandom = (seed) => {
    const x = Math.sin(seed * 9999) * 10000
    return x - Math.floor(x)
  }

  // Add many edge positions to ensure edges are filled
  const edgePositions = [
    // Corners - multiple points
    { x: 1, y: 10 }, { x: 7, y: 11 }, { x: 96, y: 10 }, { x: 90, y: 11 },
    { x: 1, y: 90 }, { x: 7, y: 89 }, { x: 96, y: 90 }, { x: 90, y: 89 },
    // Top edge - dense
    { x: 14, y: 10 }, { x: 21, y: 11 }, { x: 28, y: 10 }, { x: 35, y: 11 },
    { x: 65, y: 11 }, { x: 72, y: 10 }, { x: 79, y: 11 }, { x: 86, y: 10 },
    // Bottom edge - dense
    { x: 8, y: 91 }, { x: 16, y: 90 }, { x: 24, y: 91 }, { x: 32, y: 90 },
    { x: 68, y: 90 }, { x: 76, y: 91 }, { x: 84, y: 90 }, { x: 92, y: 91 },
    // Left edge - dense
    { x: 2, y: 18 }, { x: 3, y: 26 }, { x: 2, y: 34 }, { x: 3, y: 42 },
    { x: 2, y: 58 }, { x: 3, y: 66 }, { x: 2, y: 74 }, { x: 3, y: 82 },
    // Right edge - dense
    { x: 96, y: 18 }, { x: 95, y: 26 }, { x: 96, y: 34 }, { x: 95, y: 42 },
    { x: 96, y: 58 }, { x: 95, y: 66 }, { x: 96, y: 74 }, { x: 95, y: 82 },
    // Second layer from edges
    { x: 10, y: 16 }, { x: 10, y: 84 }, { x: 88, y: 16 }, { x: 88, y: 84 },
    { x: 8, y: 50 }, { x: 92, y: 50 },
  ]

  edgePositions.forEach(pos => positions.push(pos))

  let attempts = 0
  let seed = 1

  while (positions.length < count && attempts < count * 150) {
    const x = seededRandom(seed) * 94 + 1         // 1% to 95%
    const y = seededRandom(seed * 2 + 1) * 82 + 9   // 9% to 91%
    seed++
    attempts++

    // Skip center area (where text/button is) - create a smaller hole in the middle
    const centerX = 50
    const centerY = 50
    const distFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2))
    if (distFromCenter < 16) {
      continue // Skip points too close to center
    }

    // Check if too close to existing points
    let tooClose = false
    for (const pos of positions) {
      const dx = pos.x - x
      const dy = pos.y - y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < minDistance) {
        tooClose = true
        break
      }
    }

    if (!tooClose) {
      positions.push({ x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 })
    }
  }

  return positions
}

// Pre-calculated positions (generated once)
const FABRIC_POSITIONS = generateFabricPositions(180)

export default function AntennaHero({ onStart }) {
  const [mounted, setMounted] = useState(false)
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 })
  const [isMobile, setIsMobile] = useState(false)
  const containerRef = useRef(null)

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Create keywords with positions - fewer on mobile
  const keywordsWithPositions = useMemo(() => {
    const result = []
    // On mobile, show only ~40 keywords (every 4th-5th position), on desktop show all 180
    const step = isMobile ? 4 : 1
    const maxKeywords = isMobile ? 40 : FABRIC_POSITIONS.length

    for (let i = 0; i < FABRIC_POSITIONS.length && result.length < maxKeywords; i += step) {
      result.push({
        keyword: FABRIC_KEYWORDS[i % FABRIC_KEYWORDS.length],
        position: FABRIC_POSITIONS[i],
        index: i
      })
    }
    return result
  }, [isMobile])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle mouse move for cloth ripple effect
  const handleMouseMove = (e) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }
  }

  const handleMouseLeave = () => {
    setMousePos({ x: -1000, y: -1000 })
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-screen h-screen bg-[#1E1E1E] overflow-hidden flex items-center justify-center"
      style={{ maxHeight: '100vh', maxWidth: '100vw' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Keyword Fabric Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Desktop: Full fabric with connection lines */}
        {!isMobile && (
          <>
            <FabricLines positions={keywordsWithPositions.map(k => k.position)} mousePos={mousePos} mounted={mounted} />
            <div className="keyword-fabric w-full h-full">
              {keywordsWithPositions.map((item) => (
                <FabricTag
                  key={`${item.keyword}-${item.index}`}
                  keyword={item.keyword}
                  position={item.position}
                  index={item.index}
                  mousePos={mousePos}
                  mounted={mounted}
                />
              ))}
            </div>
          </>
        )}

        {/* Mobile: Horizontal scrolling strips at top and bottom */}
        {isMobile && mounted && (
          <>
            {/* Top rows - scroll right */}
            <div className="absolute top-14 left-0 right-0 overflow-hidden">
              <div className="flex gap-2 animate-scroll-right-fast">
                {[...FABRIC_KEYWORDS, ...FABRIC_KEYWORDS].map((kw, idx) => (
                  <span key={`t1-${idx}`} className="px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap shrink-0" style={{ backgroundColor: 'rgba(232, 68, 153, 0.25)', color: 'rgba(232, 68, 153, 0.9)', border: '1px solid rgba(232, 68, 153, 0.3)' }}>{kw}</span>
                ))}
              </div>
            </div>
            <div className="absolute top-24 left-0 right-0 overflow-hidden">
              <div className="flex gap-2 animate-scroll-right-medium">
                {[...FABRIC_KEYWORDS.slice(20), ...FABRIC_KEYWORDS.slice(0, 20), ...FABRIC_KEYWORDS].map((kw, idx) => (
                  <span key={`t2-${idx}`} className="px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap shrink-0" style={{ backgroundColor: 'rgba(232, 68, 153, 0.2)', color: 'rgba(232, 68, 153, 0.8)', border: '1px solid rgba(232, 68, 153, 0.25)' }}>{kw}</span>
                ))}
              </div>
            </div>
            <div className="absolute top-34 left-0 right-0 overflow-hidden" style={{ top: '8.5rem' }}>
              <div className="flex gap-2 animate-scroll-right-slow">
                {[...FABRIC_KEYWORDS.slice(40), ...FABRIC_KEYWORDS.slice(0, 40), ...FABRIC_KEYWORDS].map((kw, idx) => (
                  <span key={`t3-${idx}`} className="px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap shrink-0" style={{ backgroundColor: 'rgba(232, 68, 153, 0.15)', color: 'rgba(232, 68, 153, 0.65)', border: '1px solid rgba(232, 68, 153, 0.2)' }}>{kw}</span>
                ))}
              </div>
            </div>
            <div className="absolute left-0 right-0 overflow-hidden" style={{ top: '11rem' }}>
              <div className="flex gap-2 animate-scroll-right-fast">
                {[...FABRIC_KEYWORDS.slice(60), ...FABRIC_KEYWORDS.slice(0, 60), ...FABRIC_KEYWORDS].map((kw, idx) => (
                  <span key={`t4-${idx}`} className="px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap shrink-0" style={{ backgroundColor: 'rgba(232, 68, 153, 0.1)', color: 'rgba(232, 68, 153, 0.5)', border: '1px solid rgba(232, 68, 153, 0.15)' }}>{kw}</span>
                ))}
              </div>
            </div>

            {/* Bottom rows - scroll left */}
            <div className="absolute left-0 right-0 overflow-hidden" style={{ bottom: '11rem' }}>
              <div className="flex gap-2 animate-scroll-left-fast">
                {[...FABRIC_KEYWORDS.slice(10), ...FABRIC_KEYWORDS.slice(0, 10), ...FABRIC_KEYWORDS].map((kw, idx) => (
                  <span key={`b4-${idx}`} className="px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap shrink-0" style={{ backgroundColor: 'rgba(232, 68, 153, 0.1)', color: 'rgba(232, 68, 153, 0.5)', border: '1px solid rgba(232, 68, 153, 0.15)' }}>{kw}</span>
                ))}
              </div>
            </div>
            <div className="absolute left-0 right-0 overflow-hidden" style={{ bottom: '8.5rem' }}>
              <div className="flex gap-2 animate-scroll-left-slow">
                {[...FABRIC_KEYWORDS.slice(30), ...FABRIC_KEYWORDS.slice(0, 30), ...FABRIC_KEYWORDS].map((kw, idx) => (
                  <span key={`b3-${idx}`} className="px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap shrink-0" style={{ backgroundColor: 'rgba(232, 68, 153, 0.15)', color: 'rgba(232, 68, 153, 0.65)', border: '1px solid rgba(232, 68, 153, 0.2)' }}>{kw}</span>
                ))}
              </div>
            </div>
            <div className="absolute bottom-24 left-0 right-0 overflow-hidden">
              <div className="flex gap-2 animate-scroll-left-medium">
                {[...FABRIC_KEYWORDS.slice(50), ...FABRIC_KEYWORDS.slice(0, 50), ...FABRIC_KEYWORDS].map((kw, idx) => (
                  <span key={`b2-${idx}`} className="px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap shrink-0" style={{ backgroundColor: 'rgba(232, 68, 153, 0.2)', color: 'rgba(232, 68, 153, 0.8)', border: '1px solid rgba(232, 68, 153, 0.25)' }}>{kw}</span>
                ))}
              </div>
            </div>
            <div className="absolute bottom-14 left-0 right-0 overflow-hidden">
              <div className="flex gap-2 animate-scroll-left-fast">
                {[...FABRIC_KEYWORDS.slice(70), ...FABRIC_KEYWORDS.slice(0, 70), ...FABRIC_KEYWORDS].map((kw, idx) => (
                  <span key={`b1-${idx}`} className="px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap shrink-0" style={{ backgroundColor: 'rgba(232, 68, 153, 0.25)', color: 'rgba(232, 68, 153, 0.9)', border: '1px solid rgba(232, 68, 153, 0.3)' }}>{kw}</span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Center dark gradient for readability */}
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none" />

      {/* Center Content - transparent background */}
      <div className="relative z-10 text-center px-4">
        {/* Antenna Text */}
        <div className="mb-8">
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold text-white tracking-tight mb-4 drop-shadow-lg">
            <span className="text-primary-500">A</span>ntenna
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-md mx-auto drop-shadow-md">
            Where Every Signal Leads you Closer to the Humans you're looking for.
          </p>
        </div>

        {/* CTA Button */}
        <button
          onClick={onStart}
          className="group relative px-8 py-4 bg-primary-500 text-white text-lg font-semibold rounded-xl hover:bg-primary-600 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary-500/30"
        >
          <span className="relative z-10 flex items-center gap-2">
            Ask Antenna
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </button>

        {/* Subtle hint */}
        <p className="mt-6 text-sm text-gray-400 drop-shadow">
          Human Powered AI
        </p>
      </div>
    </div>
  )
}

// Component to draw connection lines between nearby keywords
function FabricLines({ positions, mousePos, mounted }) {
  const lines = useMemo(() => {
    const result = []
    const maxDistance = 12 // Maximum distance (%) to draw a line

    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const dx = positions[i].x - positions[j].x
        const dy = positions[i].y - positions[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < maxDistance) {
          result.push({
            x1: positions[i].x,
            y1: positions[i].y,
            x2: positions[j].x,
            y2: positions[j].y,
            dist
          })
        }
      }
    }
    return result
  }, [positions])

  return (
    <svg
      className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}
      style={{ pointerEvents: 'none' }}
    >
      {lines.map((line, idx) => {
        // Calculate line midpoint distance from center for fade effect
        const midX = (line.x1 + line.x2) / 2
        const midY = (line.y1 + line.y2) / 2
        const distFromCenter = Math.sqrt(Math.pow(midX - 50, 2) + Math.pow(midY - 50, 2))

        // Fade in from center - lines closer to edge are more visible
        const centerFade = Math.min(1, Math.max(0, (distFromCenter - 12) / 15))

        let opacity = 0.12 * centerFade
        let strokeWidth = 0.5

        if (mousePos.x !== -1000 && typeof window !== 'undefined') {
          const viewportWidth = window.innerWidth
          const viewportHeight = window.innerHeight

          const pixelMidX = (midX / 100) * viewportWidth
          const pixelMidY = (midY / 100) * viewportHeight

          const distToMouse = Math.sqrt(
            Math.pow(pixelMidX - mousePos.x, 2) + Math.pow(pixelMidY - mousePos.y, 2)
          )

          const influence = Math.max(0, 1 - distToMouse / 200)
          opacity = (0.12 + influence * 0.4) * centerFade
          strokeWidth = 0.5 + influence * 1
        }

        if (opacity < 0.02) return null // Don't render invisible lines

        // Hot pink glow effect on hover
        const glowIntensity = mousePos.x !== -1000 ? Math.max(0, 1 - Math.sqrt(
          Math.pow(((line.x1 + line.x2) / 2 / 100) * (typeof window !== 'undefined' ? window.innerWidth : 1200) - mousePos.x, 2) +
          Math.pow(((line.y1 + line.y2) / 2 / 100) * (typeof window !== 'undefined' ? window.innerHeight : 800) - mousePos.y, 2)
        ) / 180) : 0

        return (
          <line
            key={idx}
            x1={`${line.x1}%`}
            y1={`${line.y1}%`}
            x2={`${line.x2}%`}
            y2={`${line.y2}%`}
            stroke={glowIntensity > 0.3 ? `rgba(255, 100, 180, 1)` : `rgba(232, 68, 153, 1)`}
            strokeWidth={strokeWidth}
            opacity={opacity}
            style={{
              transition: 'opacity 0.2s ease-out, stroke-width 0.2s ease-out',
              filter: glowIntensity > 0.2 ? `drop-shadow(0 0 ${Math.round(glowIntensity * 8)}px rgba(232, 68, 153, 0.8))` : 'none'
            }}
          />
        )
      })}
    </svg>
  )
}

function FabricTag({ keyword, position, index, mousePos, mounted }) {
  // Use pre-calculated random position
  const baseX = position.x
  const baseY = position.y

  // Calculate distance from center for fade effect (smaller radius)
  const distFromCenter = Math.sqrt(Math.pow(baseX - 50, 2) + Math.pow(baseY - 50, 2))
  const centerFade = Math.min(1, Math.max(0, (distFromCenter - 14) / 12))

  // Calculate cloth ripple effect - wave that spreads from cursor
  let transformX = 0
  let transformY = 0
  let scale = 1
  let rippleOffset = 0

  if (mousePos.x !== -1000 && typeof window !== 'undefined') {
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    const tagX = (baseX / 100) * viewportWidth
    const tagY = (baseY / 100) * viewportHeight

    const dx = tagX - mousePos.x
    const dy = tagY - mousePos.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    const maxDistance = 250
    const influence = Math.max(0, 1 - distance / maxDistance)

    // Ripple wave effect - creates concentric waves
    const wavePhase = (distance / 50) % (Math.PI * 2)
    rippleOffset = Math.sin(wavePhase) * influence * 8

    // Push effect away from cursor
    const pushStrength = 20 * influence * influence
    const angle = Math.atan2(dy, dx)

    transformX = Math.cos(angle) * pushStrength
    transformY = Math.sin(angle) * pushStrength + rippleOffset
    scale = 1 + influence * 0.12
  }

  // Staggered fade-in delay
  const delay = Math.round(index * 12) / 1000

  // Don't render if too close to center (invisible)
  if (centerFade < 0.1) return null

  return (
    <div
      className={`absolute transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}
      style={{
        left: `${baseX}%`,
        top: `${baseY}%`,
        transitionDelay: `${delay}s`,
        transform: `translate(${Math.round(transformX)}px, ${Math.round(transformY)}px) scale(${Math.round(scale * 100) / 100})`,
        transition: 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.5s ease-out',
        opacity: mounted ? centerFade : 0,
      }}
    >
      <span
        className="px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap inline-block"
        style={{
          backgroundColor: scale > 1.08 ? 'rgba(255, 100, 180, 0.35)' : 'rgba(232, 68, 153, 0.2)',
          color: scale > 1.08 ? 'rgba(255, 150, 200, 1)' : 'rgba(232, 68, 153, 0.85)',
          border: scale > 1.08 ? '1px solid rgba(255, 100, 180, 0.6)' : '1px solid rgba(232, 68, 153, 0.25)',
          boxShadow: scale > 1.05
            ? `0 0 ${Math.round((scale - 1) * 150)}px rgba(232, 68, 153, ${0.4 + (scale - 1) * 2}), 0 0 ${Math.round((scale - 1) * 80)}px rgba(255, 100, 180, 0.6), inset 0 0 8px rgba(255, 150, 200, 0.3)`
            : 'none',
          textShadow: scale > 1.08 ? '0 0 10px rgba(255, 150, 200, 0.8)' : 'none',
          transition: 'all 0.15s ease-out',
        }}
      >
        {keyword}
      </span>
    </div>
  )
}
