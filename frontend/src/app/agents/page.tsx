'use client'

import { useState, useEffect } from 'react'
import { Shield, TrendingUp, Award, Activity } from 'lucide-react'
import axios from 'axios'

interface Agent {
  address: string
  name: string
  agentType: number
  agentTypeName: string
  pricePerVerification: string
  reputation: number
  totalJobs: number
  successfulJobs: number
  isActive: boolean
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetchAgents()
  }, [filter])

  const fetchAgents = async () => {
    setLoading(true)
    try {
      const endpoint =
        filter === 'all'
          ? `${API_URL}/api/agents`
          : `${API_URL}/api/agents/${filter}`
      
      const response = await axios.get(endpoint)
      setAgents(response.data.data.agents || [])
    } catch (error) {
      console.error('Error fetching agents:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAgentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'security':
        return Shield
      case 'liquidity':
      case 'market':
        return TrendingUp
      case 'tokenomics':
        return Activity
      default:
        return Shield
    }
  }

  const getAgentColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'security':
        return 'text-primary'
      case 'liquidity':
        return 'text-accent-cyan'
      case 'tokenomics':
        return 'text-accent-purple'
      case 'market':
        return 'text-success'
      default:
        return 'text-gray-400'
    }
  }

  const getReputationColor = (reputation: number) => {
    if (reputation >= 90) return 'text-success'
    if (reputation >= 70) return 'text-warning'
    return 'text-danger'
  }

  const filters = [
    { value: 'all', label: 'All Agents' },
    { value: 'security', label: 'Security' },
    { value: 'liquidity', label: 'Liquidity' },
    { value: 'tokenomics', label: 'Tokenomics' },
    { value: 'market', label: 'Market Analysis' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold gradient-text">Agent Marketplace</h1>
        <p className="text-xl text-gray-400">
          Autonomous verification agents working 24/7
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card text-center">
          <div className="text-3xl font-bold text-primary">{agents.length}</div>
          <div className="text-gray-400 mt-1">Total Agents</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-3xl font-bold text-success">
            {agents.filter((a) => a.isActive).length}
          </div>
          <div className="text-gray-400 mt-1">Active Agents</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-3xl font-bold text-accent-cyan">
            {agents.reduce((sum, a) => sum + a.totalJobs, 0)}
          </div>
          <div className="text-gray-400 mt-1">Total Verifications</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-3xl font-bold text-accent-purple">
            {agents.length > 0
              ? Math.round(
                  agents.reduce((sum, a) => sum + a.reputation, 0) / agents.length
                )
              : 0}
          </div>
          <div className="text-gray-400 mt-1">Avg Reputation</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg transition-all ${
              filter === f.value
                ? 'bg-primary text-white'
                : 'bg-background-tertiary text-gray-400 hover:text-gray-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Agents Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 mt-4">Loading agents...</p>
        </div>
      ) : agents.length === 0 ? (
        <div className="card p-12 text-center">
          <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No agents found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => {
            const Icon = getAgentIcon(agent.agentTypeName)
            const successRate =
              agent.totalJobs > 0
                ? ((agent.successfulJobs / agent.totalJobs) * 100).toFixed(1)
                : '0'

            return (
              <div key={agent.address} className="card p-6 card-hover">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg bg-background-tertiary ${getAgentColor(agent.agentTypeName)}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{agent.name}</h3>
                      <span className={`badge badge-info text-xs`}>
                        {agent.agentTypeName}
                      </span>
                    </div>
                  </div>
                  {agent.isActive && (
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  )}
                </div>

                {/* Reputation Score */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Reputation</span>
                    <span className={`font-bold ${getReputationColor(agent.reputation)}`}>
                      {agent.reputation}/100
                    </span>
                  </div>
                  <div className="w-full bg-background-tertiary rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        agent.reputation >= 90
                          ? 'bg-success'
                          : agent.reputation >= 70
                          ? 'bg-warning'
                          : 'bg-danger'
                      }`}
                      style={{ width: `${agent.reputation}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-400">Total Jobs</div>
                    <div className="text-xl font-semibold">{agent.totalJobs}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Success Rate</div>
                    <div className="text-xl font-semibold text-success">{successRate}%</div>
                  </div>
                </div>

                {/* Price */}
                <div className="pt-4 border-t border-gray-800">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Price per Verification</span>
                    <span className="font-semibold text-primary">
                      {agent.pricePerVerification} ETH
                    </span>
                  </div>
                </div>

                {/* Address */}
                <div className="mt-3 text-xs text-gray-500 font-mono">
                  {agent.address.slice(0, 10)}...{agent.address.slice(-8)}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Leaderboard Section */}
      {!loading && agents.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-6 h-6 text-warning" />
            <h2 className="text-2xl font-bold">Reputation Leaderboard</h2>
          </div>
          <div className="space-y-3">
            {[...agents]
              .sort((a, b) => b.reputation - a.reputation)
              .slice(0, 5)
              .map((agent, index) => (
                <div
                  key={agent.address}
                  className="flex items-center justify-between p-4 bg-background-tertiary rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0
                          ? 'bg-warning text-black'
                          : index === 1
                          ? 'bg-gray-400 text-black'
                          : index === 2
                          ? 'bg-orange-600 text-white'
                          : 'bg-background text-gray-400'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold">{agent.name}</div>
                      <div className="text-sm text-gray-400">{agent.agentTypeName}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${getReputationColor(agent.reputation)}`}>
                      {agent.reputation}
                    </div>
                    <div className="text-xs text-gray-400">{agent.totalJobs} jobs</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
