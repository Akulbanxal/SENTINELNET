import { useState, useEffect, useCallback } from 'react'
import {
  subscribeToActivities,
  getAllActivities,
  getFilteredActivities,
  getActivityStats,
  clearActivities,
  clearOldActivities,
  type ActivityLogEntry,
  type ActivityFilter,
  type ActivityStats,
  type ActivityType,
  type ActivityLevel,
} from '@/lib/activityLog'

export interface UseActivityLogOptions {
  autoRefresh?: boolean
  refreshInterval?: number
  maxEntries?: number
  filter?: ActivityFilter
}

export function useActivityLog(options?: UseActivityLogOptions) {
  const {
    autoRefresh = true,
    refreshInterval = 1000,
    maxEntries = 100,
    filter,
  } = options || {}

  const [activities, setActivities] = useState<ActivityLogEntry[]>([])
  const [stats, setStats] = useState<ActivityStats | null>(null)

  // Refresh activities from storage
  const refreshActivities = useCallback(() => {
    const allActivities = filter
      ? getFilteredActivities(filter, maxEntries)
      : getAllActivities(maxEntries)
    setActivities(allActivities)
    setStats(getActivityStats())
  }, [filter, maxEntries])

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh) {
      refreshActivities()
      const interval = setInterval(refreshActivities, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval, refreshActivities])

  // Subscribe to new activities
  useEffect(() => {
    const unsubscribe = subscribeToActivities((newActivity) => {
      // Check if activity matches filter
      if (filter) {
        const matches = getFilteredActivities(filter, 1)
        if (matches.length === 0 || matches[0].id !== newActivity.id) {
          return
        }
      }

      setActivities((prev) => {
        const updated = [newActivity, ...prev]
        return updated.slice(0, maxEntries)
      })
      setStats(getActivityStats())
    })

    return unsubscribe
  }, [filter, maxEntries])

  // Clear all activities
  const clear = useCallback(() => {
    clearActivities()
    refreshActivities()
  }, [refreshActivities])

  // Clear old activities
  const clearOld = useCallback((olderThanMs: number) => {
    const cleared = clearOldActivities(olderThanMs)
    refreshActivities()
    return cleared
  }, [refreshActivities])

  return {
    activities,
    stats,
    refreshActivities,
    clear,
    clearOld,
  }
}

/**
 * Hook for monitoring specific activity types
 */
export function useActivityByType(types: ActivityType[], limit?: number) {
  const { activities, stats, refreshActivities } = useActivityLog({
    filter: { types },
    maxEntries: limit,
  })

  return {
    activities,
    count: activities.length,
    stats,
    refresh: refreshActivities,
  }
}

/**
 * Hook for monitoring specific activity levels
 */
export function useActivityByLevel(levels: ActivityLevel[], limit?: number) {
  const { activities, stats, refreshActivities } = useActivityLog({
    filter: { levels },
    maxEntries: limit,
  })

  return {
    activities,
    count: activities.length,
    stats,
    refresh: refreshActivities,
  }
}

/**
 * Hook for monitoring job-specific activities
 */
export function useJobActivityLog(jobId: string) {
  const { activities, refreshActivities } = useActivityLog({
    filter: { jobId },
  })

  return {
    activities,
    count: activities.length,
    refresh: refreshActivities,
  }
}

/**
 * Hook for monitoring token-specific activities
 */
export function useTokenActivityLog(tokenAddress: string) {
  const { activities, refreshActivities } = useActivityLog({
    filter: { tokenAddress },
  })

  return {
    activities,
    count: activities.length,
    refresh: refreshActivities,
  }
}
