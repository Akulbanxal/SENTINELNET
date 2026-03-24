'use client'

import { useState, useEffect, useRef } from 'react'
import { useJobManager } from '@/hooks/useJobManager'

interface UseDemoModeOptions {
  interval?: number // milliseconds between auto-verifications
  enabled?: boolean // initial state
}

export function useDemoMode(options: UseDemoModeOptions = {}) {
  const { interval = 10000, enabled: initialEnabled = false } = options
  const [isEnabled, setIsEnabled] = useState(initialEnabled)
  const [demoCount, setDemoCount] = useState(0)
  const { createAndRunJob } = useJobManager()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Generate a realistic-looking fake Ethereum address
  const generateFakeTokenAddress = (): string => {
    const chars = '0123456789abcdef'
    let address = '0x'
    for (let i = 0; i < 40; i++) {
      address += chars[Math.floor(Math.random() * chars.length)]
    }
    return address
  }

  // Start demo mode
  const startDemo = () => {
    setIsEnabled(true)
  }

  // Stop demo mode
  const stopDemo = () => {
    setIsEnabled(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  // Toggle demo mode
  const toggleDemo = () => {
    if (isEnabled) {
      stopDemo()
    } else {
      startDemo()
    }
  }

  // Run a demo verification
  const runDemoVerification = async () => {
    try {
      const fakeAddress = generateFakeTokenAddress()
      console.log('🎬 Demo Mode: Starting verification for', fakeAddress)
      await createAndRunJob(fakeAddress)
      setDemoCount(prev => prev + 1)
      console.log('✅ Demo Mode: Verification completed')
    } catch (error) {
      console.error('❌ Demo Mode: Verification failed', error)
    }
  }

  // Effect to handle demo mode interval
  useEffect(() => {
    if (isEnabled) {
      // Run immediately when enabled
      runDemoVerification()

      // Then run on interval
      intervalRef.current = setInterval(() => {
        runDemoVerification()
      }, interval)

      console.log(`🎬 Demo Mode: Started (running every ${interval / 1000}s)`)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
        console.log('⏹️ Demo Mode: Stopped')
      }
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isEnabled, interval])

  return {
    isEnabled,
    demoCount,
    startDemo,
    stopDemo,
    toggleDemo,
    runDemoVerification,
  }
}
