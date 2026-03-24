import { useState, useCallback } from 'react'
import { apiService } from '@/services/api.service'
import type { TradeEvaluation } from '@/types'

export function useTradeEvaluation() {
  const [evaluation, setEvaluation] = useState<TradeEvaluation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const evaluateTrade = useCallback(async (tokenAddress: string) => {
    if (!tokenAddress || !tokenAddress.startsWith('0x')) {
      setError('Please enter a valid token address')
      return
    }

    setLoading(true)
    setError(null)
    setEvaluation(null)

    try {
      const response = await apiService.evaluateTrade(tokenAddress)
      setEvaluation(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to evaluate trade')
      console.error('Error evaluating trade:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setEvaluation(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    evaluation,
    loading,
    error,
    evaluateTrade,
    reset,
  }
}
