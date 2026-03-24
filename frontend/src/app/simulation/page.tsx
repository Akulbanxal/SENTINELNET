'use client'

import { Play, Activity as ActivityIcon, TrendingUp, Shield } from 'lucide-react'
import { useSimulation } from '@/hooks'
import { 
  ActivityFeed, 
  JobCard, 
  SimulationControls 
} from '@/components'
import { MOCK_TOKENS } from '@/lib/simulation'
import type { TokenScenario } from '@/types'
import { useEffect, useState } from 'react'

export default function SimulationPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const {
    state,
    isRunning,
    speedMultiplier,
    startVerification,
    startDemoMode,
    stopSimulation,
    clearSimulation,
    setSpeed,
  } = useSimulation()

  const handleStartScenario = (scenario: TokenScenario) => {
    startVerification(scenario)
  }

  if (!mounted) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold gradient-text">Live Simulation</h1>
          <p className="text-xl text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold gradient-text">Live Simulation</h1>
        <p className="text-xl text-gray-400">
          Watch autonomous agents verify tokens in real-time
        </p>
      </div>

      {/* Controls */}
      <SimulationControls
        isRunning={isRunning}
        onStart={startDemoMode}
        onStop={stopSimulation}
        onClear={clearSimulation}
        onSpeedChange={setSpeed}
        currentSpeed={speedMultiplier}
      />

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Jobs</p>
              <p className="text-3xl font-bold text-primary">{state.activeJobs}</p>
            </div>
            <ActivityIcon className="w-12 h-12 text-primary opacity-50" />
          </div>
        </div>

        <div className="glass-panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-3xl font-bold text-success">{state.completedJobs}</p>
            </div>
            <Shield className="w-12 h-12 text-success opacity-50" />
          </div>
        </div>

        <div className="glass-panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Jobs</p>
              <p className="text-3xl font-bold text-accent-cyan">{state.jobs.length}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-accent-cyan opacity-50" />
          </div>
        </div>
      </div>

      {/* Quick Start Scenarios */}
      {!isRunning && state.jobs.length === 0 && (
        <div className="glass-panel p-8">
          <h2 className="text-2xl font-bold text-gray-200 mb-4">
            Quick Start - Choose a Scenario
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Safe Token */}
            <button
              onClick={() => handleStartScenario('safe')}
              className="glass-panel p-6 text-left hover:bg-success/10 hover:border-success transition-all duration-200 group"
            >
              <div className="flex items-start justify-between mb-4">
                <Shield className="w-8 h-8 text-success" />
                <span className="badge badge-success">SAFE</span>
              </div>
              <h3 className="text-xl font-bold text-gray-200 mb-2">
                {MOCK_TOKENS.safe.name}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                High security, excellent liquidity, fair distribution
              </p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Security:</span>
                  <span className="text-success font-semibold">92/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Liquidity:</span>
                  <span className="text-success font-semibold">88/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tokenomics:</span>
                  <span className="text-success font-semibold">85/100</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-xs text-success font-semibold">
                  Expected: ✅ EXECUTE
                </p>
              </div>
            </button>

            {/* Risky Token */}
            <button
              onClick={() => handleStartScenario('risky')}
              className="glass-panel p-6 text-left hover:bg-danger/10 hover:border-danger transition-all duration-200 group"
            >
              <div className="flex items-start justify-between mb-4">
                <Shield className="w-8 h-8 text-danger" />
                <span className="badge badge-danger">RISKY</span>
              </div>
              <h3 className="text-xl font-bold text-gray-200 mb-2">
                {MOCK_TOKENS.risky.name}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Multiple security risks, low liquidity, centralized
              </p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Security:</span>
                  <span className="text-danger font-semibold">25/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Liquidity:</span>
                  <span className="text-danger font-semibold">30/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tokenomics:</span>
                  <span className="text-danger font-semibold">20/100</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-xs text-danger font-semibold">
                  Expected: ❌ REJECT
                </p>
              </div>
            </button>

            {/* Medium Token */}
            <button
              onClick={() => handleStartScenario('medium')}
              className="glass-panel p-6 text-left hover:bg-warning/10 hover:border-warning transition-all duration-200 group"
            >
              <div className="flex items-start justify-between mb-4">
                <Shield className="w-8 h-8 text-warning" />
                <span className="badge badge-warning">MEDIUM</span>
              </div>
              <h3 className="text-xl font-bold text-gray-200 mb-2">
                {MOCK_TOKENS.medium.name}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Some concerns, moderate liquidity, decent distribution
              </p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Security:</span>
                  <span className="text-warning font-semibold">68/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Liquidity:</span>
                  <span className="text-warning font-semibold">65/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tokenomics:</span>
                  <span className="text-warning font-semibold">62/100</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-xs text-warning font-semibold">
                  Expected: ⚠️ CAUTION
                </p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Active Jobs and Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Jobs List */}
        <div>
          <h2 className="text-2xl font-bold text-gray-200 mb-4 flex items-center gap-2">
            <ActivityIcon className="w-6 h-6 text-primary" />
            Verification Jobs
          </h2>
          
          {state.jobs.length === 0 ? (
            <div className="glass-panel p-8 text-center">
              <Play className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No jobs yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Start a scenario or demo mode to create jobs
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-thin">
              {state.jobs
                .sort((a, b) => b.startTime - a.startTime)
                .map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
            </div>
          )}
        </div>

        {/* Activity Log */}
        <div>
          <h2 className="text-2xl font-bold text-gray-200 mb-4 flex items-center gap-2">
            <ActivityIcon className="w-6 h-6 text-accent-cyan" />
            Activity Log
          </h2>
          <ActivityFeed logs={state.activityLog} maxHeight="max-h-[600px]" />
        </div>
      </div>
    </div>
  )
}
