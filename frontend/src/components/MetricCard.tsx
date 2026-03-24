'use client'

import React, { useEffect, useState } from 'react'
import { motion, useSpring } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  icon?: React.ReactNode
  chart?: React.ReactNode
  gradient?: 'blue' | 'purple' | 'cyan' | 'green' | 'red'
  animated?: boolean
}

export default function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  chart,
  gradient = 'blue',
  animated = true
}: MetricCardProps) {
  // Animated counter for numeric values
  const [displayValue, setDisplayValue] = useState<string | number>(value)
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value
  const isNumeric = !isNaN(numericValue)

  const springValue = useSpring(0, {
    stiffness: 80,
    damping: 20
  })

  useEffect(() => {
    if (isNumeric && animated) {
      springValue.set(numericValue)
    }
  }, [numericValue, springValue, isNumeric, animated])

  useEffect(() => {
    if (isNumeric && animated) {
      const unsubscribe = springValue.on('change', (latest) => {
        const valueStr = value.toString()
        if (valueStr.includes('%')) {
          setDisplayValue(`${latest.toFixed(1)}%`)
        } else if (valueStr.includes('s')) {
          setDisplayValue(`${latest.toFixed(1)}s`)
        } else if (valueStr.includes(',')) {
          setDisplayValue(Math.round(latest).toLocaleString())
        } else {
          setDisplayValue(Math.round(latest).toString())
        }
      })
      return () => unsubscribe()
    } else {
      setDisplayValue(value)
    }
  }, [value, springValue, isNumeric, animated])
  const gradients = {
    blue: 'from-blue-500/20 to-blue-600/10',
    purple: 'from-purple-500/20 to-purple-600/10',
    cyan: 'from-cyan-500/20 to-cyan-600/10',
    green: 'from-green-500/20 to-green-600/10',
    red: 'from-red-500/20 to-red-600/10'
  }

  const glowColors = {
    blue: 'shadow-blue-500/20',
    purple: 'shadow-purple-500/20',
    cyan: 'shadow-cyan-500/20',
    green: 'shadow-green-500/20',
    red: 'shadow-red-500/20'
  }

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`
        relative overflow-hidden rounded-2xl p-6
        bg-gradient-to-br ${gradients[gradient]}
        backdrop-blur-xl border border-white/10
        shadow-2xl ${glowColors[gradient]}
        transition-shadow duration-300
        group
      `}
    >
      {/* Animated gradient overlay */}
      {animated && (
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ 
            repeat: Infinity, 
            duration: 3, 
            ease: 'linear',
            repeatDelay: 2 
          }}
        />
      )}

      {/* Top glow line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <motion.p 
              className="text-sm font-medium text-gray-400 mb-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {title}
            </motion.p>
            <div className="flex items-baseline gap-2">
              <motion.h3 
                className="text-3xl font-bold text-white"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  delay: 0.2,
                  type: 'spring',
                  stiffness: 200,
                  damping: 15
                }}
              >
                {displayValue}
              </motion.h3>
              {trendValue && (
                <motion.div 
                  className={`flex items-center gap-1 text-sm ${trendColor}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <TrendIcon className="w-4 h-4" />
                  <span>{trendValue}</span>
                </motion.div>
              )}
            </div>
            {subtitle && (
              <motion.p 
                className="text-xs text-gray-500 mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {subtitle}
              </motion.p>
            )}
          </div>
          {icon && (
            <motion.div 
              className={`
                p-3 rounded-xl 
                bg-gradient-to-br ${gradients[gradient]}
                border border-white/10
              `}
              initial={{ opacity: 0, rotate: -180, scale: 0 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              transition={{ 
                delay: 0.3,
                type: 'spring',
                stiffness: 200,
                damping: 15
              }}
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              {icon}
            </motion.div>
          )}
        </div>

        {/* Chart or additional content */}
        {chart && (
          <motion.div 
            className="mt-4"
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ 
              delay: 0.5,
              duration: 0.4,
              ease: 'easeOut'
            }}
          >
            {chart}
          </motion.div>
        )}
      </div>

      {/* Glowing orb effect */}
      <motion.div 
        className={`
          absolute -bottom-20 -right-20 w-40 h-40 
          bg-gradient-to-br ${gradients[gradient]}
          rounded-full blur-3xl opacity-20
        `}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    </motion.div>
  )
}
