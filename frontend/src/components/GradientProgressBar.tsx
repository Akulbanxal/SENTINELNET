'use client'

import React from 'react'

interface GradientProgressBarProps {
  value: number // 0-100
  color?: 'blue' | 'purple' | 'cyan' | 'green' | 'red'
  height?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  animated?: boolean
}

export default function GradientProgressBar({
  value,
  color = 'blue',
  height = 'md',
  showValue = false,
  animated = true
}: GradientProgressBarProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100)

  const gradients = {
    blue: 'from-blue-500 via-blue-400 to-cyan-400',
    purple: 'from-purple-500 via-purple-400 to-pink-400',
    cyan: 'from-cyan-500 via-cyan-400 to-blue-400',
    green: 'from-green-500 via-green-400 to-emerald-400',
    red: 'from-red-500 via-red-400 to-orange-400'
  }

  const glowColors = {
    blue: 'shadow-blue-500/50',
    purple: 'shadow-purple-500/50',
    cyan: 'shadow-cyan-500/50',
    green: 'shadow-green-500/50',
    red: 'shadow-red-500/50'
  }

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  }

  return (
    <div className="relative w-full">
      {/* Background */}
      <div className={`w-full ${heights[height]} bg-gray-800/50 rounded-full overflow-hidden backdrop-blur-sm`}>
        {/* Progress bar */}
        <div
          className={`
            h-full bg-gradient-to-r ${gradients[color]}
            rounded-full transition-all duration-700 ease-out
            shadow-lg ${glowColors[color]}
            relative overflow-hidden
          `}
          style={{ width: `${clampedValue}%` }}
        >
          {/* Animated shimmer effect */}
          {animated && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-slide-progress" />
          )}
        </div>
      </div>

      {/* Value display */}
      {showValue && (
        <div className="absolute -top-6 right-0 text-xs font-medium text-gray-400">
          {clampedValue}%
        </div>
      )}
    </div>
  )
}
