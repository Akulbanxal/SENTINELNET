import { useState, useEffect, useCallback } from 'react'
import {
  runSecurityBot,
  runLiquidityScanner,
  runTokenomicsAnalyzer,
  runAllAgents,
  runAllAgentsSequential,
  agentEventEmitter,
  type AgentSimulationResult,
  type AgentSimulationConfig,
  type AgentEvent,
} from '@/lib/agentSimulation'

interface AgentSimulationState {
  security: AgentSimulationResult | null
  liquidity: AgentSimulationResult | null
  tokenomics: AgentSimulationResult | null
  overallScore: number | null
  isRunning: boolean
  error: string | null
  events: AgentEvent[]
}

export function useAgentSimulation(config?: AgentSimulationConfig) {
  const [state, setState] = useState<AgentSimulationState>({
    security: null,
    liquidity: null,
    tokenomics: null,
    overallScore: null,
    isRunning: false,
    error: null,
    events: [],
  })

  // Subscribe to agent events
  useEffect(() => {
    const unsubscribers = [
      agentEventEmitter.subscribe('started', (event) => {
        setState((prev) => ({
          ...prev,
          events: [event, ...prev.events].slice(0, 50), // Keep last 50 events
        }))
      }),
      agentEventEmitter.subscribe('progress', (event) => {
        setState((prev) => ({
          ...prev,
          events: [event, ...prev.events].slice(0, 50),
        }))
      }),
      agentEventEmitter.subscribe('completed', (event) => {
        setState((prev) => ({
          ...prev,
          events: [event, ...prev.events].slice(0, 50),
        }))
      }),
      agentEventEmitter.subscribe('failed', (event) => {
        setState((prev) => ({
          ...prev,
          events: [event, ...prev.events].slice(0, 50),
        }))
      }),
    ]

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe())
    }
  }, [])

  // Run all agents in parallel
  const runParallel = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      isRunning: true,
      error: null,
      security: null,
      liquidity: null,
      tokenomics: null,
      overallScore: null,
    }))

    try {
      const results = await runAllAgents(config)

      setState((prev) => ({
        ...prev,
        security: results.security,
        liquidity: results.liquidity,
        tokenomics: results.tokenomics,
        overallScore: results.overallScore,
        isRunning: false,
      }))

      return results
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        isRunning: false,
      }))
      throw error
    }
  }, [config])

  // Run all agents sequentially
  const runSequential = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      isRunning: true,
      error: null,
      security: null,
      liquidity: null,
      tokenomics: null,
      overallScore: null,
    }))

    try {
      const results = await runAllAgentsSequential(config)

      setState((prev) => ({
        ...prev,
        security: results.security,
        liquidity: results.liquidity,
        tokenomics: results.tokenomics,
        overallScore: results.overallScore,
        isRunning: false,
      }))

      return results
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        isRunning: false,
      }))
      throw error
    }
  }, [config])

  // Run individual security bot
  const runSecurity = useCallback(async () => {
    setState((prev) => ({ ...prev, isRunning: true, error: null }))

    try {
      const result = await runSecurityBot(config)
      setState((prev) => ({
        ...prev,
        security: result,
        isRunning: false,
      }))
      return result
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        isRunning: false,
      }))
      throw error
    }
  }, [config])

  // Run individual liquidity scanner
  const runLiquidity = useCallback(async () => {
    setState((prev) => ({ ...prev, isRunning: true, error: null }))

    try {
      const result = await runLiquidityScanner(config)
      setState((prev) => ({
        ...prev,
        liquidity: result,
        isRunning: false,
      }))
      return result
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        isRunning: false,
      }))
      throw error
    }
  }, [config])

  // Run individual tokenomics analyzer
  const runTokenomics = useCallback(async () => {
    setState((prev) => ({ ...prev, isRunning: true, error: null }))

    try {
      const result = await runTokenomicsAnalyzer(config)
      setState((prev) => ({
        ...prev,
        tokenomics: result,
        isRunning: false,
      }))
      return result
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        isRunning: false,
      }))
      throw error
    }
  }, [config])

  // Clear results
  const clear = useCallback(() => {
    setState({
      security: null,
      liquidity: null,
      tokenomics: null,
      overallScore: null,
      isRunning: false,
      error: null,
      events: [],
    })
  }, [])

  // Clear events only
  const clearEvents = useCallback(() => {
    setState((prev) => ({ ...prev, events: [] }))
  }, [])

  return {
    ...state,
    runParallel,
    runSequential,
    runSecurity,
    runLiquidity,
    runTokenomics,
    clear,
    clearEvents,
  }
}
