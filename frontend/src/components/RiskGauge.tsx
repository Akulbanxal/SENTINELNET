'use client'

import { useEffect, useState } from 'react'
import { motion, useSpring } from 'framer-motion'

interface RiskGaugeProps {
  score: number // 0-100
  size?: number // diameter in pixels
  strokeWidth?: number
  animate?: boolean
  showLabel?: boolean
}

export function RiskGauge({ 
  score, 
  size = 200, 
  strokeWidth = 20,
  animate = true,
  showLabel = true 
}: RiskGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0)

  // Normalize score to 0-100 range
  const normalizedScore = Math.max(0, Math.min(100, score))

  // Use Framer Motion spring for smooth animation
  const springScore = useSpring(0, {
    stiffness: 60,
    damping: 20
  })

  useEffect(() => {
    if (animate) {
      springScore.set(normalizedScore)
    } else {
      setDisplayScore(normalizedScore)
    }
  }, [normalizedScore, springScore, animate])

  useEffect(() => {
    if (animate) {
      const unsubscribe = springScore.on('change', (latest) => {
        setDisplayScore(latest)
      })
      return () => unsubscribe()
    }
  }, [springScore, animate])

  // Calculate circle properties
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2

  // Calculate progress (percentage of circle to fill)
  const progress = (displayScore / 100) * circumference

  // Determine color based on score
  const getColor = (score: number) => {
    if (score <= 30) return '#10B981' // green-500
    if (score <= 60) return '#F59E0B' // yellow-500
    return '#EF4444' // red-500
  }

  // Determine risk level text
  const getRiskLevel = (score: number) => {
    if (score <= 30) return 'SAFE'
    if (score <= 60) return 'WARNING'
    return 'DANGER'
  }

  // Get gradient colors for smooth transition
  const getGradientStops = (score: number) => {
    if (score <= 30) {
      return {
        start: '#10B981',
        end: '#059669'
      }
    }
    if (score <= 60) {
      return {
        start: '#F59E0B',
        end: '#D97706'
      }
    }
    return {
      start: '#EF4444',
      end: '#DC2626'
    }
  }

  const currentColor = getColor(displayScore)
  const riskLevel = getRiskLevel(displayScore)
  const gradientStops = getGradientStops(displayScore)
  const isAnimating = Math.abs(displayScore - normalizedScore) > 0.5

  return (
    <motion.div 
      className="flex flex-col items-center justify-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Define gradient */}
          <defs>
            <linearGradient id={`gaugeGradient-${score}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradientStops.start} />
              <stop offset="100%" stopColor={gradientStops.end} />
            </linearGradient>
            
            {/* Glow filter for animation */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Background circle (gray track) */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#374151"
            strokeWidth={strokeWidth}
            className="opacity-30"
          />

          {/* Progress circle */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={`url(#gaugeGradient-${score})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              filter: isAnimating ? 'url(#glow)' : 'none',
            }}
          />

          {/* Animated pulse ring for active state */}
          {isAnimating && (
            <motion.circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={currentColor}
              strokeWidth={strokeWidth / 2}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 0, r: radius + 5 }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-center">
            {/* Score number */}
            <motion.div 
              className="text-5xl font-bold transition-colors duration-300"
              style={{ color: currentColor }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                delay: 0.3,
                type: 'spring',
                stiffness: 200,
                damping: 15
              }}
            >
              {displayScore.toFixed(1)}
            </motion.div>
            
            {/* Risk level label */}
            {showLabel && (
              <motion.div 
                className="text-sm font-semibold mt-2 px-3 py-1 rounded-full transition-all duration-300"
                style={{ 
                  backgroundColor: `${currentColor}20`,
                  color: currentColor,
                  borderWidth: '2px',
                  borderColor: currentColor
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {riskLevel}
              </motion.div>
            )}
          </div>
        </div>

        {/* Animated glow effect on background */}
        {isAnimating && (
          <motion.div 
            className="absolute inset-0 rounded-full"
            style={{
              boxShadow: `0 0 40px ${currentColor}40`,
              pointerEvents: 'none'
            }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        )}
      </div>

      {/* Score markers */}
      <div className="flex justify-between w-full max-w-xs mt-4 text-xs text-gray-400">
        <div className="flex flex-col items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mb-1"></div>
          <span>0-30</span>
          <span className="font-semibold text-green-500">Safe</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-3 h-3 rounded-full bg-yellow-500 mb-1"></div>
          <span>31-60</span>
          <span className="font-semibold text-yellow-500">Warning</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-3 h-3 rounded-full bg-red-500 mb-1"></div>
          <span>61-100</span>
          <span className="font-semibold text-red-500">Danger</span>
        </div>
      </div>
    </motion.div>
  )
}

// Compact version for smaller displays
export function RiskGaugeMini({ 
  score, 
  size = 120,
}: { 
  score: number
  size?: number 
}) {
  return <RiskGauge score={score} size={size} strokeWidth={12} showLabel={false} />
}
