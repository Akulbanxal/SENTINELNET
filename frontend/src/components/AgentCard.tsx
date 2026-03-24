import React from 'react'
import { Shield, TrendingUp, Activity, Award } from 'lucide-react'
import type { Agent } from '@/types'
import { 
  getAgentColor, 
  getReputationColor, 
  formatAddress, 
  formatEth 
} from '@/lib/utils'

interface AgentCardProps {
  agent: Agent
  onHire?: (agent: Agent) => void
  showActions?: boolean
  compact?: boolean
}

export function AgentCard({ 
  agent, 
  onHire, 
  showActions = true,
  compact = false 
}: AgentCardProps) {
  const getAgentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'security':
        return <Shield className="w-6 h-6" />
      case 'liquidity':
      case 'market':
        return <TrendingUp className="w-6 h-6" />
      case 'tokenomics':
        return <Activity className="w-6 h-6" />
      default:
        return <Shield className="w-6 h-6" />
    }
  }

  const successRate =
    agent.totalJobs > 0
      ? Math.round((agent.successfulJobs / agent.totalJobs) * 100)
      : 0

  if (compact) {
    return (
      <div className="glass-panel p-3 hover:bg-gray-800/70 transition-all duration-200">
        <div className="flex items-center gap-3">
          <div className={`${getAgentColor(agent.agentTypeName)}`}>
            {getAgentIcon(agent.agentTypeName)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-gray-200 truncate">
              {agent.name}
            </h3>
            <p className="text-xs text-gray-500">{agent.specialization}</p>
          </div>
          <div className="text-right">
            <div className={`font-bold ${getReputationColor(agent.reputation)}`}>
              {agent.reputation}
            </div>
            <div className="text-xs text-gray-500">Rep</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-panel p-6 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`${getAgentColor(agent.agentTypeName)}`}>
            {getAgentIcon(agent.agentTypeName)}
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-200">{agent.name}</h3>
            <p className="text-sm text-gray-500">{agent.specialization}</p>
          </div>
        </div>
        
        {agent.isActive && (
          <span className="badge badge-success badge-sm">Active</span>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4 text-warning" />
            <span className="text-xs text-gray-500">Reputation</span>
          </div>
          <div className={`text-2xl font-bold ${getReputationColor(agent.reputation)}`}>
            {agent.reputation}
          </div>
          <div className="text-xs text-gray-600">out of 100</div>
        </div>

        <div>
          <div className="text-xs text-gray-500 mb-1">Success Rate</div>
          <div className="text-2xl font-bold text-success">{successRate}%</div>
          <div className="text-xs text-gray-600">
            {agent.successfulJobs}/{agent.totalJobs} jobs
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
        <div className="text-xs text-gray-500 mb-1">Contract Address</div>
        <div className="text-sm font-mono text-gray-400">
          {formatAddress(agent.address, 6)}
        </div>
      </div>

      {/* Type Badge */}
      <div className="mb-4">
        <span className={`badge ${getAgentColor(agent.agentTypeName)}`}>
          {agent.agentTypeName}
        </span>
      </div>

      {/* Price */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-500">Price per Verification</span>
        <span className="font-bold text-primary">
          {formatEth(agent.pricePerVerification)}
        </span>
      </div>

      {/* Action Button */}
      {showActions && onHire && (
        <button
          onClick={() => onHire(agent)}
          disabled={!agent.isActive}
          className="btn btn-primary w-full"
        >
          {agent.isActive ? 'Hire Agent' : 'Unavailable'}
        </button>
      )}

      {/* Job History */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="text-xs text-gray-500 mb-2">Job History</div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span className="text-gray-400">{agent.successfulJobs} Success</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-danger" />
            <span className="text-gray-400">
              {agent.totalJobs - agent.successfulJobs} Failed
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
