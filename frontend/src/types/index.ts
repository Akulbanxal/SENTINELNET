// ============================================
// CORE TYPES
// ============================================

export interface Agent {
  address: string
  name: string
  agentType: number
  agentTypeName: string
  specialization: string
  pricePerVerification: string
  reputation: number
  totalJobs: number
  successfulJobs: number
  isActive: boolean
  lastActive?: number
  currentJob?: string
}

export interface RiskScores {
  securityScore: number
  liquidityScore: number
  tokenomicsScore: number
  overallScore: number
}

export interface AuditReport {
  id: string
  tokenAddress: string
  auditor: string
  auditorName: string
  agentType: string
  timestamp: number
  scores: RiskScores
  riskLevel: RiskLevel
  findings: string
  status: 'pending' | 'completed' | 'failed'
}

export interface TokenAuditData {
  tokenAddress: string
  tokenName?: string
  tokenSymbol?: string
  auditCount: number
  isSafe: boolean
  hasConsensus: boolean
  isBlacklisted: boolean
  reports: AuditReport[]
  aggregatedScores: {
    avgSecurityScore: number
    avgLiquidityScore: number
    avgTokenomicsScore: number
    avgOverallScore: number
    overallRiskLevel: RiskLevel
  }
}

export interface RiskAssessment {
  isSafe: boolean
  hasConsensus: boolean
  isBlacklisted: boolean
  auditCount: number
  overallScore: number
  riskLevel: RiskLevel
}

export interface TradeEvaluation {
  tokenAddress: string
  canTrade: boolean
  reason: string
  riskAssessment: RiskAssessment
  recommendation: TradeRecommendation
  confidenceScore: number
}

// ============================================
// SIMULATION TYPES
// ============================================

export interface SimulationConfig {
  speed: 'slow' | 'normal' | 'fast'
  autoAdvance: boolean
  enableNotifications: boolean
  simulateNetwork: boolean
}

export interface VerificationJob {
  id: string
  tokenAddress: string
  tokenName: string
  status: JobStatus
  assignedAgents: string[]
  startTime: number
  estimatedCompletion: number
  progress: number
  currentStep: VerificationStep
  results?: Partial<RiskScores>
}

export interface ActivityLog {
  id: string
  timestamp: number
  type: ActivityType
  message: string
  severity: 'info' | 'warning' | 'error' | 'success'
  metadata?: Record<string, any>
}

export interface AgentActivity {
  agentAddress: string
  action: AgentAction
  timestamp: number
  jobId?: string
  result?: any
}

export interface SimulationState {
  isRunning: boolean
  currentJobs: VerificationJob[]
  completedJobs: number
  activeAgents: number
  queuedTokens: MockToken[]
  activityLog: ActivityLog[]
}

export interface MockToken {
  address: string
  name: string
  symbol: string
  scenario: TokenScenario
  expectedOutcome: TradeRecommendation
  mockData: {
    security: {
      hasOwnership: boolean
      hasMint: boolean
      hasBlacklist: boolean
      hasPausable: boolean
      hasProxyPattern: boolean
      score: number
    }
    liquidity: {
      poolSize: string
      volume24h: string
      holders: number
      liquidity: string
      score: number
    }
    tokenomics: {
      totalSupply: string
      circulatingSupply: string
      topHolderPercentage: number
      burnPercentage: number
      score: number
    }
  }
}

// ============================================
// ENUMS AND UNION TYPES
// ============================================

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type TradeRecommendation = 'EXECUTE' | 'CAUTION' | 'REJECT'

export type JobStatus = 'queued' | 'in-progress' | 'completed' | 'failed'

export type VerificationStep = 
  | 'discovery'
  | 'hiring-agents'
  | 'security-analysis'
  | 'liquidity-analysis'
  | 'tokenomics-analysis'
  | 'risk-aggregation'
  | 'decision-making'

export type ActivityType = 
  | 'token-discovered'
  | 'agent-hired'
  | 'audit-started'
  | 'audit-completed'
  | 'risk-calculated'
  | 'trade-decision'
  | 'system-event'
  | 'error'

export type AgentAction = 
  | 'registered'
  | 'hired'
  | 'analyzing'
  | 'completed-audit'
  | 'submitted-report'
  | 'reputation-updated'

export type TokenScenario = 'safe' | 'risky' | 'medium' | 'custom'

export type AgentType = 'security' | 'liquidity' | 'tokenomics' | 'market'

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: {
    items: T[]
    total: number
    page: number
    pageSize: number
    hasMore: boolean
  }
}

// ============================================
// WEBSOCKET TYPES
// ============================================

export interface WebSocketMessage {
  type: 'agent-update' | 'audit-complete' | 'new-job' | 'system-status'
  payload: any
  timestamp: number
}

// ============================================
// CHART DATA TYPES
// ============================================

export interface RadarChartData {
  metric: string
  score: number
  fullMark: number
}

export interface PieChartData {
  name: string
  value: number
  color: string
}

export interface TimeSeriesData {
  timestamp: number
  value: number
  label?: string
}

// ============================================
// UTILITY TYPES
// ============================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
  }[Keys]
