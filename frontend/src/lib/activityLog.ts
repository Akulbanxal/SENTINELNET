/**
 * System Activity Log
 * 
 * Records and manages all system events for real-time monitoring
 * and audit trails.
 */

export type ActivityType =
  | 'token_discovered'
  | 'security_started'
  | 'security_completed'
  | 'security_failed'
  | 'liquidity_started'
  | 'liquidity_completed'
  | 'liquidity_failed'
  | 'tokenomics_started'
  | 'tokenomics_completed'
  | 'tokenomics_failed'
  | 'risk_calculated'
  | 'trade_approved'
  | 'trade_rejected'
  | 'trade_review'
  | 'job_created'
  | 'job_started'
  | 'job_completed'
  | 'job_failed'
  | 'system_info'
  | 'system_warning'
  | 'system_error'

export type ActivityLevel = 'info' | 'success' | 'warning' | 'error'

export interface ActivityLogEntry {
  id: string
  timestamp: Date
  type: ActivityType
  level: ActivityLevel
  message: string
  metadata?: Record<string, any>
  agentName?: string
  tokenAddress?: string
  jobId?: string
  score?: number
  decision?: string
}

export interface ActivityFilter {
  types?: ActivityType[]
  levels?: ActivityLevel[]
  agentName?: string
  tokenAddress?: string
  jobId?: string
  startDate?: Date
  endDate?: Date
}

export interface ActivityStats {
  totalActivities: number
  byType: Record<ActivityType, number>
  byLevel: Record<ActivityLevel, number>
  recentCount: number
}

// In-memory activity log storage
const activityLog: ActivityLogEntry[] = []

// Activity listeners for real-time updates
type ActivityListener = (entry: ActivityLogEntry) => void
const activityListeners = new Set<ActivityListener>()

// Configuration
const MAX_LOG_ENTRIES = 1000 // Keep last 1000 entries
const AUTO_CLEANUP_THRESHOLD = 1200 // Cleanup when exceeds this

/**
 * Generate a unique activity ID
 */
function generateActivityId(): string {
  return `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Determine activity level based on type
 */
function getActivityLevel(type: ActivityType): ActivityLevel {
  if (type.includes('failed') || type === 'system_error' || type === 'trade_rejected') {
    return 'error'
  }
  if (type.includes('completed') || type === 'trade_approved') {
    return 'success'
  }
  if (type.includes('started') || type === 'system_warning' || type === 'trade_review') {
    return 'warning'
  }
  return 'info'
}

/**
 * Log a system activity
 * @param message - The activity message
 * @param options - Optional metadata for the activity
 * @returns The created activity entry
 */
export function logActivity(
  message: string,
  options?: {
    type?: ActivityType
    level?: ActivityLevel
    metadata?: Record<string, any>
    agentName?: string
    tokenAddress?: string
    jobId?: string
    score?: number
    decision?: string
  }
): ActivityLogEntry {
  const type = options?.type || 'system_info'
  const level = options?.level || getActivityLevel(type)

  const entry: ActivityLogEntry = {
    id: generateActivityId(),
    timestamp: new Date(),
    type,
    level,
    message,
    metadata: options?.metadata,
    agentName: options?.agentName,
    tokenAddress: options?.tokenAddress,
    jobId: options?.jobId,
    score: options?.score,
    decision: options?.decision,
  }

  // Add to log
  activityLog.unshift(entry) // Add to beginning for newest-first

  // Auto-cleanup if needed
  if (activityLog.length > AUTO_CLEANUP_THRESHOLD) {
    activityLog.splice(MAX_LOG_ENTRIES)
  }

  // Notify listeners
  activityListeners.forEach((listener) => {
    try {
      listener(entry)
    } catch (error) {
      console.error('Activity listener error:', error)
    }
  })

  return entry
}

/**
 * Subscribe to activity updates
 * @param listener - Callback function called on new activities
 * @returns Unsubscribe function
 */
export function subscribeToActivities(listener: ActivityListener): () => void {
  activityListeners.add(listener)
  return () => {
    activityListeners.delete(listener)
  }
}

/**
 * Get all activities
 * @param limit - Maximum number of activities to return
 * @returns Array of activity entries
 */
export function getAllActivities(limit?: number): ActivityLogEntry[] {
  return limit ? activityLog.slice(0, limit) : [...activityLog]
}

/**
 * Get filtered activities
 * @param filter - Filter criteria
 * @param limit - Maximum number of activities to return
 * @returns Array of filtered activity entries
 */
export function getFilteredActivities(
  filter: ActivityFilter,
  limit?: number
): ActivityLogEntry[] {
  const filtered = activityLog.filter((entry) => {
    // Filter by types
    if (filter.types && !filter.types.includes(entry.type)) {
      return false
    }

    // Filter by levels
    if (filter.levels && !filter.levels.includes(entry.level)) {
      return false
    }

    // Filter by agent name
    if (filter.agentName && entry.agentName !== filter.agentName) {
      return false
    }

    // Filter by token address
    if (filter.tokenAddress && entry.tokenAddress !== filter.tokenAddress) {
      return false
    }

    // Filter by job ID
    if (filter.jobId && entry.jobId !== filter.jobId) {
      return false
    }

    // Filter by date range
    if (filter.startDate && entry.timestamp < filter.startDate) {
      return false
    }
    if (filter.endDate && entry.timestamp > filter.endDate) {
      return false
    }

    return true
  })

  return limit ? filtered.slice(0, limit) : filtered
}

/**
 * Get activities by type
 */
export function getActivitiesByType(type: ActivityType, limit?: number): ActivityLogEntry[] {
  return getFilteredActivities({ types: [type] }, limit)
}

/**
 * Get activities by level
 */
export function getActivitiesByLevel(level: ActivityLevel, limit?: number): ActivityLogEntry[] {
  return getFilteredActivities({ levels: [level] }, limit)
}

/**
 * Get activities for a specific job
 */
export function getJobActivities(jobId: string): ActivityLogEntry[] {
  return getFilteredActivities({ jobId })
}

/**
 * Get activities for a specific token
 */
export function getTokenActivities(tokenAddress: string): ActivityLogEntry[] {
  return getFilteredActivities({ tokenAddress })
}

/**
 * Get activity statistics
 */
export function getActivityStats(): ActivityStats {
  const byType: Record<string, number> = {}
  const byLevel: Record<string, number> = {}

  activityLog.forEach((entry) => {
    byType[entry.type] = (byType[entry.type] || 0) + 1
    byLevel[entry.level] = (byLevel[entry.level] || 0) + 1
  })

  // Get activities from last 5 minutes
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
  const recentCount = activityLog.filter((e) => e.timestamp >= fiveMinutesAgo).length

  return {
    totalActivities: activityLog.length,
    byType: byType as Record<ActivityType, number>,
    byLevel: byLevel as Record<ActivityLevel, number>,
    recentCount,
  }
}

/**
 * Clear all activities
 */
export function clearActivities(): void {
  activityLog.length = 0
}

/**
 * Clear old activities (older than specified time)
 */
export function clearOldActivities(olderThanMs: number): number {
  const cutoffTime = new Date(Date.now() - olderThanMs)
  const originalLength = activityLog.length

  const filtered = activityLog.filter((entry) => entry.timestamp >= cutoffTime)
  activityLog.length = 0
  activityLog.push(...filtered)

  return originalLength - activityLog.length
}

// ============================================================================
// Convenience Functions for Common Activities
// ============================================================================

/**
 * Log token discovery
 */
export function logTokenDiscovered(tokenAddress: string, metadata?: Record<string, any>) {
  return logActivity(`TraderAgent discovered token ${tokenAddress}`, {
    type: 'token_discovered',
    agentName: 'TraderAgent',
    tokenAddress,
    metadata,
  })
}

/**
 * Log security bot started
 */
export function logSecurityStarted(tokenAddress?: string, jobId?: string) {
  return logActivity('SecurityBot started analysis', {
    type: 'security_started',
    agentName: 'SecurityBot',
    tokenAddress,
    jobId,
  })
}

/**
 * Log security bot completed
 */
export function logSecurityCompleted(
  score: number,
  tokenAddress?: string,
  jobId?: string,
  metadata?: Record<string, any>
) {
  return logActivity(`SecurityBot completed analysis - Score: ${score}`, {
    type: 'security_completed',
    agentName: 'SecurityBot',
    tokenAddress,
    jobId,
    score,
    metadata,
  })
}

/**
 * Log security bot failed
 */
export function logSecurityFailed(error: string, tokenAddress?: string, jobId?: string) {
  return logActivity(`SecurityBot failed: ${error}`, {
    type: 'security_failed',
    agentName: 'SecurityBot',
    tokenAddress,
    jobId,
    metadata: { error },
  })
}

/**
 * Log liquidity scanner started
 */
export function logLiquidityStarted(tokenAddress?: string, jobId?: string) {
  return logActivity('LiquidityScanner started', {
    type: 'liquidity_started',
    agentName: 'LiquidityScanner',
    tokenAddress,
    jobId,
  })
}

/**
 * Log liquidity scanner completed
 */
export function logLiquidityCompleted(
  score: number,
  tokenAddress?: string,
  jobId?: string,
  metadata?: Record<string, any>
) {
  return logActivity(`LiquidityScanner completed - Score: ${score}`, {
    type: 'liquidity_completed',
    agentName: 'LiquidityScanner',
    tokenAddress,
    jobId,
    score,
    metadata,
  })
}

/**
 * Log liquidity scanner failed
 */
export function logLiquidityFailed(error: string, tokenAddress?: string, jobId?: string) {
  return logActivity(`LiquidityScanner failed: ${error}`, {
    type: 'liquidity_failed',
    agentName: 'LiquidityScanner',
    tokenAddress,
    jobId,
    metadata: { error },
  })
}

/**
 * Log tokenomics analyzer started
 */
export function logTokenomicsStarted(tokenAddress?: string, jobId?: string) {
  return logActivity('TokenomicsAnalyzer started', {
    type: 'tokenomics_started',
    agentName: 'TokenomicsAnalyzer',
    tokenAddress,
    jobId,
  })
}

/**
 * Log tokenomics analyzer completed
 */
export function logTokenomicsCompleted(
  score: number,
  tokenAddress?: string,
  jobId?: string,
  metadata?: Record<string, any>
) {
  return logActivity(`TokenomicsAnalyzer completed - Score: ${score}`, {
    type: 'tokenomics_completed',
    agentName: 'TokenomicsAnalyzer',
    tokenAddress,
    jobId,
    score,
    metadata,
  })
}

/**
 * Log tokenomics analyzer failed
 */
export function logTokenomicsFailed(error: string, tokenAddress?: string, jobId?: string) {
  return logActivity(`TokenomicsAnalyzer failed: ${error}`, {
    type: 'tokenomics_failed',
    agentName: 'TokenomicsAnalyzer',
    tokenAddress,
    jobId,
    metadata: { error },
  })
}

/**
 * Log risk calculation
 */
export function logRiskCalculated(
  finalScore: number,
  riskLevel: string,
  tokenAddress?: string,
  jobId?: string
) {
  return logActivity(
    `Risk engine calculated score: ${finalScore} (${riskLevel})`,
    {
      type: 'risk_calculated',
      tokenAddress,
      jobId,
      score: finalScore,
      metadata: { riskLevel },
    }
  )
}

/**
 * Log trade approved
 */
export function logTradeApproved(
  tokenAddress: string,
  score: number,
  jobId?: string,
  metadata?: Record<string, any>
) {
  return logActivity(`Trade APPROVED for ${tokenAddress} (Score: ${score})`, {
    type: 'trade_approved',
    decision: 'APPROVE',
    tokenAddress,
    jobId,
    score,
    metadata,
  })
}

/**
 * Log trade rejected
 */
export function logTradeRejected(
  tokenAddress: string,
  score: number,
  jobId?: string,
  metadata?: Record<string, any>
) {
  return logActivity(`Trade REJECTED for ${tokenAddress} (Score: ${score})`, {
    type: 'trade_rejected',
    decision: 'REJECT',
    tokenAddress,
    jobId,
    score,
    metadata,
  })
}

/**
 * Log trade review needed
 */
export function logTradeReview(
  tokenAddress: string,
  score: number,
  jobId?: string,
  metadata?: Record<string, any>
) {
  return logActivity(`Trade needs REVIEW for ${tokenAddress} (Score: ${score})`, {
    type: 'trade_review',
    decision: 'REVIEW',
    tokenAddress,
    jobId,
    score,
    metadata,
  })
}

/**
 * Log job created
 */
export function logJobCreated(jobId: string, tokenAddress: string) {
  return logActivity(`Verification job created: ${jobId}`, {
    type: 'job_created',
    jobId,
    tokenAddress,
  })
}

/**
 * Log job started
 */
export function logJobStarted(jobId: string, tokenAddress: string) {
  return logActivity(`Verification job started: ${jobId}`, {
    type: 'job_started',
    jobId,
    tokenAddress,
  })
}

/**
 * Log job completed
 */
export function logJobCompleted(jobId: string, tokenAddress: string, decision: string, score: number) {
  return logActivity(`Verification job completed: ${jobId} - ${decision}`, {
    type: 'job_completed',
    jobId,
    tokenAddress,
    decision,
    score,
  })
}

/**
 * Log job failed
 */
export function logJobFailed(jobId: string, tokenAddress: string, error: string) {
  return logActivity(`Verification job failed: ${jobId}`, {
    type: 'job_failed',
    jobId,
    tokenAddress,
    metadata: { error },
  })
}

/**
 * Export activity logger object with all functions
 */
export const ActivityLogger = {
  // Core functions
  log: logActivity,
  subscribe: subscribeToActivities,
  getAll: getAllActivities,
  getFiltered: getFilteredActivities,
  getByType: getActivitiesByType,
  getByLevel: getActivitiesByLevel,
  getJobActivities,
  getTokenActivities,
  getStats: getActivityStats,
  clear: clearActivities,
  clearOld: clearOldActivities,

  // Convenience functions
  tokenDiscovered: logTokenDiscovered,
  securityStarted: logSecurityStarted,
  securityCompleted: logSecurityCompleted,
  securityFailed: logSecurityFailed,
  liquidityStarted: logLiquidityStarted,
  liquidityCompleted: logLiquidityCompleted,
  liquidityFailed: logLiquidityFailed,
  tokenomicsStarted: logTokenomicsStarted,
  tokenomicsCompleted: logTokenomicsCompleted,
  tokenomicsFailed: logTokenomicsFailed,
  riskCalculated: logRiskCalculated,
  tradeApproved: logTradeApproved,
  tradeRejected: logTradeRejected,
  tradeReview: logTradeReview,
  jobCreated: logJobCreated,
  jobStarted: logJobStarted,
  jobCompleted: logJobCompleted,
  jobFailed: logJobFailed,
}

export default ActivityLogger
