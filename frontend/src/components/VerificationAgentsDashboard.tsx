'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, CheckCircle, Loader2, Circle } from 'lucide-react'
import type { VerificationJob } from '@/lib/jobManager'
import { apiClient } from '@/services/apiClient'

interface BackendAgent {
  address: string
  name: string
  type: string
  reputationScore: number
  totalJobs: number
  successfulJobs: number
  pricePerVerification: string
  isActive: boolean
}

interface AgentCardProps {
  agent: BackendAgent
  currentJob: VerificationJob | null
  color: string
  icon: string
}

type AgentStatus = 'idle' | 'running' | 'completed'

export function AgentCard({ 
  agent,
  currentJob,
  color,
  icon
}: AgentCardProps) {
  const [status, setStatus] = useState<AgentStatus>('idle')
  const [score, setScore] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)

  // Calculate success rate
  const successRate = agent.totalJobs > 0 
    ? ((agent.successfulJobs / agent.totalJobs) * 100).toFixed(1)
    : '0'

  // Map backend agent type to frontend agent name for job tracking
  const getAgentJobKey = () => {
    if (agent.type === 'Security') return 'security'
    if (agent.type === 'Liquidity') return 'liquidity'
    if (agent.type === 'Tokenomics') return 'tokenomics'
    return null
  }

  // Determine agent status and score from current job
  useEffect(() => {
    if (!currentJob) {
      setStatus('idle')
      setScore(null)
      setProgress(0)
      return
    }

    const jobKey = getAgentJobKey()
    if (!jobKey) {
      setStatus('idle')
      return
    }

    const agentResult = currentJob.agentResults[jobKey as keyof typeof currentJob.agentResults]
    let agentScore = null

    if (jobKey === 'security') agentScore = currentJob.securityScore
    else if (jobKey === 'liquidity') agentScore = currentJob.liquidityScore
    else if (jobKey === 'tokenomics') agentScore = currentJob.tokenomicsScore

    if (!agentResult) {
      setStatus('idle')
      setScore(null)
      setProgress(0)
    } else if (agentResult.status === 'success') {
      setStatus('completed')
      setScore(agentScore)
      setProgress(100)
    } else if (agentResult.status === 'failed') {
      setStatus('completed')
      setScore(null)
      setProgress(100)
    } else {
      setStatus('running')
      setScore(null)
      setProgress(65)
    }
  }, [currentJob, agent.type])

  const getStatusIcon = () => {
    switch (status) {
      case 'running':
        return <Loader2 className="w-4 h-4 animate-spin" style={{ color }} />
      case 'completed':
        return <CheckCircle className="w-4 h-4" style={{ color }} />
      default:
        return <Circle className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusDot = () => {
    switch (status) {
      case 'running':
        return (
          <div className="relative">
            <motion.div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.div 
              className="absolute inset-0 w-3 h-3 rounded-full"
              style={{ backgroundColor: color, opacity: 0.4 }}
              animate={{ scale: [1, 2, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        )
      case 'completed':
        return (
          <motion.div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          />
        )
      default:
        return <div className="w-3 h-3 rounded-full bg-gray-600" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'running':
        return 'Running'
      case 'completed':
        return 'Completed'
      default:
        return 'Idle'
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'running':
        return color
      case 'completed':
        return color
      default:
        return '#6B7280'
    }
  }

  const getCardBorderClass = () => {
    switch (status) {
      case 'running':
        return 'border-2 shadow-lg animate-glow'
      case 'completed':
        return 'border-2'
      default:
        return 'border border-gray-700'
    }
  }

  return (
    <motion.div 
      className={`bg-gray-800 rounded-xl p-6 transition-all duration-300 ${getCardBorderClass()}`}
      style={{ 
        borderColor: status !== 'idle' ? color : undefined,
        boxShadow: status === 'running' ? `0 0 30px ${color}40` : undefined
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      layout
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div 
            className="text-4xl"
            animate={{ 
              rotate: status === 'running' ? [0, 5, -5, 0] : 0 
            }}
            transition={{ 
              duration: 2,
              repeat: status === 'running' ? Infinity : 0 
            }}
          >
            {icon}
          </motion.div>
          <div>
            <h3 className="text-lg font-bold text-gray-100">{agent.name}</h3>
            <p className="text-sm text-gray-400">{agent.type} Analysis</p>
          </div>
        </div>
        {getStatusDot()}
      </div>

      {/* Reputation */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-400">Reputation</span>
          <span className="text-xs font-bold text-gray-100">{(agent.reputationScore / 100).toFixed(0)}%</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <motion.div 
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            animate={{ width: `${agent.reputationScore / 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Status */}
      <div className="mb-4 pb-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm font-medium text-gray-300">Status:</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.span 
              key={status}
              className="text-sm font-bold"
              style={{ color: getStatusColor() }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3 }}
            >
              {getStatusText()}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* Agent Stats */}
      <div className="space-y-3 mb-4 pb-4 border-b border-gray-700">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Success Rate:</span>
          <span className="font-bold text-green-400">{successRate}%</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Jobs Completed:</span>
          <span className="font-bold text-gray-300">{agent.totalJobs}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Price per Job:</span>
          <span className="font-bold text-blue-400">{agent.pricePerVerification} ETH</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Active:</span>
          <span className={`font-bold ${agent.isActive ? 'text-green-400' : 'text-gray-500'}`}>
            {agent.isActive ? 'Yes' : 'No'}
          </span>
        </div>
      </div>

      {/* Current Job */}
      <div className="space-y-3">
        <div className="text-xs font-medium text-gray-400">Current Job</div>
        {currentJob ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Token:</span>
              <span className="font-mono text-gray-300">
                {currentJob.tokenAddress.slice(0, 10)}...
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Job ID:</span>
              <span className="font-mono text-gray-300">
                {currentJob.jobId.slice(0, 15)}...
              </span>
            </div>
            
            {/* Progress Bar for Running State */}
            {status === 'running' && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">Progress</span>
                  <span className="text-xs font-bold" style={{ color }}>
                    {progress}%
                  </span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full relative"
                    style={{ 
                      width: `${progress}%`,
                      backgroundColor: color
                    }}
                  >
                    {/* Animated shimmer effect */}
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-slide-progress"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Risk Score Result */}
            {status === 'completed' && score !== null && (
              <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: `${color}20` }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-300">Risk Score</span>
                  <span 
                    className="text-2xl font-bold"
                    style={{ color }}
                  >
                    {score.toFixed(1)}
                  </span>
                </div>
              </div>
            )}

            {/* Completed timestamp */}
            {status === 'completed' && currentJob.completedAt && (
              <div className="text-xs text-gray-500 pt-2">
                Completed at {currentJob.completedAt.toLocaleTimeString()}
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-500 italic">
            No active job
          </div>
        )}
      </div>

      {/* Activity Indicator */}
      {status === 'running' && (
        <motion.div 
          className="mt-4 pt-4 border-t border-gray-700"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="flex items-center gap-2 text-xs" style={{ color }}>
            <Activity className="w-4 h-4 animate-pulse" />
            <span className="font-medium">Analyzing token...</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

// Agent Dashboard Container
interface VerificationAgentsDashboardProps {
  currentJob: VerificationJob | null
}

export function VerificationAgentsDashboard({ currentJob }: VerificationAgentsDashboardProps) {
  const [backendAgents, setBackendAgents] = useState<BackendAgent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch agents from backend
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await apiClient.getAgents()
        if (response.data) {
          setBackendAgents(response.data)
        }
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to fetch agents:', error)
        setIsLoading(false)
      }
    }

    fetchAgents()
    // Refresh agents every 10 seconds
    const interval = setInterval(fetchAgents, 10000)
    return () => clearInterval(interval)
  }, [])

  // Map agent types to colors and icons
  const getAgentVisuals = (type: string) => {
    switch (type) {
      case 'Security':
        return { color: '#3B82F6', icon: '�' } // blue
      case 'Liquidity':
        return { color: '#06B6D4', icon: '💧' } // cyan
      case 'Tokenomics':
        return { color: '#8B5CF6', icon: '📊' } // purple
      default:
        return { color: '#6B7280', icon: '🤖' } // gray
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">Verification Agents</h2>
          <p className="text-gray-400 mt-1">Real-time agent status and performance</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Circle className="w-3 h-3 text-gray-600" />
            <span className="text-gray-400">Idle</span>
          </div>
          <div className="flex items-center gap-2">
            <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
            <span className="text-gray-400">Running</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-500" />
            <span className="text-gray-400">Completed</span>
          </div>
        </div>
      </div>

      {/* Agent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {backendAgents.map((agent) => {
          const visuals = getAgentVisuals(agent.type)
          return (
            <AgentCard
              key={agent.address}
              agent={agent}
              currentJob={currentJob}
              color={visuals.color}
              icon={visuals.icon}
            />
          )
        })}
      </div>

      {/* Stats Summary */}
      {currentJob && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-700">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Active Jobs</div>
            <div className="text-2xl font-bold text-gray-100">1</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Agents Running</div>
            <div className="text-2xl font-bold text-blue-500">
              {[
                currentJob.agentResults.security,
                currentJob.agentResults.liquidity,
                currentJob.agentResults.tokenomics,
              ].filter(r => r && r.status !== 'success' && r.status !== 'failed').length}
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Jobs Completed</div>
            <div className="text-2xl font-bold text-green-500">
              {currentJob.status === 'completed' ? '1' : '0'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
