import type { RiskLevel, TradeRecommendation, AgentType } from '@/types'

// ============================================
// RISK SCORING UTILITIES
// ============================================

export function calculateOverallScore(
  securityScore: number,
  liquidityScore: number,
  tokenomicsScore: number
): number {
  // Weighted average: Security 40%, Liquidity 30%, Tokenomics 30%
  const weighted =
    securityScore * 0.4 + liquidityScore * 0.3 + tokenomicsScore * 0.3
  return Math.round(weighted)
}

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 80) return 'LOW'
  if (score >= 60) return 'MEDIUM'
  if (score >= 40) return 'HIGH'
  return 'CRITICAL'
}

export function getTradeRecommendation(
  score: number,
  hasConsensus: boolean,
  isBlacklisted: boolean
): TradeRecommendation {
  if (isBlacklisted) return 'REJECT'
  if (!hasConsensus) return 'CAUTION'
  if (score >= 80) return 'EXECUTE'
  if (score >= 60) return 'CAUTION'
  return 'REJECT'
}

// ============================================
// COLOR UTILITIES
// ============================================

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-success'
  if (score >= 60) return 'text-warning'
  return 'text-danger'
}

export function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-success'
  if (score >= 60) return 'bg-warning'
  return 'bg-danger'
}

export function getRiskLevelColor(level: RiskLevel | string): string {
  const normalized = level.toLowerCase()
  switch (normalized) {
    case 'low':
      return 'badge-success'
    case 'medium':
      return 'badge-warning'
    case 'high':
      return 'badge-danger'
    case 'critical':
      return 'badge-danger'
    default:
      return 'badge-info'
  }
}

export function getRecommendationColor(
  recommendation: TradeRecommendation | string
): string {
  switch (recommendation) {
    case 'EXECUTE':
      return 'text-success'
    case 'CAUTION':
      return 'text-warning'
    case 'REJECT':
      return 'text-danger'
    default:
      return 'text-gray-400'
  }
}

export function getRecommendationBg(
  recommendation: TradeRecommendation | string
): string {
  switch (recommendation) {
    case 'EXECUTE':
      return 'bg-success/20 border-success'
    case 'CAUTION':
      return 'bg-warning/20 border-warning'
    case 'REJECT':
      return 'bg-danger/20 border-danger'
    default:
      return 'bg-gray-800 border-gray-700'
  }
}

export function getAgentColor(type: AgentType | string): string {
  const normalized = type.toLowerCase()
  switch (normalized) {
    case 'security':
      return 'text-primary'
    case 'liquidity':
      return 'text-accent-cyan'
    case 'tokenomics':
      return 'text-accent-purple'
    case 'market':
      return 'text-success'
    default:
      return 'text-gray-400'
  }
}

export function getReputationColor(reputation: number): string {
  if (reputation >= 90) return 'text-success'
  if (reputation >= 70) return 'text-warning'
  return 'text-danger'
}

// ============================================
// CHART COLOR PALETTES
// ============================================

export const CHART_COLORS = {
  security: '#3b82f6', // blue
  liquidity: '#06b6d4', // cyan
  tokenomics: '#a855f7', // purple
  market: '#10b981', // green
}

export const SCORE_COLORS = {
  excellent: '#10b981', // green
  good: '#3b82f6', // blue
  moderate: '#f59e0b', // yellow/orange
  poor: '#ef4444', // red
}

// ============================================
// FORMATTING UTILITIES
// ============================================

export function formatAddress(address: string, chars: number = 4): string {
  if (!address) return ''
  if (address.length <= chars * 2 + 2) return address
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleString()
}

export function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export function formatNumber(num: number, decimals: number = 2): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(decimals)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(decimals)}K`
  }
  return num.toFixed(decimals)
}

export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function formatEth(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return `${num.toFixed(4)} ETH`
}

// ============================================
// VALIDATION UTILITIES
// ============================================

export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

export function isValidTokenSymbol(symbol: string): boolean {
  return /^[A-Z0-9]{2,10}$/.test(symbol)
}

// ============================================
// PROGRESS UTILITIES
// ============================================

export function getProgressColor(progress: number): string {
  if (progress === 100) return 'bg-success'
  if (progress >= 75) return 'bg-accent-cyan'
  if (progress >= 50) return 'bg-primary'
  if (progress >= 25) return 'bg-warning'
  return 'bg-gray-600'
}

export function getStepProgress(currentStep: string): number {
  const steps = [
    'discovery',
    'hiring-agents',
    'security-analysis',
    'liquidity-analysis',
    'tokenomics-analysis',
    'risk-aggregation',
    'decision-making',
  ]
  
  const index = steps.indexOf(currentStep)
  if (index === -1) return 0
  
  return Math.round(((index + 1) / steps.length) * 100)
}

// ============================================
// DATA TRANSFORMATION UTILITIES
// ============================================

export function transformToRadarData(scores: {
  securityScore: number
  liquidityScore: number
  tokenomicsScore: number
}) {
  return [
    { metric: 'Security', score: scores.securityScore, fullMark: 100 },
    { metric: 'Liquidity', score: scores.liquidityScore, fullMark: 100 },
    { metric: 'Tokenomics', score: scores.tokenomicsScore, fullMark: 100 },
  ]
}

export function transformToPieData(scores: {
  securityScore: number
  liquidityScore: number
  tokenomicsScore: number
}) {
  return [
    {
      name: 'Security',
      value: scores.securityScore,
      color: CHART_COLORS.security,
    },
    {
      name: 'Liquidity',
      value: scores.liquidityScore,
      color: CHART_COLORS.liquidity,
    },
    {
      name: 'Tokenomics',
      value: scores.tokenomicsScore,
      color: CHART_COLORS.tokenomics,
    },
  ]
}

// ============================================
// TIMING UTILITIES
// ============================================

export function getEstimatedTime(step: string): number {
  const times = {
    discovery: 2000,
    'hiring-agents': 3000,
    'security-analysis': 5000,
    'liquidity-analysis': 4000,
    'tokenomics-analysis': 4000,
    'risk-aggregation': 3000,
    'decision-making': 2000,
  }
  
  return times[step as keyof typeof times] || 3000
}

export function getTotalEstimatedTime(): number {
  return 23000 // Total time for all steps
}
