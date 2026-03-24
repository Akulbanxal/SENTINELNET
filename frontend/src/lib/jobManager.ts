/**
 * Verification Job Manager
 * 
 * Manages the lifecycle of token verification jobs, orchestrating
 * the three autonomous agents and aggregating their results.
 */

import {
  runSecurityBot,
  runLiquidityScanner,
  runTokenomicsAnalyzer,
  agentEventEmitter,
  type AgentSimulationResult,
  type AgentEvent,
} from './agentSimulation'
import {
  aggregateRiskScores,
  getTradeRecommendation,
  type RiskAggregationResult,
} from './riskAggregation'
import {
  logJobCreated,
  logJobStarted,
  logJobCompleted,
  logJobFailed,
  logSecurityStarted,
  logSecurityCompleted,
  logSecurityFailed,
  logLiquidityStarted,
  logLiquidityCompleted,
  logLiquidityFailed,
  logTokenomicsStarted,
  logTokenomicsCompleted,
  logTokenomicsFailed,
  logRiskCalculated,
  logTradeApproved,
  logTradeRejected,
  logTradeReview,
} from './activityLog'

export type JobStatus = 
  | 'pending'      // Job created, not started
  | 'running'      // Job in progress
  | 'completed'    // Job finished successfully
  | 'failed'       // Job failed

export type JobDecision = 'APPROVE' | 'REVIEW' | 'REJECT' | null

export interface VerificationJob {
  jobId: string
  tokenAddress: string
  status: JobStatus
  securityScore: number | null
  liquidityScore: number | null
  tokenomicsScore: number | null
  finalRiskScore: number | null
  decision: JobDecision
  createdAt: Date
  startedAt: Date | null
  completedAt: Date | null
  error: string | null
  agentResults: {
    security: AgentSimulationResult | null
    liquidity: AgentSimulationResult | null
    tokenomics: AgentSimulationResult | null
  }
  riskAggregation: RiskAggregationResult | null
}

export interface JobManagerStats {
  totalJobs: number
  pendingJobs: number
  runningJobs: number
  completedJobs: number
  failedJobs: number
  averageProcessingTime: number
}

// In-memory job storage
const jobs = new Map<string, VerificationJob>()
// Cache completed results by token address to provide deterministic results
const completedJobCache = new Map<string, VerificationJob>()

// Job event listeners
type JobEventType = 'created' | 'started' | 'progress' | 'completed' | 'failed'
type JobEventListener = (job: VerificationJob, event?: AgentEvent) => void

const jobEventListeners = new Map<JobEventType, Set<JobEventListener>>()

/**
 * Generate a unique job ID
 */
function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Subscribe to job events
 * @param eventType - The type of event to listen for
 * @param listener - The callback function
 * @returns Unsubscribe function
 */
export function subscribeToJobEvents(
  eventType: JobEventType,
  listener: JobEventListener
): () => void {
  if (!jobEventListeners.has(eventType)) {
    jobEventListeners.set(eventType, new Set())
  }
  
  jobEventListeners.get(eventType)!.add(listener)
  
  return () => {
    jobEventListeners.get(eventType)?.delete(listener)
  }
}

/**
 * Emit a job event to all listeners
 */
function emitJobEvent(
  eventType: JobEventType,
  job: VerificationJob,
  agentEvent?: AgentEvent
): void {
  const listeners = jobEventListeners.get(eventType)
  if (listeners) {
    listeners.forEach((listener) => listener(job, agentEvent))
  }
}

/**
 * Create a new verification job
 * @param tokenAddress - The token address to verify
 * @returns The created job
 */
export function createVerificationJob(tokenAddress: string): VerificationJob {
  // Validate token address
  if (!tokenAddress || typeof tokenAddress !== 'string') {
    throw new Error('Invalid token address')
  }

  // Basic Ethereum address validation
  if (!/^0x[a-fA-F0-9]{40}$/.test(tokenAddress)) {
    throw new Error('Invalid Ethereum address format')
  }

  const job: VerificationJob = {
    jobId: generateJobId(),
    tokenAddress,
    status: 'pending',
    securityScore: null,
    liquidityScore: null,
    tokenomicsScore: null,
    finalRiskScore: null,
    decision: null,
    createdAt: new Date(),
    startedAt: null,
    completedAt: null,
    error: null,
    agentResults: {
      security: null,
      liquidity: null,
      tokenomics: null,
    },
    riskAggregation: null,
  }

  // Store job
  jobs.set(job.jobId, job)

  // Log activity
  logJobCreated(job.jobId, job.tokenAddress)

  // Emit created event
  emitJobEvent('created', job)

  // If we have a cached completed result for this token, attach a reference
  const cached = completedJobCache.get(tokenAddress.toLowerCase())
  if (cached) {
    // merge deterministic results into job to surface consistent outcome
    job.securityScore = cached.securityScore
    job.liquidityScore = cached.liquidityScore
    job.tokenomicsScore = cached.tokenomicsScore
    job.finalRiskScore = cached.finalRiskScore
    job.decision = cached.decision
    job.agentResults = cached.agentResults
    job.riskAggregation = cached.riskAggregation
  }

  return job
}

/**
 * Run a verification job by executing all three agents sequentially
 * @param job - The job to run
 * @returns The updated job with results
 */
export async function runVerificationJob(job: VerificationJob): Promise<VerificationJob> {
  // Validate job
  if (!job || !job.jobId) {
    throw new Error('Invalid job')
  }

  // Check if job is already running or completed
  if (job.status === 'running') {
    throw new Error(`Job ${job.jobId} is already running`)
  }
  if (job.status === 'completed') {
    throw new Error(`Job ${job.jobId} is already completed`)
  }

  // Update job status
  job.status = 'running'
  job.startedAt = new Date()
  job.error = null

  // Update stored job
  jobs.set(job.jobId, job)

  // Log activity
  logJobStarted(job.jobId, job.tokenAddress)

  // Emit started event
  emitJobEvent('started', job)

  try {
    // Subscribe to agent events for this job
    const agentEventHandler = (event: AgentEvent) => {
      emitJobEvent('progress', job, event)
    }

    const unsubscribeStarted = agentEventEmitter.subscribe('started', agentEventHandler)
    const unsubscribeProgress = agentEventEmitter.subscribe('progress', agentEventHandler)
    const unsubscribeCompleted = agentEventEmitter.subscribe('completed', agentEventHandler)

    try {
      // Step 1: Run Security Bot
      console.log(`[Job ${job.jobId}] Running SecurityBot for ${job.tokenAddress}`)
      logSecurityStarted(job.tokenAddress, job.jobId)
      
      const securityResult = await runSecurityBot()
      
      job.agentResults.security = securityResult
      job.securityScore = securityResult.score
      jobs.set(job.jobId, job)
      
      if (securityResult.status === 'success') {
        logSecurityCompleted(securityResult.score, job.tokenAddress, job.jobId, {
          findings: securityResult.findings,
        })
      } else {
        logSecurityFailed('Agent execution failed', job.tokenAddress, job.jobId)
      }
      
      emitJobEvent('progress', job)

      // Step 2: Run Liquidity Scanner
      console.log(`[Job ${job.jobId}] Running LiquidityScanner for ${job.tokenAddress}`)
      // Step 2: Run Liquidity Scanner
      console.log(`[Job ${job.jobId}] Running LiquidityScanner for ${job.tokenAddress}`)
      logLiquidityStarted(job.tokenAddress, job.jobId)
      
      const liquidityResult = await runLiquidityScanner()
      
      job.agentResults.liquidity = liquidityResult
      job.liquidityScore = liquidityResult.score
      jobs.set(job.jobId, job)
      
      if (liquidityResult.status === 'success') {
        logLiquidityCompleted(liquidityResult.score, job.tokenAddress, job.jobId, {
          findings: liquidityResult.findings,
        })
      } else {
        logLiquidityFailed('Agent execution failed', job.tokenAddress, job.jobId)
      }
      
      emitJobEvent('progress', job)

      // Step 3: Run Tokenomics Analyzer
      console.log(`[Job ${job.jobId}] Running TokenomicsAnalyzer for ${job.tokenAddress}`)
      logTokenomicsStarted(job.tokenAddress, job.jobId)
      
      const tokenomicsResult = await runTokenomicsAnalyzer()
      
      job.agentResults.tokenomics = tokenomicsResult
      job.tokenomicsScore = tokenomicsResult.score
      jobs.set(job.jobId, job)
      
      if (tokenomicsResult.status === 'success') {
        logTokenomicsCompleted(tokenomicsResult.score, job.tokenAddress, job.jobId, {
          findings: tokenomicsResult.findings,
        })
      } else {
        logTokenomicsFailed('Agent execution failed', job.tokenAddress, job.jobId)
      }
      
      emitJobEvent('progress', job)

      // Step 4: Aggregate risk scores
      console.log(`[Job ${job.jobId}] Aggregating risk scores`)
      const riskAggregation = aggregateRiskScores({
        securityScore: securityResult.score,
        liquidityScore: liquidityResult.score,
        tokenomicsScore: tokenomicsResult.score,
      })

      job.riskAggregation = riskAggregation
      job.finalRiskScore = riskAggregation.finalRiskScore
      job.decision = getTradeRecommendation(riskAggregation.riskLevel) as JobDecision

      // Log risk calculation
      logRiskCalculated(
        riskAggregation.finalRiskScore,
        riskAggregation.riskLevel,
        job.tokenAddress,
        job.jobId
      )

      // Log trade decision
      if (job.decision === 'APPROVE') {
        logTradeApproved(job.tokenAddress, job.finalRiskScore, job.jobId)
      } else if (job.decision === 'REJECT') {
        logTradeRejected(job.tokenAddress, job.finalRiskScore, job.jobId)
      } else if (job.decision === 'REVIEW') {
        logTradeReview(job.tokenAddress, job.finalRiskScore, job.jobId)
      }

      // Complete the job
      await completeVerificationJob(job)

  // Cache completed results for deterministic repeat queries
  if (job.decision) {
        try {
          completedJobCache.set(job.tokenAddress.toLowerCase(), { ...job })
        } catch (err) {
          // ignore cache errors
        }
      }

      return job
    } finally {
      // Cleanup event listeners
      unsubscribeStarted()
      unsubscribeProgress()
      unsubscribeCompleted()
    }
  } catch (error) {
    // Handle error
    job.status = 'failed'
    job.error = error instanceof Error ? error.message : 'Unknown error'
    job.completedAt = new Date()
    
    jobs.set(job.jobId, job)
    
    // Log failure
    logJobFailed(job.jobId, job.tokenAddress, job.error)
    
    emitJobEvent('failed', job)

    console.error(`[Job ${job.jobId}] Failed:`, error)
    throw error
  }
}

/**
 * Complete a verification job
 * @param job - The job to complete
 * @returns The completed job
 */
export async function completeVerificationJob(
  job: VerificationJob
): Promise<VerificationJob> {
  // Validate job has all required results
  if (
    job.securityScore === null ||
    job.liquidityScore === null ||
    job.tokenomicsScore === null ||
    job.finalRiskScore === null ||
    job.decision === null
  ) {
    throw new Error('Cannot complete job: missing required results')
  }

  // Update job status
  job.status = 'completed'
  job.completedAt = new Date()

  // Update stored job
  jobs.set(job.jobId, job)

  // Log completion
  logJobCompleted(job.jobId, job.tokenAddress, job.decision!, job.finalRiskScore!)

  // Emit completed event
  emitJobEvent('completed', job)

  console.log(
    `[Job ${job.jobId}] Completed - Final Score: ${job.finalRiskScore}, Decision: ${job.decision}`
  )

  return job
}

/**
 * Get a job by ID
 * @param jobId - The job ID
 * @returns The job or undefined if not found
 */
export function getJob(jobId: string): VerificationJob | undefined {
  return jobs.get(jobId)
}

/**
 * Get all jobs
 * @returns Array of all jobs
 */
export function getAllJobs(): VerificationJob[] {
  return Array.from(jobs.values())
}

/**
 * Get jobs by status
 * @param status - The status to filter by
 * @returns Array of jobs with the given status
 */
export function getJobsByStatus(status: JobStatus): VerificationJob[] {
  return Array.from(jobs.values()).filter((job) => job.status === status)
}

/**
 * Get jobs by token address
 * @param tokenAddress - The token address
 * @returns Array of jobs for the given token
 */
export function getJobsByToken(tokenAddress: string): VerificationJob[] {
  return Array.from(jobs.values()).filter(
    (job) => job.tokenAddress.toLowerCase() === tokenAddress.toLowerCase()
  )
}

/**
 * Get the latest job for a token address
 * @param tokenAddress - The token address
 * @returns The most recent job for the token, or undefined
 */
export function getLatestJobForToken(tokenAddress: string): VerificationJob | undefined {
  const tokenJobs = getJobsByToken(tokenAddress)
  if (tokenJobs.length === 0) return undefined

  return tokenJobs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]
}

/**
 * Delete a job
 * @param jobId - The job ID to delete
 * @returns True if deleted, false if not found
 */
export function deleteJob(jobId: string): boolean {
  return jobs.delete(jobId)
}

/**
 * Clear all jobs
 */
export function clearAllJobs(): void {
  jobs.clear()
}

/**
 * Get job manager statistics
 * @returns Statistics about all jobs
 */
export function getJobStats(): JobManagerStats {
  const allJobs = getAllJobs()
  
  const completedJobs = allJobs.filter((job) => job.status === 'completed')
  
  // Calculate average processing time for completed jobs
  let averageProcessingTime = 0
  if (completedJobs.length > 0) {
    const totalTime = completedJobs.reduce((sum, job) => {
      if (job.startedAt && job.completedAt) {
        return sum + (job.completedAt.getTime() - job.startedAt.getTime())
      }
      return sum
    }, 0)
    averageProcessingTime = totalTime / completedJobs.length
  }

  return {
    totalJobs: allJobs.length,
    pendingJobs: getJobsByStatus('pending').length,
    runningJobs: getJobsByStatus('running').length,
    completedJobs: completedJobs.length,
    failedJobs: getJobsByStatus('failed').length,
    averageProcessingTime,
  }
}

/**
 * Create and run a verification job in one step
 * @param tokenAddress - The token address to verify
 * @returns The completed job
 */
export async function verifyToken(tokenAddress: string): Promise<VerificationJob> {
  // If we have a cached completed result, return a cloned copy
  const cached = completedJobCache.get(tokenAddress.toLowerCase())
  if (cached) {
    // return a shallow clone to avoid accidental mutation
    return { ...cached }
  }

  const job = createVerificationJob(tokenAddress)
  return await runVerificationJob(job)
}

/**
 * Batch verify multiple tokens
 * @param tokenAddresses - Array of token addresses
 * @param parallel - Whether to run jobs in parallel (default: false)
 * @returns Array of completed jobs
 */
export async function batchVerifyTokens(
  tokenAddresses: string[],
  parallel: boolean = false
): Promise<VerificationJob[]> {
  if (parallel) {
    // Run all jobs in parallel
    const jobPromises = tokenAddresses.map((address) => verifyToken(address))
    return await Promise.all(jobPromises)
  } else {
    // Run jobs sequentially
    const results: VerificationJob[] = []
    for (const address of tokenAddresses) {
      const job = await verifyToken(address)
      results.push(job)
    }
    return results
  }
}

/**
 * Get job processing duration in milliseconds
 * @param job - The job
 * @returns Duration in milliseconds, or null if not applicable
 */
export function getJobDuration(job: VerificationJob): number | null {
  if (!job.startedAt) return null
  
  const endTime = job.completedAt || new Date()
  return endTime.getTime() - job.startedAt.getTime()
}

/**
 * Format job duration as human-readable string
 * @param job - The job
 * @returns Formatted duration string
 */
export function formatJobDuration(job: VerificationJob): string {
  const duration = getJobDuration(job)
  if (duration === null) return 'Not started'
  
  const seconds = Math.floor(duration / 1000)
  const minutes = Math.floor(seconds / 60)
  
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  }
  return `${seconds}s`
}

/**
 * Export job manager utilities
 */
export const JobManager = {
  // Job lifecycle
  createJob: createVerificationJob,
  runJob: runVerificationJob,
  completeJob: completeVerificationJob,
  verifyToken,
  batchVerify: batchVerifyTokens,
  
  // Job retrieval
  getJob,
  getAllJobs,
  getJobsByStatus,
  getJobsByToken,
  getLatestJobForToken,
  
  // Job management
  deleteJob,
  clearAllJobs,
  
  // Statistics
  getStats: getJobStats,
  getDuration: getJobDuration,
  formatDuration: formatJobDuration,
  
  // Events
  subscribeToEvents: subscribeToJobEvents,
}

// Default export
export default JobManager
