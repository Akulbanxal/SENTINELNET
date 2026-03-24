import { useState, useEffect, useCallback } from 'react'
import { apiService } from '@/services/api.service'
import type { Agent, ApiResponse } from '@/types'

export function useAgents(filter?: string) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAgents = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiService.getAgents(filter)
      setAgents(response.data.agents || [])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch agents')
      console.error('Error fetching agents:', err)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  return {
    agents,
    loading,
    error,
    refetch: fetchAgents,
  }
}

export function useAgent(address: string | null) {
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!address) {
      setAgent(null)
      return
    }

    const fetchAgent = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const response = await apiService.getAgentById(address)
        setAgent(response.data.agent)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch agent')
        console.error('Error fetching agent:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAgent()
  }, [address])

  return { agent, loading, error }
}
