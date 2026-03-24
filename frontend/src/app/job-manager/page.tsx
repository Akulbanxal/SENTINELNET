'use client'

import { useState } from 'react'
import { useJobManager, useJobStats } from '@/hooks/useJobManager'
import { formatJobDuration } from '@/lib/jobManager'
import type { VerificationJob } from '@/lib/jobManager'

export default function JobManagerPage() {
  const [tokenAddress, setTokenAddress] = useState('')
  const [selectedJob, setSelectedJob] = useState<VerificationJob | null>(null)

  const {
    jobs,
    stats,
    isCreating,
    error,
    createAndRunJob,
    clearJobs,
    sortedJobs,
    pendingJobs,
    runningJobs,
    completedJobs,
    failedJobs,
  } = useJobManager({ autoRefresh: true, refreshInterval: 500 })

  const handleCreateJob = async () => {
    if (!tokenAddress.trim()) {
      alert('Please enter a token address')
      return
    }

    try {
      const job = await createAndRunJob(tokenAddress)
      setTokenAddress('')
      setSelectedJob(job)
    } catch (error) {
      console.error('Failed to create job:', error)
    }
  }

  const handleQuickTest = async () => {
    const testAddress = `0x${Math.random().toString(16).slice(2, 42).padEnd(40, '0')}`
    setTokenAddress(testAddress)
    setTimeout(() => {
      createAndRunJob(testAddress)
    }, 100)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-gray-600 bg-gray-100 border-gray-300'
      case 'running':
        return 'text-blue-600 bg-blue-100 border-blue-300'
      case 'completed':
        return 'text-green-600 bg-green-100 border-green-300'
      case 'failed':
        return 'text-red-600 bg-red-100 border-red-300'
      default:
        return 'text-gray-600 bg-gray-100 border-gray-300'
    }
  }

  const getDecisionColor = (decision: string | null) => {
    switch (decision) {
      case 'APPROVE':
        return 'text-green-700 bg-green-100 border-green-300'
      case 'REVIEW':
        return 'text-yellow-700 bg-yellow-100 border-yellow-300'
      case 'REJECT':
        return 'text-red-700 bg-red-100 border-red-300'
      default:
        return 'text-gray-700 bg-gray-100 border-gray-300'
    }
  }

  const getRiskScoreColor = (score: number | null) => {
    if (score === null) return 'text-gray-600'
    if (score < 30) return 'text-green-600'
    if (score <= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔄 Verification Job Manager
          </h1>
          <p className="text-gray-600">
            Create and manage token verification jobs with real-time agent orchestration
          </p>
        </div>

        {/* Statistics Dashboard */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="text-sm font-medium text-gray-600 mb-1">Total Jobs</div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalJobs}</div>
            </div>
            <div className="bg-gray-50 rounded-xl shadow-lg p-6 border border-gray-300">
              <div className="text-sm font-medium text-gray-600 mb-1">Pending</div>
              <div className="text-3xl font-bold text-gray-600">{stats.pendingJobs}</div>
            </div>
            <div className="bg-blue-50 rounded-xl shadow-lg p-6 border border-blue-300">
              <div className="text-sm font-medium text-blue-600 mb-1">Running</div>
              <div className="text-3xl font-bold text-blue-600">{stats.runningJobs}</div>
            </div>
            <div className="bg-green-50 rounded-xl shadow-lg p-6 border border-green-300">
              <div className="text-sm font-medium text-green-600 mb-1">Completed</div>
              <div className="text-3xl font-bold text-green-600">{stats.completedJobs}</div>
            </div>
            <div className="bg-red-50 rounded-xl shadow-lg p-6 border border-red-300">
              <div className="text-sm font-medium text-red-600 mb-1">Failed</div>
              <div className="text-3xl font-bold text-red-600">{stats.failedJobs}</div>
            </div>
          </div>
        )}

        {/* Create Job Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🆕 Create Verification Job</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token Address (Ethereum)
              </label>
              <input
                type="text"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                disabled={isCreating}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCreateJob}
                disabled={isCreating || !tokenAddress.trim()}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isCreating ? '⏳ Creating...' : '🚀 Create & Run Job'}
              </button>
              <button
                onClick={handleQuickTest}
                disabled={isCreating}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                🧪 Quick Test
              </button>
              <button
                onClick={clearJobs}
                disabled={jobs.length === 0}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                🗑️ Clear All
              </button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-medium">❌ Error: {error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Job List */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              📋 Job List ({jobs.length})
            </h2>
            <div className="flex gap-2 text-xs">
              <span className="px-2 py-1 rounded bg-gray-100 text-gray-600">
                {pendingJobs.length} Pending
              </span>
              <span className="px-2 py-1 rounded bg-blue-100 text-blue-600">
                {runningJobs.length} Running
              </span>
              <span className="px-2 py-1 rounded bg-green-100 text-green-600">
                {completedJobs.length} Completed
              </span>
            </div>
          </div>

          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">No jobs yet</p>
              <p className="text-gray-400">Create a verification job to get started</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {sortedJobs().map((job) => (
                <div
                  key={job.jobId}
                  onClick={() => setSelectedJob(selectedJob?.jobId === job.jobId ? null : job)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedJob?.jobId === job.jobId
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-gray-500">{job.jobId}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(
                            job.status
                          )}`}
                        >
                          {job.status.toUpperCase()}
                        </span>
                        {job.decision && (
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold border ${getDecisionColor(
                              job.decision
                            )}`}
                          >
                            {job.decision}
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-mono text-gray-700">{job.tokenAddress}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Created: {job.createdAt.toLocaleString()} • Duration:{' '}
                        {formatJobDuration(job)}
                      </div>
                    </div>

                    {job.finalRiskScore !== null && (
                      <div className="text-right">
                        <div className="text-xs text-gray-500 mb-1">Risk Score</div>
                        <div
                          className={`text-2xl font-bold ${getRiskScoreColor(
                            job.finalRiskScore
                          )}`}
                        >
                          {job.finalRiskScore.toFixed(1)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Expanded Details */}
                  {selectedJob?.jobId === job.jobId && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                      {/* Agent Scores */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                          <div className="text-xs font-medium text-purple-900 mb-1">
                            🔒 Security
                          </div>
                          <div
                            className={`text-xl font-bold ${getRiskScoreColor(
                              job.securityScore
                            )}`}
                          >
                            {job.securityScore !== null ? job.securityScore : '—'}
                          </div>
                        </div>
                        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
                          <div className="text-xs font-medium text-cyan-900 mb-1">
                            💧 Liquidity
                          </div>
                          <div
                            className={`text-xl font-bold ${getRiskScoreColor(
                              job.liquidityScore
                            )}`}
                          >
                            {job.liquidityScore !== null ? job.liquidityScore : '—'}
                          </div>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                          <div className="text-xs font-medium text-emerald-900 mb-1">
                            📊 Tokenomics
                          </div>
                          <div
                            className={`text-xl font-bold ${getRiskScoreColor(
                              job.tokenomicsScore
                            )}`}
                          >
                            {job.tokenomicsScore !== null ? job.tokenomicsScore : '—'}
                          </div>
                        </div>
                      </div>

                      {/* Agent Results Details */}
                      {job.agentResults.security && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <div className="text-xs font-medium text-gray-700 mb-2">
                            Security Findings ({job.agentResults.security.findings.length}):
                          </div>
                          <ul className="space-y-1">
                            {job.agentResults.security.findings.slice(0, 3).map((finding, idx) => (
                              <li key={idx} className="text-xs text-gray-600">
                                • {finding}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {job.error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="text-xs font-medium text-red-900 mb-1">Error:</div>
                          <div className="text-xs text-red-700">{job.error}</div>
                        </div>
                      )}
                    </div>
                  )}
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
                <strong>Create Job:</strong> Enter a token address and create a verification job
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">2️⃣</span>
              <div>
                <strong>Run Agents Sequentially:</strong> SecurityBot → LiquidityScanner →
                TokenomicsAnalyzer
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">3️⃣</span>
              <div>
                <strong>Aggregate Scores:</strong> Calculate final risk score using weighted
                algorithm
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">4️⃣</span>
              <div>
                <strong>Make Decision:</strong> APPROVE (safe), REVIEW (warning), or REJECT
                (danger)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
