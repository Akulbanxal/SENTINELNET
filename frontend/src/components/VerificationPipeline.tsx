'use client'

import { CheckCircle, Loader2, Circle, ArrowRight } from 'lucide-react'
import type { VerificationJob } from '@/lib/jobManager'

interface PipelineStep {
  id: string
  label: string
  icon: string
  description: string
}

const PIPELINE_STEPS: PipelineStep[] = [
  {
    id: 'submitted',
    label: 'Token Input',
    icon: '🪙',
    description: 'Token address received',
  },
  {
  id: 'security',
  label: 'SecurityBot',
    icon: '🔒',
    description: 'SecurityBot scanning',
  },
  {
  id: 'liquidity',
  label: 'LiquidityScanner',
    icon: '💧',
    description: 'LiquidityScanner analyzing',
  },
  {
  id: 'tokenomics',
  label: 'TokenomicsAnalyzer',
    icon: '📊',
    description: 'TokenomicsAnalyzer evaluating',
  },
  {
  id: 'risk',
  label: 'Risk Engine',
    icon: '⚖️',
    description: 'Aggregating risk scores',
  },
  {
    id: 'decision',
    label: 'Trade Decision',
    icon: '✅',
    description: 'Final recommendation',
  },
]

type StepStatus = 'idle' | 'running' | 'complete' | 'error'

interface VerificationPipelineProps {
  job: VerificationJob | null
}

export function VerificationPipeline({ job }: VerificationPipelineProps) {
  const getStepStatus = (stepId: string): StepStatus => {
    if (!job) return 'idle'

    switch (stepId) {
      case 'submitted':
        // Token input is considered completed once a job exists
        return 'complete'

      case 'security':
        // If security result not yet present but job is running assume it's the active step
        if (!job.agentResults.security) {
          return job.status === 'running' ? 'running' : 'idle'
        }
        if (job.agentResults.security.status === 'failed') return 'error'
        if (job.agentResults.security.status === 'success') return 'complete'
        return 'running'

      case 'liquidity':
        // Liquidity runs after security completes
        if (!job.agentResults.liquidity) {
          if (job.agentResults.security?.status === 'success' && job.status === 'running') return 'running'
          return 'idle'
        }
        if (job.agentResults.liquidity.status === 'failed') return 'error'
        if (job.agentResults.liquidity.status === 'success') return 'complete'
        return 'running'

      case 'tokenomics':
        // Tokenomics runs after liquidity completes
        if (!job.agentResults.tokenomics) {
          if (
            job.agentResults.security?.status === 'success' &&
            job.agentResults.liquidity?.status === 'success' &&
            job.status === 'running'
          ) return 'running'
          return 'idle'
        }
        if (job.agentResults.tokenomics.status === 'failed') return 'error'
        if (job.agentResults.tokenomics.status === 'success') return 'complete'
        return 'running'

      case 'risk':
        if (job.riskAggregation) return 'complete'
        if (
          job.agentResults.security?.status === 'success' &&
          job.agentResults.liquidity?.status === 'success' &&
          job.agentResults.tokenomics?.status === 'success'
        ) {
          return 'running'
        }
        return 'idle'

      case 'decision':
        if (job.decision) return 'complete'
        if (job.riskAggregation) return 'running'
        return 'idle'

      default:
        return 'idle'
    }
  }

  const getStatusIcon = (status: StepStatus) => {
    switch (status) {
      case 'running':
        return <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      case 'complete':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'error':
        return (
          <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">✕</span>
          </div>
        )
      default:
        return <Circle className="w-6 h-6 text-gray-600" />
    }
  }

  const getStepClasses = (status: StepStatus) => {
    const baseClasses = 'relative flex-1 p-4 rounded-lg border-2 transition-all duration-500 transform'
    
    switch (status) {
      case 'running':
        return `${baseClasses} bg-blue-500/10 border-blue-500 shadow-lg shadow-blue-500/30 scale-105 animate-glow`
      case 'complete':
        return `${baseClasses} bg-green-500/10 border-green-500/50 shadow-md shadow-green-500/20`
      case 'error':
        return `${baseClasses} bg-red-500/10 border-red-500/50 shadow-md shadow-red-500/20`
      default:
        return `${baseClasses} bg-gray-800/50 border-gray-700 opacity-70`
    }
  }

  const getConnectorClasses = (currentStatus: StepStatus, nextStatus: StepStatus) => {
    if (currentStatus === 'complete' && nextStatus === 'running') {
      return 'bg-gradient-to-r from-green-500 via-blue-500 to-blue-600 animate-pulse relative overflow-hidden'
    }
    if (currentStatus === 'complete') {
      return 'bg-gradient-to-r from-green-500 to-green-600'
    }
    if (currentStatus === 'running') {
      return 'bg-gradient-to-r from-blue-500 to-blue-600 animate-pulse'
    }
    return 'bg-gray-700'
  }

  const getStepScore = (stepId: string): number | null => {
    if (!job) return null

    switch (stepId) {
      case 'security':
        return job.agentResults.security?.score ?? null
      case 'liquidity':
        return job.agentResults.liquidity?.score ?? null
      case 'tokenomics':
        return job.agentResults.tokenomics?.score ?? null
      case 'risk':
        return job.finalRiskScore
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Desktop View - Horizontal Pipeline */}
      <div className="hidden lg:block">
        <div className="relative flex items-center gap-2">
          {PIPELINE_STEPS.map((step, index) => {
            const status = getStepStatus(step.id)
            const nextStatus = index < PIPELINE_STEPS.length - 1 
              ? getStepStatus(PIPELINE_STEPS[index + 1].id)
              : 'idle'
            const score = getStepScore(step.id)

            return (
              <div key={step.id} className="flex items-center flex-1">
                {/* Step Card */}
                <div className={getStepClasses(status)}>
                  <div className="flex flex-col items-center text-center space-y-2">
                    {/* Icon and Status */}
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{step.icon}</span>
                      {getStatusIcon(status)}
                    </div>

                    {/* Label */}
                    <div className="font-semibold text-sm text-gray-100">
                      {step.label}
                    </div>

                    {/* Description */}
                    <div className="text-xs text-gray-400">
                      {step.description}
                    </div>

                    {/* Score Badge */}
                    {score !== null && status === 'complete' && (
                      <div className="mt-2 px-3 py-1 bg-gray-900 rounded-full border border-gray-600">
                        <span className="text-xs font-bold text-gray-100">
                          Score: {score.toFixed(1)}
                        </span>
                      </div>
                    )}

                    {/* Running Animation */}
                    {status === 'running' && (
                      <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full w-1/2 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 animate-slide-progress" />
                      </div>
                    )}

                    {/* Pulse effect for running state */}
                    {status === 'running' && (
                      <div className="absolute inset-0 rounded-lg border-2 border-blue-500 animate-ping opacity-20" />
                    )}
                  </div>
                </div>

                {/* Connector Arrow */}
                {index < PIPELINE_STEPS.length - 1 && (
                  <div className="flex items-center justify-center w-8 mx-1 relative">
                    <div className={`h-1 w-full rounded-full transition-all duration-500 ${getConnectorClasses(status, nextStatus)}`}>
                      {(status === 'running' || (status === 'complete' && nextStatus === 'running')) && (
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white to-transparent opacity-50 animate-slide-progress" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Mobile/Tablet View - Vertical Pipeline */}
      <div className="lg:hidden space-y-3">
        {PIPELINE_STEPS.map((step, index) => {
          const status = getStepStatus(step.id)
          const nextStatus = index < PIPELINE_STEPS.length - 1 
            ? getStepStatus(PIPELINE_STEPS[index + 1].id)
            : 'idle'
          const score = getStepScore(step.id)

          return (
            <div key={step.id} className="space-y-2">
              {/* Step Card */}
              <div className={getStepClasses(status)}>
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <span className="text-3xl">{step.icon}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="font-semibold text-gray-100 mb-1">
                      {step.label}
                    </div>
                    <div className="text-xs text-gray-400">
                      {step.description}
                    </div>
                    {score !== null && status === 'complete' && (
                      <div className="mt-2 inline-block px-2 py-1 bg-gray-900 rounded border border-gray-600">
                        <span className="text-xs font-bold text-gray-100">
                          Score: {score.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {getStatusIcon(status)}
                  </div>
                </div>

                {/* Running Progress Bar */}
                {status === 'running' && (
                  <div className="mt-3 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full w-1/2 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 animate-slide-progress" />
                  </div>
                )}

                {/* Glow effect for running state */}
                {status === 'running' && (
                  <div className="absolute inset-0 rounded-lg border-2 border-blue-500/30 animate-ping" />
                )}
              </div>

              {/* Vertical Connector */}
              {index < PIPELINE_STEPS.length - 1 && (
                <div className="flex justify-center py-1">
                  <div className={`w-1 h-6 rounded-full transition-all duration-500 ${getConnectorClasses(status, nextStatus)}`} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Pipeline Legend */}
      {job && (
        <div className="flex flex-wrap gap-4 justify-center text-xs text-gray-400 pt-4 border-t border-gray-700">
          <div className="flex items-center gap-2">
            <Circle className="w-4 h-4 text-gray-600" />
            <span>Idle</span>
          </div>
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            <span>Running</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Complete</span>
          </div>
        </div>
      )}
    </div>
  )
}
