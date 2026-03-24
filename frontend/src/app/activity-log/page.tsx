'use client'

import { useState } from 'react'
import { useActivityLog } from '@/hooks/useActivityLog'
import { logActivity, logTokenDiscovered, type ActivityType, type ActivityLevel } from '@/lib/activityLog'

export default function ActivityLogPage() {
  const [filter, setFilter] = useState<{
    types: ActivityType[]
    levels: ActivityLevel[]
  }>({
    types: [],
    levels: [],
  })

  const { activities, stats, clear, clearOld } = useActivityLog({
    autoRefresh: true,
    refreshInterval: 500,
    maxEntries: 200,
    filter: filter.types.length || filter.levels.length ? filter : undefined,
  })

  const getActivityIcon = (type: ActivityType) => {
    if (type.includes('security')) return '🔒'
    if (type.includes('liquidity')) return '💧'
    if (type.includes('tokenomics')) return '📊'
    if (type.includes('risk')) return '⚖️'
    if (type.includes('trade')) return '💱'
    if (type.includes('job')) return '📋'
    if (type.includes('token')) return '🪙'
    return '📝'
  }

  const getLevelColor = (level: ActivityLevel) => {
    switch (level) {
      case 'success':
        return 'text-green-700 bg-green-100 border-green-300'
      case 'error':
        return 'text-red-700 bg-red-100 border-red-300'
      case 'warning':
        return 'text-yellow-700 bg-yellow-100 border-yellow-300'
      default:
        return 'text-blue-700 bg-blue-100 border-blue-300'
    }
  }

  const getLevelBadgeColor = (level: ActivityLevel) => {
    switch (level) {
      case 'success':
        return 'bg-green-500 text-white'
      case 'error':
        return 'bg-red-500 text-white'
      case 'warning':
        return 'bg-yellow-500 text-white'
      default:
        return 'bg-blue-500 text-white'
    }
  }

  const toggleTypeFilter = (type: ActivityType) => {
    setFilter((prev) => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type],
    }))
  }

  const toggleLevelFilter = (level: ActivityLevel) => {
    setFilter((prev) => ({
      ...prev,
      levels: prev.levels.includes(level)
        ? prev.levels.filter((l) => l !== level)
        : [...prev.levels, level],
    }))
  }

  const addTestActivity = () => {
    logActivity('Test activity logged from UI', {
      type: 'system_info',
      metadata: { test: true },
    })
  }

  const addTestTokenDiscovery = () => {
    const randomAddress = `0x${Math.random().toString(16).slice(2, 42).padEnd(40, '0')}`
    logTokenDiscovered(randomAddress, { source: 'test' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📡 System Activity Log
          </h1>
          <p className="text-gray-600">
            Real-time monitoring of all system events and agent activities
          </p>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="text-sm font-medium text-gray-600 mb-1">Total Activities</div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalActivities}</div>
            </div>
            <div className="bg-blue-50 rounded-xl shadow-lg p-6 border border-blue-300">
              <div className="text-sm font-medium text-blue-600 mb-1">Info</div>
              <div className="text-3xl font-bold text-blue-600">{stats.byLevel.info || 0}</div>
            </div>
            <div className="bg-green-50 rounded-xl shadow-lg p-6 border border-green-300">
              <div className="text-sm font-medium text-green-600 mb-1">Success</div>
              <div className="text-3xl font-bold text-green-600">{stats.byLevel.success || 0}</div>
            </div>
            <div className="bg-red-50 rounded-xl shadow-lg p-6 border border-red-300">
              <div className="text-sm font-medium text-red-600 mb-1">Errors</div>
              <div className="text-3xl font-bold text-red-600">{stats.byLevel.error || 0}</div>
            </div>
          </div>
        )}

        {/* Filters and Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🔍 Filters & Controls</h2>

          {/* Level Filters */}
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Filter by Level:</div>
            <div className="flex flex-wrap gap-2">
              {(['info', 'success', 'warning', 'error'] as ActivityLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => toggleLevelFilter(level)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium border-2 transition-all ${
                    filter.levels.includes(level)
                      ? getLevelBadgeColor(level)
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {level.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Type Filters */}
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Filter by Type:</div>
            <div className="flex flex-wrap gap-2">
              {[
                'security_started',
                'security_completed',
                'liquidity_started',
                'liquidity_completed',
                'tokenomics_started',
                'tokenomics_completed',
                'risk_calculated',
                'trade_approved',
                'trade_rejected',
                'job_created',
                'job_completed',
              ].map((type) => (
                <button
                  key={type}
                  onClick={() => toggleTypeFilter(type as ActivityType)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                    filter.types.includes(type as ActivityType)
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {type.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={addTestActivity}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              🧪 Add Test Activity
            </button>
            <button
              onClick={addTestTokenDiscovery}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              🪙 Test Token Discovery
            </button>
            <button
              onClick={() => clearOld(60 * 60 * 1000)}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
            >
              🕐 Clear Old (1h+)
            </button>
            <button
              onClick={clear}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              🗑️ Clear All
            </button>
          </div>
        </div>

        {/* Activity Stream */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              🎬 Activity Stream ({activities.length})
            </h2>
            {(filter.types.length > 0 || filter.levels.length > 0) && (
              <button
                onClick={() => setFilter({ types: [], levels: [] })}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Clear Filters
              </button>
            )}
          </div>

          {activities.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-2">No activities yet</p>
              <p className="text-gray-400">Activities will appear here in real-time</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[700px] overflow-y-auto">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className={`p-4 rounded-lg border-2 transition-all ${getLevelColor(
                    activity.level
                  )}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      {/* Icon */}
                      <div className="text-2xl">{getActivityIcon(activity.type)}</div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${getLevelBadgeColor(activity.level)}`}>
                            {activity.level.toUpperCase()}
                          </span>
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700">
                            {activity.type.replace(/_/g, ' ')}
                          </span>
                          {activity.agentName && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700">
                              {activity.agentName}
                            </span>
                          )}
                          {activity.decision && (
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-bold ${
                                activity.decision === 'APPROVE'
                                  ? 'bg-green-600 text-white'
                                  : activity.decision === 'REJECT'
                                  ? 'bg-red-600 text-white'
                                  : 'bg-yellow-600 text-white'
                              }`}
                            >
                              {activity.decision}
                            </span>
                          )}
                        </div>

                        <p className="text-sm font-medium text-gray-900 mb-1">{activity.message}</p>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                          <span>{activity.timestamp.toLocaleTimeString()}</span>
                          {activity.tokenAddress && (
                            <span className="font-mono">Token: {activity.tokenAddress.slice(0, 10)}...</span>
                          )}
                          {activity.jobId && (
                            <span className="font-mono">Job: {activity.jobId.slice(0, 15)}...</span>
                          )}
                          {activity.score !== undefined && (
                            <span className="font-semibold">Score: {activity.score}</span>
                          )}
                        </div>

                        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                          <details className="mt-2">
                            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                              View metadata
                            </summary>
                            <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                              {JSON.stringify(activity.metadata, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">ℹ️ How It Works</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <span className="text-2xl">1️⃣</span>
              <div>
                <strong>Real-time Monitoring:</strong> All system events are logged automatically as they occur
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">2️⃣</span>
              <div>
                <strong>Event Types:</strong> Tracks token discovery, agent execution, risk calculation, and trade decisions
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">3️⃣</span>
              <div>
                <strong>Filtering:</strong> Filter by activity level (info, success, warning, error) or type
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">4️⃣</span>
              <div>
                <strong>Auto-refresh:</strong> Activity stream updates every 500ms for real-time visibility
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
