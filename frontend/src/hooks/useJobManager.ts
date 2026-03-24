import { useState, useEffect, useCallback } from 'react'
import {
  createVerificationJob,
  runVerificationJob,
  getAllJobs,
  getJobsByStatus,
  getJobsByToken,
  getLatestJobForToken,
  getJobStats,
  subscribeToJobEvents,
  clearAllJobs,
  type VerificationJob,
  type JobStatus,
  type JobManagerStats,
} from '@/lib/jobManager'
import type { AgentEvent } from '@/lib/agentSimulation'

export interface UseJobManagerOptions {
  autoRefresh?: boolean // Automatically refresh job list
  refreshInterval?: number // Refresh interval in ms (default: 1000)
}

export function useJobManager(options?: UseJobManagerOptions) {
  const { autoRefresh = true, refreshInterval = 1000 } = options || {}

  const [jobs, setJobs] = useState<VerificationJob[]>([])
  const [stats, setStats] = useState<JobManagerStats | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Refresh jobs from storage
  const refreshJobs = useCallback(() => {
    const allJobs = getAllJobs()
    setJobs(allJobs)
    setStats(getJobStats())
  }, [])

  // Auto-refresh jobs
  useEffect(() => {
    if (autoRefresh) {
      refreshJobs()
      const interval = setInterval(refreshJobs, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval, refreshJobs])

  // Subscribe to job events
  useEffect(() => {
    const unsubscribers = [
      subscribeToJobEvents('created', () => refreshJobs()),
      subscribeToJobEvents('started', () => refreshJobs()),
      subscribeToJobEvents('progress', () => refreshJobs()),
      subscribeToJobEvents('completed', () => refreshJobs()),
      subscribeToJobEvents('failed', () => refreshJobs()),
    ]

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe())
    }
  }, [refreshJobs])

  // Create and run a new verification job
  const createAndRunJob = useCallback(async (tokenAddress: string) => {
    setIsCreating(true)
    setError(null)

    try {
      const job = createVerificationJob(tokenAddress)
      refreshJobs()

      // Run job in background
      runVerificationJob(job).catch((error) => {
        console.error('Job execution failed:', error)
        setError(error instanceof Error ? error.message : 'Unknown error')
      })

      return job
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create job'
      setError(errorMessage)
      throw error
    } finally {
      setIsCreating(false)
    }
  }, [refreshJobs])

  // Create job without running it
  const createJob = useCallback((tokenAddress: string) => {
    try {
      const job = createVerificationJob(tokenAddress)
      refreshJobs()
      return job
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create job'
      setError(errorMessage)
      throw error
    }
  }, [refreshJobs])

  // Run an existing job
  const runJob = useCallback(async (job: VerificationJob) => {
    setError(null)
    try {
      await runVerificationJob(job)
      refreshJobs()
      return job
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to run job'
      setError(errorMessage)
      throw error
    }
  }, [refreshJobs])

  // Get jobs by status
  const getByStatus = useCallback((status: JobStatus) => {
    return getJobsByStatus(status)
  }, [])

  // Get jobs by token
  const getByToken = useCallback((tokenAddress: string) => {
    return getJobsByToken(tokenAddress)
  }, [])

  // Get latest job for token
  const getLatestForToken = useCallback((tokenAddress: string) => {
    return getLatestJobForToken(tokenAddress)
  }, [])

  // Clear all jobs
  const clearJobs = useCallback(() => {
    clearAllJobs()
    refreshJobs()
  }, [refreshJobs])

  // Get jobs sorted by creation date (newest first)
  const sortedJobs = useCallback((jobList?: VerificationJob[]) => {
    const toSort = jobList || jobs
    return [...toSort].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }, [jobs])

  return {
    // State
    jobs,
    stats,
    isCreating,
    error,

    // Actions
    createAndRunJob,
    createJob,
    runJob,
    refreshJobs,
    clearJobs,

    // Queries
    getByStatus,
    getByToken,
    getLatestForToken,
    sortedJobs,

    // Convenience getters
    pendingJobs: jobs.filter((j) => j.status === 'pending'),
    runningJobs: jobs.filter((j) => j.status === 'running'),
    completedJobs: jobs.filter((j) => j.status === 'completed'),
    failedJobs: jobs.filter((j) => j.status === 'failed'),
  }
}

/**
 * Hook for monitoring a single job
 */
export function useJob(jobId: string | null) {
  const [job, setJob] = useState<VerificationJob | null>(null)
  const [events, setEvents] = useState<AgentEvent[]>([])

  const { jobs, refreshJobs } = useJobManager({ autoRefresh: true })

  // Update job when jobs change
  useEffect(() => {
    if (jobId) {
      const foundJob = jobs.find((j) => j.jobId === jobId)
      setJob(foundJob || null)
    } else {
      setJob(null)
    }
  }, [jobId, jobs])

  // Subscribe to progress events for this job
  useEffect(() => {
    if (!jobId) return

    const unsubscribe = subscribeToJobEvents('progress', (j, event) => {
      if (j.jobId === jobId && event) {
        setEvents((prev) => [event, ...prev].slice(0, 50)) // Keep last 50 events
      }
    })

    return unsubscribe
  }, [jobId])

  const clearEvents = useCallback(() => {
    setEvents([])
  }, [])

  return {
    job,
    events,
    clearEvents,
    refresh: refreshJobs,
  }
}

/**
 * Hook for job statistics
 */
export function useJobStats() {
  const [stats, setStats] = useState<JobManagerStats | null>(null)

  useEffect(() => {
    const updateStats = () => {
      setStats(getJobStats())
    }

    // Initial update
    updateStats()

    // Subscribe to all job events to update stats
    const unsubscribers = [
      subscribeToJobEvents('created', updateStats),
      subscribeToJobEvents('completed', updateStats),
      subscribeToJobEvents('failed', updateStats),
    ]

    // Also update on interval
    const interval = setInterval(updateStats, 2000)

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe())
      clearInterval(interval)
    }
  }, [])

  return stats
}
