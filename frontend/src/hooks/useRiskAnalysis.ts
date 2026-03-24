import { useState, useCallback } from 'react'
import { apiService } from '@/services/api.service'
import type { TokenAuditData } from '@/types'

export function useRiskAnalysis() {
  const [auditData, setAuditData] = useState<TokenAuditData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzeToken = useCallback(async (tokenAddress: string) => {
    if (!tokenAddress || !tokenAddress.startsWith('0x')) {
      setError('Please enter a valid Ethereum address')
      return
    }

    setLoading(true)
    setError(null)
    setAuditData(null)

    try {
      const response = await apiService.getAuditsByToken(tokenAddress)
      setAuditData(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch audit data')
      console.error('Error analyzing token:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setAuditData(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    auditData,
    loading,
    error,
    analyzeToken,
    reset,
  }
}
