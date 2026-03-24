'use client'

import { useState, useEffect } from 'react'
import { useJobManager } from '@/hooks/useJobManager'
import { Shield, TrendingUp, BarChart3, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react'
import type { VerificationJob } from '@/lib/jobManager'

export function RecentVerificationJobsTable() {
  const { jobs } = useJobManager({ autoRefresh: true, refreshInterval: 1000 })
  const [sortedJobs, setSortedJobs] = useState<VerificationJob[]>([])

  // Sort jobs by completion time (most recent first)
  useEffect(() => {
    const completedJobs = jobs
      .filter(job => job.status === 'completed')
      .sort((a, b) => {
        if (!a.completedAt || !b.completedAt) return 0
        return b.completedAt.getTime() - a.completedAt.getTime()
      })
      .slice(0, 10) // Show last 10 jobs
    
    setSortedJobs(completedJobs)
  }, [jobs])

  const getScoreBadgeColor = (score: number) => {
    if (score <= 30) return 'bg-green-500/20 text-green-400 border-green-500/50'
    if (score <= 60) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
    return 'bg-red-500/20 text-red-400 border-red-500/50'
  }

  const getRiskLevelBadge = (level?: string) => {
    switch (level) {
      case 'SAFE':
        return 'bg-green-500 text-white border-green-500'
      case 'WARNING':
        return 'bg-yellow-500 text-white border-yellow-500'
      case 'DANGER':
        return 'bg-red-500 text-white border-red-500'
      default:
        return 'bg-gray-500 text-white border-gray-500'
    }
  }

  const getDecisionBadge = (decision?: string | null) => {
    switch (decision) {
      case 'APPROVE':
        return 'bg-green-500 text-white border-green-500'
      case 'REVIEW':
        return 'bg-yellow-500 text-white border-yellow-500'
      case 'REJECT':
        return 'bg-red-500 text-white border-red-500'
      default:
        return 'bg-gray-500 text-white border-gray-500'
    }
  }

  const getDecisionIcon = (decision?: string | null) => {
    switch (decision) {
      case 'APPROVE':
        return <CheckCircle className="w-4 h-4" />
      case 'REVIEW':
        return <AlertCircle className="w-4 h-4" />
      case 'REJECT':
        return <XCircle className="w-4 h-4" />
      default:
        return null
    }
  }

  const calculateExecutionTime = (job: VerificationJob): string => {
    if (!job.startedAt || !job.completedAt) return 'N/A'
    
    const diffMs = job.completedAt.getTime() - job.startedAt.getTime()
    const seconds = Math.floor(diffMs / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    }
    return `${seconds}s`
  }

  if (sortedJobs.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
        <h2 className="text-2xl font-bold text-gray-100 mb-4">Recent Verification Jobs</h2>
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No completed jobs yet</p>
          <p className="text-gray-500 text-sm mt-2">Start a verification to see results here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">Recent Verification Jobs</h2>
          <p className="text-gray-400 mt-1">Last {sortedJobs.length} completed verifications</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Clock className="w-4 h-4" />
          <span>Auto-refreshing</span>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Token Address</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-400">
                <div className="flex items-center justify-center gap-1">
                  <Shield className="w-4 h-4" />
                  Security
                </div>
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-400">
                <div className="flex items-center justify-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  Liquidity
                </div>
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-400">
                <div className="flex items-center justify-center gap-1">
                  <BarChart3 className="w-4 h-4" />
                  Tokenomics
                </div>
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-400">Final Risk</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-400">Risk Level</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-400">Decision</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-400">Exec Time</th>
            </tr>
          </thead>
          <tbody>
            {sortedJobs.map((job, index) => (
              <tr 
                key={job.jobId}
                className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"
              >
                {/* Token Address */}
                <td className="py-4 px-4">
                  <div className="flex flex-col">
                    <span className="font-mono text-sm text-gray-100">
                      {job.tokenAddress.slice(0, 10)}...{job.tokenAddress.slice(-8)}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      {job.completedAt?.toLocaleString()}
                    </span>
                  </div>
                </td>

                {/* Security Score */}
                <td className="py-4 px-4 text-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${getScoreBadgeColor(job.securityScore || 0)}`}>
                    {job.securityScore?.toFixed(1) || 'N/A'}
                  </span>
                </td>

                {/* Liquidity Score */}
                <td className="py-4 px-4 text-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${getScoreBadgeColor(job.liquidityScore || 0)}`}>
                    {job.liquidityScore?.toFixed(1) || 'N/A'}
                  </span>
                </td>

                {/* Tokenomics Score */}
                <td className="py-4 px-4 text-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${getScoreBadgeColor(job.tokenomicsScore || 0)}`}>
                    {job.tokenomicsScore?.toFixed(1) || 'N/A'}
                  </span>
                </td>

                {/* Final Risk Score */}
                <td className="py-4 px-4 text-center">
                  <span className={`inline-flex items-center px-4 py-2 rounded-lg text-lg font-bold border-2 ${getScoreBadgeColor(job.finalRiskScore || 0)}`}>
                    {job.finalRiskScore?.toFixed(1) || 'N/A'}
                  </span>
                </td>

                {/* Risk Level */}
                <td className="py-4 px-4 text-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${getRiskLevelBadge(job.riskAggregation?.riskLevel)}`}>
                    {job.riskAggregation?.riskLevel || 'UNKNOWN'}
                  </span>
                </td>

                {/* Decision */}
                <td className="py-4 px-4 text-center">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold border ${getDecisionBadge(job.decision)}`}>
                    {getDecisionIcon(job.decision)}
                    {job.decision || 'PENDING'}
                  </span>
                </td>

                {/* Execution Time */}
                <td className="py-4 px-4 text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-300">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">{calculateExecutionTime(job)}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden space-y-4">
        {sortedJobs.map((job) => (
          <div 
            key={job.jobId}
            className="bg-gray-900 rounded-lg p-4 border border-gray-700 space-y-3"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-mono text-sm text-gray-100 mb-1">
                  {job.tokenAddress.slice(0, 10)}...{job.tokenAddress.slice(-8)}
                </div>
                <div className="text-xs text-gray-500">
                  {job.completedAt?.toLocaleString()}
                </div>
              </div>
              <div className="flex items-center gap-1 text-gray-400 text-xs">
                <Clock className="w-3 h-3" />
                {calculateExecutionTime(job)}
              </div>
            </div>

            {/* Scores Grid */}
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="text-xs text-gray-400 mb-1">Security</div>
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold border ${getScoreBadgeColor(job.securityScore || 0)}`}>
                  {job.securityScore?.toFixed(1) || 'N/A'}
                </span>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400 mb-1">Liquidity</div>
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold border ${getScoreBadgeColor(job.liquidityScore || 0)}`}>
                  {job.liquidityScore?.toFixed(1) || 'N/A'}
                </span>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400 mb-1">Tokenomics</div>
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold border ${getScoreBadgeColor(job.tokenomicsScore || 0)}`}>
                  {job.tokenomicsScore?.toFixed(1) || 'N/A'}
                </span>
              </div>
            </div>

            {/* Final Results */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-700">
              <div className="flex flex-col items-center">
                <div className="text-xs text-gray-400 mb-1">Final Risk</div>
                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-base font-bold border-2 ${getScoreBadgeColor(job.finalRiskScore || 0)}`}>
                  {job.finalRiskScore?.toFixed(1) || 'N/A'}
                </span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="text-xs text-gray-400 mb-1">Risk Level</div>
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold border ${getRiskLevelBadge(job.riskAggregation?.riskLevel)}`}>
                  {job.riskAggregation?.riskLevel || 'UNKNOWN'}
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div className="text-xs text-gray-400 mb-1">Decision</div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold border ${getDecisionBadge(job.decision)}`}>
                  {getDecisionIcon(job.decision)}
                  {job.decision || 'PENDING'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="text-xs text-gray-400 mb-3">Color Legend:</div>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-300">SAFE / APPROVE (0-30)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-gray-300">WARNING / REVIEW (31-60)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-300">DANGER / REJECT (61-100)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
