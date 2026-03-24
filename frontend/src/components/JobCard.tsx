import React from 'react'
import { Clock, Activity, CheckCircle, XCircle } from 'lucide-react'
import type { VerificationJob as TypeVerificationJob } from '@/types'
import type { VerificationJob as ManagerVerificationJob } from '@/lib/jobManager'
import { apiClient } from '@/services/apiClient'
import ActivityLogger from '@/lib/activityLog'
import { useState } from 'react'
import { formatTimeAgo, getProgressColor, formatAddress } from '@/lib/utils'

interface JobCardProps {
  // Accept both shapes used across the app
  job: TypeVerificationJob | ManagerVerificationJob | any
  onClick?: () => void
}

export function JobCard({ job, onClick }: JobCardProps) {
  const getStatusIcon = () => {
    const status = normalizeStatus(job.status)
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-success" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-danger" />
      case 'in-progress':
        return <Activity className="w-5 h-5 text-primary animate-pulse" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = () => {
    switch (job.status) {
      case 'completed':
        return 'border-success bg-success/5'
      case 'failed':
        return 'border-danger bg-danger/5'
      case 'in-progress':
        return 'border-primary bg-primary/5'
      default:
        return 'border-gray-700 bg-gray-800/50'
    }
  }

  const getStepLabel = (step: string) => {
    return step
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Helpers to handle both job shapes
  const normalizeStatus = (s: any) => {
    if (!s) return 'queued'
    if (s === 'running') return 'in-progress'
    if (s === 'queued' || s === 'pending') return 'queued'
    return s
  }

  const tokenName = job.tokenName || job.token?.name || job.tokenName || 'Unknown Token'
  const tokenAddress = job.tokenAddress || job.token?.address || job.tokenAddress || ''
  const statusNorm = normalizeStatus(job.status)
  const progress = job.progress ?? job.results?.overallScore ?? job.finalRiskScore ?? 0
  const currentStep = job.currentStep || job.currentStep || 'discovery'

  const results = {
    securityScore: job.results?.securityScore ?? job.securityScore ?? job.agentResults?.security?.score ?? null,
    liquidityScore: job.results?.liquidityScore ?? job.liquidityScore ?? job.agentResults?.liquidity?.score ?? null,
    tokenomicsScore: job.results?.tokenomicsScore ?? job.tokenomicsScore ?? job.agentResults?.tokenomics?.score ?? null,
    overallScore: job.results?.overallScore ?? job.finalRiskScore ?? null,
  }

  const startedAt = (job.startTime && typeof job.startTime === 'number') ? job.startTime : (job.startedAt ? new Date(job.startedAt).getTime() : null)

  const [tradeLoading, setTradeLoading] = useState(false)

  const handleCreateTrade = async () => {
    if (!tokenAddress) return
    setTradeLoading(true)
    try {
      const res = await apiClient.evaluateTrade(tokenAddress)
      // Log a system activity so the realtime feed shows the recommendation
      if (res?.data?.recommendation) {
        const rec = res.data.recommendation
        ActivityLogger.log(`Trade evaluation for ${tokenAddress}: ${rec}`, {
          type: 'system_info',
          tokenAddress,
          decision: rec,
        })
      } else {
        ActivityLogger.log(`Trade evaluation requested for ${tokenAddress}`, {
          type: 'system_info',
          tokenAddress,
        })
      }
    } catch (err) {
      ActivityLogger.log(`Trade evaluation failed for ${tokenAddress}`, { type: 'system_error', tokenAddress, metadata: { error: String(err) } })
    } finally {
      setTradeLoading(false)
    }
  }

  return (
    <div
      className={`glass-panel p-4 border-l-4 ${getStatusColor()} 
        hover:bg-gray-800/70 transition-all duration-200 cursor-pointer`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {getStatusIcon()}
                <h3 className="font-semibold text-gray-200">{tokenName}</h3>
                <span className="badge badge-sm badge-info">
                  {String(statusNorm).toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-gray-500">{formatAddress(tokenAddress)}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
          <span>{getStepLabel(currentStep)}</span>
          <span>{Math.round(Number(progress))}%</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${getProgressColor(job.progress)} transition-all duration-500`}
            style={{ width: `${job.progress}%` }}
          />
        </div>
      </div>

      {/* Agents */}
      {job.assignedAgents && job.assignedAgents.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Agents:</span>
          <span className="text-gray-400">{job.assignedAgents.length}</span>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <div className="text-gray-500">Security</div>
              <div className="font-semibold text-primary">
                {results.securityScore ?? '-'}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Liquidity</div>
              <div className="font-semibold text-accent-cyan">
                {results.liquidityScore ?? '-'}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Tokenomics</div>
              <div className="font-semibold text-accent-purple">
                {results.tokenomicsScore ?? '-'}
              </div>
            </div>
          </div>
          {results.overallScore !== null && results.overallScore !== undefined && (
            <div className="mt-2 text-center">
              <div className="text-xs text-gray-500">Overall Score</div>
              <div className="text-lg font-bold gradient-text">
                {Number(results.overallScore)}/100
              </div>
            </div>
          )}

          {/* Trade CTA when decision approves */}
          {job.decision === 'APPROVE' || job.decision === 'EXECUTE' ? (
            <div className="mt-3 text-center">
              <button
                onClick={handleCreateTrade}
                disabled={tradeLoading}
                className="btn btn-primary"
              >
                {tradeLoading ? 'Evaluating...' : 'Create Trade'}
              </button>
            </div>
          ) : null}
        </div>
      )}

      {/* Timestamp */}
      <div className="mt-2 text-xs text-gray-600 text-right">
        {formatTimeAgo(startedAt)}
      </div>
    </div>
  )
}
