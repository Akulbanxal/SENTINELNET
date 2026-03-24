'use client'

import { useState } from 'react'
import { useAgentSimulation } from '@/hooks/useAgentSimulation'
import type { AgentSimulationConfig } from '@/lib/agentSimulation'

export default function AgentDemoPage() {
  const [config, setConfig] = useState<AgentSimulationConfig>({
    minDuration: 2000,
    maxDuration: 4000,
    minScore: 0,
    maxScore: 100,
    failureRate: 0.02,
  })

  const {
    security,
    liquidity,
    tokenomics,
    overallScore,
    isRunning,
    error,
    events,
    runParallel,
    runSequential,
    runSecurity,
    runLiquidity,
    runTokenomics,
    clear,
    clearEvents,
  } = useAgentSimulation(config)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'started':
        return 'text-blue-600 bg-blue-50'
      case 'progress':
        return 'text-indigo-600 bg-indigo-50'
      case 'completed':
        return 'text-green-600 bg-green-50'
      case 'failed':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🤖 Agent Simulation Demo
          </h1>
          <p className="text-gray-600">
            Test the autonomous verification agents with real-time event tracking
          </p>
        </div>

        {/* Configuration Panel */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">⚙️ Configuration</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Duration (ms)
              </label>
              <input
                type="number"
                value={config.minDuration}
                onChange={(e) =>
                  setConfig({ ...config, minDuration: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isRunning}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Duration (ms)
              </label>
              <input
                type="number"
                value={config.maxDuration}
                onChange={(e) =>
                  setConfig({ ...config, maxDuration: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isRunning}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Score
              </label>
              <input
                type="number"
                value={config.minScore}
                onChange={(e) =>
                  setConfig({ ...config, minScore: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isRunning}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Score
              </label>
              <input
                type="number"
                value={config.maxScore}
                onChange={(e) =>
                  setConfig({ ...config, maxScore: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isRunning}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Failure Rate
              </label>
              <input
                type="number"
                step="0.01"
                value={config.failureRate}
                onChange={(e) =>
                  setConfig({ ...config, failureRate: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isRunning}
              />
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🎮 Controls</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={runParallel}
              disabled={isRunning}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              🚀 Run All (Parallel)
            </button>
            <button
              onClick={runSequential}
              disabled={isRunning}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              📋 Run All (Sequential)
            </button>
            <button
              onClick={runSecurity}
              disabled={isRunning}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              🔒 Security Only
            </button>
            <button
              onClick={runLiquidity}
              disabled={isRunning}
              className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              💧 Liquidity Only
            </button>
            <button
              onClick={runTokenomics}
              disabled={isRunning}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              📊 Tokenomics Only
            </button>
            <button
              onClick={clear}
              disabled={isRunning}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              🗑️ Clear All
            </button>
            <button
              onClick={clearEvents}
              disabled={isRunning}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              🧹 Clear Events
            </button>
          </div>

          {isRunning && (
            <div className="mt-4 flex items-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="font-medium">Running agents...</span>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">❌ Error: {error}</p>
            </div>
          )}
        </div>

        {/* Results Grid */}
        {(security || liquidity || tokenomics || overallScore !== null) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Overall Score */}
            {overallScore !== null && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-lg p-6 border border-purple-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  🎯 Overall Score
                </h3>
                <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
                  {overallScore}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Weighted average of all agents
                </p>
              </div>
            )}

            {/* Security Bot Results */}
            {security && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    🔒 Security Bot
                  </h3>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(
                      security.status
                    )}`}
                  >
                    {security.status}
                  </span>
                </div>
                <div className={`text-3xl font-bold ${getScoreColor(security.score)}`}>
                  {security.score}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Duration: {(security.duration / 1000).toFixed(2)}s
                </p>
                {security.findings.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Findings ({security.findings.length}):
                    </p>
                    <ul className="space-y-1">
                      {security.findings.slice(0, 3).map((finding, idx) => (
                        <li key={idx} className="text-xs text-gray-600">
                          • {finding}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Liquidity Scanner Results */}
            {liquidity && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    💧 Liquidity Scanner
                  </h3>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(
                      liquidity.status
                    )}`}
                  >
                    {liquidity.status}
                  </span>
                </div>
                <div className={`text-3xl font-bold ${getScoreColor(liquidity.score)}`}>
                  {liquidity.score}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Duration: {(liquidity.duration / 1000).toFixed(2)}s
                </p>
                {liquidity.findings.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Findings ({liquidity.findings.length}):
                    </p>
                    <ul className="space-y-1">
                      {liquidity.findings.slice(0, 3).map((finding, idx) => (
                        <li key={idx} className="text-xs text-gray-600">
                          • {finding}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Tokenomics Analyzer Results */}
            {tokenomics && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    📊 Tokenomics Analyzer
                  </h3>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(
                      tokenomics.status
                    )}`}
                  >
                    {tokenomics.status}
                  </span>
                </div>
                <div className={`text-3xl font-bold ${getScoreColor(tokenomics.score)}`}>
                  {tokenomics.score}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Duration: {(tokenomics.duration / 1000).toFixed(2)}s
                </p>
                {tokenomics.findings.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Findings ({tokenomics.findings.length}):
                    </p>
                    <ul className="space-y-1">
                      {tokenomics.findings.slice(0, 3).map((finding, idx) => (
                        <li key={idx} className="text-xs text-gray-600">
                          • {finding}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Event Stream */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              📡 Event Stream ({events.length})
            </h2>
            <button
              onClick={clearEvents}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {events.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No events yet. Run an agent to see events.
              </p>
            ) : (
              events.map((event, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getEventTypeColor(
                      event.eventType
                    )}`}
                  >
                    {event.eventType}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {event.agentName}
                    </p>
                    {event.data?.message && (
                      <p className="text-xs text-gray-600 mt-1">{event.data.message}</p>
                    )}
                    {event.data?.progress !== undefined && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{event.data.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${event.data.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
