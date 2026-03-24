'use client'

import React from 'react'

interface MiniChartProps {
  data: number[]
  color?: 'blue' | 'purple' | 'cyan' | 'green' | 'red'
  height?: number
}

export default function MiniChart({ 
  data, 
  color = 'blue', 
  height = 60 
}: MiniChartProps) {
  const colors = {
    blue: { fill: 'rgba(59, 130, 246, 0.2)', stroke: 'rgba(59, 130, 246, 0.8)' },
    purple: { fill: 'rgba(139, 92, 246, 0.2)', stroke: 'rgba(139, 92, 246, 0.8)' },
    cyan: { fill: 'rgba(6, 182, 212, 0.2)', stroke: 'rgba(6, 182, 212, 0.8)' },
    green: { fill: 'rgba(16, 185, 129, 0.2)', stroke: 'rgba(16, 185, 129, 0.8)' },
    red: { fill: 'rgba(239, 68, 68, 0.2)', stroke: 'rgba(239, 68, 68, 0.8)' }
  }

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const width = 100
  const padding = 5
  const chartHeight = height - padding * 2
  const pointWidth = width / (data.length - 1)

  const points = data.map((value, index) => {
    const x = index * pointWidth
    const y = padding + (chartHeight - ((value - min) / range) * chartHeight)
    return `${x},${y}`
  }).join(' ')

  const areaPoints = `0,${height} ${points} ${width},${height}`

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="overflow-visible"
    >
      {/* Gradient definition */}
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colors[color].stroke} stopOpacity="0.3" />
          <stop offset="100%" stopColor={colors[color].stroke} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <polygon
        points={areaPoints}
        fill={`url(#gradient-${color})`}
        className="transition-all duration-300"
      />

      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={colors[color].stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-all duration-300"
      />

      {/* Glow effect */}
      <polyline
        points={points}
        fill="none"
        stroke={colors[color].stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.3"
        className="blur-sm"
      />
    </svg>
  )
}
