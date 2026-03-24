import { useState, useCallback, useMemo } from 'react'
import {
  aggregateRiskScores,
  getRiskLevelDescription,
  getRiskLevelColors,
  getTradeRecommendation,
  type RiskScoreInputs,
  type RiskAggregationResult,
  type RiskLevel,
} from '@/lib/riskAggregation'

export interface UseRiskAggregationOptions {
  autoCalculate?: boolean // Automatically calculate when inputs change
  onRiskLevelChange?: (newLevel: RiskLevel, oldLevel?: RiskLevel) => void
}

export function useRiskAggregation(options?: UseRiskAggregationOptions) {
  const { autoCalculate = true, onRiskLevelChange } = options || {}

  const [result, setResult] = useState<RiskAggregationResult | null>(null)
  const [inputs, setInputs] = useState<RiskScoreInputs>({
    securityScore: 0,
    liquidityScore: 0,
    tokenomicsScore: 0,
  })

  // Calculate risk score
  const calculate = useCallback(
    (scoreInputs?: RiskScoreInputs) => {
      const inputsToUse = scoreInputs || inputs

      try {
        const newResult = aggregateRiskScores(inputsToUse)
        const oldLevel = result?.riskLevel

        // Notify if risk level changed
        if (onRiskLevelChange && oldLevel && oldLevel !== newResult.riskLevel) {
          onRiskLevelChange(newResult.riskLevel, oldLevel)
        }

        setResult(newResult)
        return newResult
      } catch (error) {
        console.error('Error calculating risk score:', error)
        return null
      }
    },
    [inputs, result?.riskLevel, onRiskLevelChange]
  )

  // Update security score
  const updateSecurityScore = useCallback(
    (score: number) => {
      const newInputs = { ...inputs, securityScore: score }
      setInputs(newInputs)
      if (autoCalculate) {
        calculate(newInputs)
      }
    },
    [inputs, autoCalculate, calculate]
  )

  // Update liquidity score
  const updateLiquidityScore = useCallback(
    (score: number) => {
      const newInputs = { ...inputs, liquidityScore: score }
      setInputs(newInputs)
      if (autoCalculate) {
        calculate(newInputs)
      }
    },
    [inputs, autoCalculate, calculate]
  )

  // Update tokenomics score
  const updateTokenomicsScore = useCallback(
    (score: number) => {
      const newInputs = { ...inputs, tokenomicsScore: score }
      setInputs(newInputs)
      if (autoCalculate) {
        calculate(newInputs)
      }
    },
    [inputs, autoCalculate, calculate]
  )

  // Update all scores at once
  const updateAllScores = useCallback(
    (scores: RiskScoreInputs) => {
      setInputs(scores)
      if (autoCalculate) {
        calculate(scores)
      }
    },
    [autoCalculate, calculate]
  )

  // Reset all scores
  const reset = useCallback(() => {
    setInputs({
      securityScore: 0,
      liquidityScore: 0,
      tokenomicsScore: 0,
    })
    setResult(null)
  }, [])

  // Memoized derived values
  const description = useMemo(
    () => (result ? getRiskLevelDescription(result.riskLevel) : null),
    [result]
  )

  const colors = useMemo(
    () => (result ? getRiskLevelColors(result.riskLevel) : null),
    [result]
  )

  const recommendation = useMemo(
    () => (result ? getTradeRecommendation(result.riskLevel) : null),
    [result]
  )

  const isValid = useMemo(() => {
    return (
      inputs.securityScore >= 0 &&
      inputs.securityScore <= 100 &&
      inputs.liquidityScore >= 0 &&
      inputs.liquidityScore <= 100 &&
      inputs.tokenomicsScore >= 0 &&
      inputs.tokenomicsScore <= 100
    )
  }, [inputs])

  return {
    // Current state
    result,
    inputs,
    isValid,

    // Derived values
    description,
    colors,
    recommendation,

    // Actions
    calculate,
    updateSecurityScore,
    updateLiquidityScore,
    updateTokenomicsScore,
    updateAllScores,
    reset,

    // Convenience getters
    finalRiskScore: result?.finalRiskScore ?? null,
    riskLevel: result?.riskLevel ?? null,
    breakdown: result?.breakdown ?? null,
    weights: result?.weights ?? null,
  }
}
