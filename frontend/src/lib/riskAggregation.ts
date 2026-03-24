/**
 * Risk Aggregation Engine
 * 
 * Aggregates multiple risk scores into a final risk assessment
 * with weighted scoring and risk level classification.
 */

export type RiskLevel = 'SAFE' | 'WARNING' | 'DANGER'

export interface RiskScoreInputs {
  securityScore: number
  liquidityScore: number
  tokenomicsScore: number
}

export interface RiskAggregationResult {
  finalRiskScore: number
  riskLevel: RiskLevel
  breakdown: {
    securityContribution: number
    liquidityContribution: number
    tokenomicsContribution: number
  }
  weights: {
    security: number
    liquidity: number
    tokenomics: number
  }
}

/**
 * Weight configuration for risk score calculation
 * Security: 50% - Most critical for user safety
 * Liquidity: 30% - Important for trade execution
 * Tokenomics: 20% - Long-term sustainability indicator
 */
export const RISK_WEIGHTS = {
  security: 0.5,
  liquidity: 0.3,
  tokenomics: 0.2,
} as const

/**
 * Risk level thresholds
 * SAFE: 0-29 (Low risk, safe to trade)
 * WARNING: 30-60 (Moderate risk, proceed with caution)
 * DANGER: 61-100 (High risk, avoid trading)
 */
export const RISK_THRESHOLDS = {
  safe: 30,
  warning: 60,
} as const

/**
 * Validates that a score is within the valid range (0-100)
 * @param score - The score to validate
 * @param name - The name of the score for error messages
 * @throws Error if score is invalid
 */
function validateScore(score: number, name: string): void {
  if (typeof score !== 'number' || isNaN(score)) {
    throw new Error(`${name} must be a valid number`)
  }
  if (score < 0 || score > 100) {
    throw new Error(`${name} must be between 0 and 100, got ${score}`)
  }
}

/**
 * Determines the risk level based on the final risk score
 * @param score - The final risk score (0-100)
 * @returns The risk level classification
 */
function determineRiskLevel(score: number): RiskLevel {
  if (score < RISK_THRESHOLDS.safe) {
    return 'SAFE'
  } else if (score <= RISK_THRESHOLDS.warning) {
    return 'WARNING'
  } else {
    return 'DANGER'
  }
}

/**
 * Aggregates multiple risk scores into a final risk assessment
 * 
 * @param inputs - Object containing security, liquidity, and tokenomics scores
 * @returns Risk aggregation result with final score and risk level
 * 
 * @example
 * ```typescript
 * const result = aggregateRiskScores({
 *   securityScore: 25,
 *   liquidityScore: 40,
 *   tokenomicsScore: 35
 * })
 * // result.finalRiskScore = 30.5
 * // result.riskLevel = 'WARNING'
 * ```
 */
export function aggregateRiskScores(inputs: RiskScoreInputs): RiskAggregationResult {
  const { securityScore, liquidityScore, tokenomicsScore } = inputs

  // Validate all input scores
  validateScore(securityScore, 'securityScore')
  validateScore(liquidityScore, 'liquidityScore')
  validateScore(tokenomicsScore, 'tokenomicsScore')

  // Calculate weighted contributions
  const securityContribution = securityScore * RISK_WEIGHTS.security
  const liquidityContribution = liquidityScore * RISK_WEIGHTS.liquidity
  const tokenomicsContribution = tokenomicsScore * RISK_WEIGHTS.tokenomics

  // Calculate final risk score
  const finalRiskScore = 
    securityContribution +
    liquidityContribution +
    tokenomicsContribution

  // Round to 2 decimal places for cleaner output
  const roundedScore = Math.round(finalRiskScore * 100) / 100

  // Determine risk level
  const riskLevel = determineRiskLevel(roundedScore)

  return {
    finalRiskScore: roundedScore,
    riskLevel,
    breakdown: {
      securityContribution: Math.round(securityContribution * 100) / 100,
      liquidityContribution: Math.round(liquidityContribution * 100) / 100,
      tokenomicsContribution: Math.round(tokenomicsContribution * 100) / 100,
    },
    weights: {
      security: RISK_WEIGHTS.security,
      liquidity: RISK_WEIGHTS.liquidity,
      tokenomics: RISK_WEIGHTS.tokenomics,
    },
  }
}

/**
 * Get a human-readable description of the risk level
 * @param riskLevel - The risk level
 * @returns A descriptive string
 */
export function getRiskLevelDescription(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case 'SAFE':
      return 'Low risk - Safe to trade'
    case 'WARNING':
      return 'Moderate risk - Proceed with caution'
    case 'DANGER':
      return 'High risk - Avoid trading'
  }
}

/**
 * Get color coding for risk level (for UI display)
 * @param riskLevel - The risk level
 * @returns Object with color values for different UI contexts
 */
export function getRiskLevelColors(riskLevel: RiskLevel) {
  switch (riskLevel) {
    case 'SAFE':
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-300',
        badge: 'bg-green-500',
        hex: '#10b981',
      }
    case 'WARNING':
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-300',
        badge: 'bg-yellow-500',
        hex: '#f59e0b',
      }
    case 'DANGER':
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-300',
        badge: 'bg-red-500',
        hex: '#ef4444',
      }
  }
}

/**
 * Get trade recommendation based on risk level
 * @param riskLevel - The risk level
 * @returns Trade recommendation string
 */
export function getTradeRecommendation(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case 'SAFE':
      return 'APPROVE'
    case 'WARNING':
      return 'REVIEW'
    case 'DANGER':
      return 'REJECT'
  }
}

/**
 * Batch process multiple risk assessments
 * @param assessments - Array of risk score inputs
 * @returns Array of risk aggregation results
 */
export function batchAggregateRiskScores(
  assessments: RiskScoreInputs[]
): RiskAggregationResult[] {
  return assessments.map((inputs) => aggregateRiskScores(inputs))
}

/**
 * Calculate risk score change between two assessments
 * @param previous - Previous risk assessment
 * @param current - Current risk assessment
 * @returns Object with change amount and direction
 */
export function calculateRiskChange(
  previous: RiskAggregationResult,
  current: RiskAggregationResult
) {
  const change = current.finalRiskScore - previous.finalRiskScore
  const percentageChange = (change / previous.finalRiskScore) * 100

  return {
    absoluteChange: Math.round(change * 100) / 100,
    percentageChange: Math.round(percentageChange * 100) / 100,
    direction: change > 0 ? 'increased' : change < 0 ? 'decreased' : 'unchanged',
    levelChanged: previous.riskLevel !== current.riskLevel,
    previousLevel: previous.riskLevel,
    currentLevel: current.riskLevel,
  }
}

/**
 * Export all utility functions for convenience
 */
export const RiskAggregation = {
  aggregate: aggregateRiskScores,
  batchAggregate: batchAggregateRiskScores,
  getRiskLevel: determineRiskLevel,
  getDescription: getRiskLevelDescription,
  getColors: getRiskLevelColors,
  getRecommendation: getTradeRecommendation,
  calculateChange: calculateRiskChange,
  weights: RISK_WEIGHTS,
  thresholds: RISK_THRESHOLDS,
}

// Default export for convenience
export default aggregateRiskScores
