import { useState, useEffect, useCallback, useRef } from 'react'
import { simulationEngine, MOCK_TOKENS } from '@/lib/simulation'
import type { VerificationJob, ActivityLog, TokenScenario } from '@/types'

interface SimulationState {
  jobs: VerificationJob[]
  activityLog: ActivityLog[]
  activeJobs: number
  completedJobs: number
}

export function useSimulation() {
  const [state, setState] = useState<SimulationState>({
    jobs: [],
    activityLog: [],
    activeJobs: 0,
    completedJobs: 0,
  })
  const [isRunning, setIsRunning] = useState(false)
  const [speedMultiplier, setSpeedMultiplier] = useState(1)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isRunningRef = useRef<boolean>(false)

  // Subscribe to simulation updates
  useEffect(() => {
    const unsubscribe = simulationEngine.subscribe((newState) => {
      setState(newState)
    })

    return () => {
      unsubscribe()
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Start a single verification job
  const startVerification = useCallback(
    async (scenario: TokenScenario) => {
      if (isRunningRef.current) return
      const token = MOCK_TOKENS[scenario]
      const jobId = simulationEngine.createJob(token)
      setIsRunning(true)
      isRunningRef.current = true

      try {
        await simulationEngine.executeJob(jobId, token, speedMultiplier)
      } catch (error) {
        console.error('Verification failed:', error)
      } finally {
        setIsRunning(false)
        isRunningRef.current = false
      }
    },
    [speedMultiplier]
  )

  // Start continuous simulation (demo mode)
  const startDemoMode = useCallback(() => {
    // Don't start if already running
    if (isRunningRef.current) return

    // Clear any previous interval just in case
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    setIsRunning(true)
    isRunningRef.current = true
    let scenarioIndex = 0
    const scenarios: TokenScenario[] = ['safe', 'risky', 'medium']

    const runNext = async () => {
      // If stopSimulation has been called, don't enqueue more work
      if (!isRunningRef.current) return

      const scenario = scenarios[scenarioIndex % scenarios.length]
      const token = MOCK_TOKENS[scenario]
      const jobId = simulationEngine.createJob(token)

      try {
        await simulationEngine.executeJob(jobId, token, speedMultiplier)
      } catch (error) {
        console.error('Demo job failed:', error)
      }

      scenarioIndex++
    }

    // Start first job immediately
    runNext()

    // Schedule subsequent jobs while running
    intervalRef.current = setInterval(() => {
      if (isRunningRef.current) {
        runNext()
      }
    }, 35000 / speedMultiplier) // Wait 35 seconds between jobs
  }, [speedMultiplier])

  // Stop simulation
  const stopSimulation = useCallback(() => {
    // Flip running flags first so any in-flight loop respects it
    isRunningRef.current = false
    setIsRunning(false)

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // Clear all simulation data
  const clearSimulation = useCallback(() => {
    stopSimulation()
    simulationEngine.clear()
    setState({
      jobs: [],
      activityLog: [],
      activeJobs: 0,
      completedJobs: 0,
    })
  }, [stopSimulation])

  // Change simulation speed
  const setSpeed = useCallback((speed: 'slow' | 'normal' | 'fast') => {
    const multipliers = {
      slow: 0.5,
      normal: 1,
      fast: 2,
    }
    setSpeedMultiplier(multipliers[speed])
  }, [])

  return {
    state,
    isRunning,
    speedMultiplier,
    startVerification,
    startDemoMode,
    stopSimulation,
    clearSimulation,
    setSpeed,
  }
}
