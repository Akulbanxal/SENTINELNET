'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, TrendingUp, Activity, CheckCircle, Loader2, XCircle, Play, Pause, Zap, Target, Sparkles, Gauge, RotateCcw } from 'lucide-react'
import { useJobManager } from '@/hooks/useJobManager'
import { useDemoModeContext } from '@/context/DemoModeContext'
import { useActivityLog } from '@/hooks/useActivityLog'
import { useSimulation } from '@/hooks/useSimulation'
import { VerificationPipeline } from '@/components/VerificationPipeline'
import { RiskGauge } from '@/components/RiskGauge'
import { VerificationAgentsDashboard } from '@/components/VerificationAgentsDashboard'
import { RecentVerificationJobsTable } from '@/components/RecentVerificationJobsTable'
import { ActivityFeed, JobCard } from '@/components/index'
import MetricCard from '@/components/MetricCard'
import MiniChart from '@/components/MiniChart'
import type { VerificationJob } from '@/lib/jobManager'
import type { TokenScenario } from '@/types'
import { MOCK_TOKENS } from '@/lib/simulation'
import { apiClient } from '@/services/apiClient'
import { wsClient } from '@/lib/wsClient'
import RealtimeActivity from '@/components/RealtimeActivity'

export default function Home() {
  const [tokenAddress, setTokenAddress] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [currentJob, setCurrentJob] = useState<VerificationJob | null>(null)
  const { createAndRunJob, jobs } = useJobManager()
  const { isEnabled: isDemoMode, demoCount } = useDemoModeContext()
  
  // Backend URL constant
  const BACKEND_URL = 'http://localhost:3001'
  
  // Client-side simulation
  const {
    state: simulationState,
    isRunning: simulationIsRunning,
    speedMultiplier,
    startDemoMode,
    stopSimulation,
    clearSimulation,
    setSpeed,
  } = useSimulation()
  
  // Backend API data
  const [backendAgents, setBackendAgents] = useState<any[]>([])
  const [backendJobs, setBackendJobs] = useState<any[]>([])
  const [analyticsOverview, setAnalyticsOverview] = useState<any>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [simulationLoading, setSimulationLoading] = useState(false)
  const [simulationMessage, setSimulationMessage] = useState('')

  // Fetch data from backend API
  const fetchBackendData = async () => {
    try {
      const [agentsData, jobsData, analyticsData] = await Promise.all([
        apiClient.getAgents().catch(() => ({ data: [] })),
        apiClient.getJobs().catch(() => ({ data: [] })),
        apiClient.getAnalyticsOverview().catch(() => ({ data: null })),
      ])

      setBackendAgents(agentsData.data || [])
      setBackendJobs(jobsData.data || [])
      setAnalyticsOverview(analyticsData.data || null)
      setIsLoadingData(false)
    } catch (error) {
      console.error('Failed to fetch backend data:', error)
      setIsLoadingData(false)
    }
  }

  // Fetch data on mount and refresh every 5 seconds
  useEffect(() => {
    fetchBackendData()
    const interval = setInterval(fetchBackendData, 5000)
    return () => clearInterval(interval)
  }, [])

  // WebSocket setup for live updates
  useEffect(() => {
    wsClient.connect(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')
    wsClient.on('job_created', (data) => {
      setBackendJobs(prev => [data, ...prev])
    })
    wsClient.on('job_finished', (data) => {
      setBackendJobs(prev => prev.map(j => (j.id === data.id ? data : j)))
    })
    wsClient.on('simulation_status', (status) => {
      // reflect status in UI; fetch overview to update counts
      fetchBackendData()
    })
    wsClient.on('agent_started', (payload) => {
      // add to activity log via hook if available
      // fallback: console
      console.log('agent_started', payload)
    })
  }, [])

  // Update current job when jobs change
  useEffect(() => {
    if (currentJob && jobs.length > 0) {
      const updatedJob = jobs.find(j => j.jobId === currentJob.jobId)
      if (updatedJob) {
        setCurrentJob(updatedJob)
      }
    }
  }, [currentJob, jobs])

  const handleStartVerification = async () => {
    if (!tokenAddress.trim()) {
      alert('Please enter a token address')
      return
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(tokenAddress.trim())) {
      alert('Please enter a valid Ethereum address')
      return
    }

    setIsRunning(true)
    try {
      // Create and run job
      const job = await createAndRunJob(tokenAddress.trim())
      setCurrentJob(job)
    } catch (error) {
      console.error('Verification failed:', error)
    } finally {
      setIsRunning(false)
    }
  }

  const getRiskLevelColor = (level?: string) => {
    switch (level) {
      case 'SAFE':
        return 'text-green-500 bg-green-500/20'
      case 'WARNING':
        return 'text-yellow-500 bg-yellow-500/20'
      case 'DANGER':
        return 'text-red-500 bg-red-500/20'
      default:
        return 'text-gray-500 bg-gray-500/20'
    }
  }

  const getDecisionColor = (decision?: string) => {
    switch (decision) {
      case 'APPROVE':
        return 'text-green-500 bg-green-500/20 border-green-500'
      case 'REJECT':
        return 'text-red-500 bg-red-500/20 border-red-500'
      case 'REVIEW':
        return 'text-yellow-500 bg-yellow-500/20 border-yellow-500'
      default:
        return 'text-gray-500 bg-gray-500/20 border-gray-500'
    }
  }
  const { activities } = useActivityLog()

  // Generate sample data for charts
  const generateSampleData = () => {
    return Array.from({ length: 12 }, () => Math.floor(Math.random() * 40) + 60)
  }

  const [chartData] = useState({
    security: generateSampleData(),
    liquidity: generateSampleData(),
    tokenomics: generateSampleData(),
    activity: generateSampleData()
  })

  return (
    <div className="space-y-6">
      {/* Live Simulation Controls */}
      <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-cyan-500/10 backdrop-blur-xl border border-white/10 shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10">
            <Sparkles className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Live Simulation Demo</h2>
            <p className="text-gray-400 text-xs">Watch autonomous agents verify tokens in real-time</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 flex-wrap mb-4">
          <button
            onClick={simulationIsRunning ? stopSimulation : startDemoMode}
            className={`btn ${simulationIsRunning ? 'btn-danger' : 'btn-primary'} flex items-center gap-2`}
          >
            {simulationIsRunning ? (
              <>
                <Pause className="w-4 h-4" />
                Stop Demo
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start Demo
              </>
            )}
          </button>

          <button
            onClick={clearSimulation}
            disabled={simulationIsRunning}
            className="btn btn-secondary flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Clear
          </button>

          {/* Speed Control */}
          <div className="flex items-center gap-2 ml-auto">
            <Gauge className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">Speed:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setSpeed('slow')}
                disabled={simulationIsRunning}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  speedMultiplier === 0.5
                    ? 'bg-primary text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                0.5x
              </button>
              <button
                onClick={() => setSpeed('normal')}
                disabled={simulationIsRunning}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  speedMultiplier === 1
                    ? 'bg-primary text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                1x
              </button>
              <button
                onClick={() => setSpeed('fast')}
                disabled={simulationIsRunning}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  speedMultiplier === 2
                    ? 'bg-primary text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                2x
              </button>
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        {simulationIsRunning && (
          <div className="pt-3 border-t border-gray-700">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-gray-400">
                Simulation running at {speedMultiplier === 0.5 ? 'Slow' : speedMultiplier === 2 ? 'Fast' : 'Normal'} speed
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Simulation Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Jobs</p>
              <p className="text-3xl font-bold text-primary">{simulationState.activeJobs}</p>
            </div>
            <Activity className="w-12 h-12 text-primary opacity-50" />
          </div>
        </div>

        <div className="glass-panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-3xl font-bold text-success">{simulationState.completedJobs}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-success opacity-50" />
          </div>
        </div>

        <div className="glass-panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Jobs</p>
              <p className="text-3xl font-bold text-accent-cyan">{simulationState.jobs.length}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-accent-cyan opacity-50" />
          </div>
        </div>
      </div>

      {/* Simulation Jobs and Activity */}
      {simulationState.jobs.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Jobs List */}
          <div>
            <h3 className="text-xl font-bold text-gray-200 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Verification Jobs
            </h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin">
              {simulationState.jobs
                .sort((a, b) => b.startTime - a.startTime)
                .slice(0, 5)
                .map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
            </div>
          </div>

          {/* Activity Log */}
          <div>
            <h3 className="text-xl font-bold text-gray-200 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent-cyan" />
              Activity Log
            </h3>
            <ActivityFeed logs={simulationState.activityLog} maxHeight="max-h-[400px]" />
          </div>
        </div>
      )}

      {/* Simulation Controls Old */}
      <div className="flex gap-3 mt-6 flex-wrap">
        <button
          onClick={async () => {
            setSimulationLoading(true)
            setSimulationMessage('')
            try {
              const response = await fetch(`${BACKEND_URL}/api/simulation/start`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
              })
              const data = await response.json()
              if (response.ok) {
                setSimulationMessage('✅ Simulation started successfully')
                setTimeout(() => fetchBackendData(), 500)
              } else {
                setSimulationMessage('❌ Failed to start simulation: ' + (data.message || 'Unknown error'))
              }
            } catch (error) {
              setSimulationMessage('❌ Error: ' + (error instanceof Error ? error.message : 'Failed to connect to backend'))
            } finally {
              setSimulationLoading(false)
            }
          }}
          disabled={simulationLoading}
          className="btn btn-primary disabled:opacity-50"
        >
          {simulationLoading ? 'Starting...' : 'Start Simulation (Backend)'}
        </button>
        <button
          onClick={async () => {
            setSimulationLoading(true)
            setSimulationMessage('')
            try {
              const response = await fetch(`${BACKEND_URL}/api/simulation/stop`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
              })
              const data = await response.json()
              if (response.ok) {
                setSimulationMessage('✅ Simulation stopped successfully')
                setTimeout(() => fetchBackendData(), 500)
              } else {
                setSimulationMessage('❌ Failed to stop simulation: ' + (data.message || 'Unknown error'))
              }
            } catch (error) {
              setSimulationMessage('❌ Error: ' + (error instanceof Error ? error.message : 'Failed to connect to backend'))
            } finally {
              setSimulationLoading(false)
            }
          }}
          disabled={simulationLoading}
          className="btn btn-secondary disabled:opacity-50"
        >
          {simulationLoading ? 'Stopping...' : 'Stop Simulation (Backend)'}
        </button>
        <button
          onClick={async () => {
            setSimulationLoading(true)
            setSimulationMessage('')
            try {
              const response = await fetch(`${BACKEND_URL}/api/simulation/job`, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ tokenAddress: '0x1234567890123456789012345678901234567890' })
              })
              const data = await response.json()
              if (response.ok) {
                setSimulationMessage('✅ Test token generated successfully: ' + (data.data?.id || 'Job created'))
                setTimeout(() => fetchBackendData(), 500)
              } else {
                setSimulationMessage('❌ Failed to generate test token: ' + (data.message || 'Unknown error'))
              }
            } catch (error) {
              setSimulationMessage('❌ Error: ' + (error instanceof Error ? error.message : 'Failed to connect to backend'))
            } finally {
              setSimulationLoading(false)
            }
          }}
          disabled={simulationLoading}
          className="btn btn-success disabled:opacity-50"
        >
          {simulationLoading ? 'Generating...' : 'Generate Test Token (Backend)'}
        </button>
      </div>

      {/* Simulation Message */}
      {simulationMessage && (
        <div className={`p-4 rounded-lg text-sm border ${
          simulationMessage.includes('✅') 
            ? 'bg-green-500/20 border-green-500/30 text-green-400' 
            : 'bg-red-500/20 border-red-500/30 text-red-400'
        }`}>
          {simulationMessage}
        </div>
      )}
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-green-500/20 via-green-500/10 to-green-500/20 backdrop-blur-xl border border-green-500/30 shadow-2xl shadow-green-500/20">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/5 to-transparent animate-slide-progress" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/30 rounded-full blur-xl animate-pulse" />
                <Play className="relative w-8 h-8 text-green-400 fill-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-400 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Demo Mode Active
                </h3>
                <p className="text-sm text-gray-300">
                  Automatically running verifications every 10 seconds
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-400">{demoCount}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Verifications</div>
            </div>
          </div>
        </div>
      )}

      {/* Token Verification Input */}
      <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-cyan-500/10 backdrop-blur-xl border border-white/10 shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Token Verification Console</h2>
            <p className="text-gray-400 text-xs">Enter a token address to start real-time AI analysis</p>
          </div>
        </div>

        {/* Input Section */}
        <div className="flex gap-3">
          <div className="flex-1 relative group">
            <input
              type="text"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              placeholder="0x..."
              disabled={isRunning}
              className="w-full px-6 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50 backdrop-blur-sm"
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>
          <button
            onClick={handleStartVerification}
            disabled={isRunning || !tokenAddress.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-500 text-white font-semibold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-blue-500/30 disabled:shadow-none"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="hidden sm:inline">Analyzing...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span className="hidden sm:inline">Start Analysis</span>
              </>
            )}
          </button>
          <button
            onClick={() => setTokenAddress('0x1234567890123456789012345678901234567890')}
            disabled={isRunning}
            className="px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 disabled:bg-gray-900/50 disabled:text-gray-600 text-gray-300 font-medium rounded-xl transition-all border border-gray-700/50 backdrop-blur-sm"
            title="Try with sample address"
          >
            <Target className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* TOP ROW: System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Agents"
          value={isLoadingData ? '...' : (analyticsOverview?.activeAgents || backendAgents.filter(a => a.isActive).length || '24')}
          subtitle="Running 24/7"
          trend="up"
          trendValue={`+${backendAgents.length > 0 ? Math.floor(backendAgents.length * 0.1) : 3}`}
          icon={<Shield className="w-6 h-6 text-blue-400" />}
          gradient="blue"
          chart={<MiniChart data={chartData.security} color="blue" height={50} />}
          animated={!isLoadingData}
        />
        <MetricCard
          title="Accuracy Rate"
          value={isLoadingData ? '...' : (analyticsOverview?.accuracyRate ? `${analyticsOverview.accuracyRate}%` : '98.5%')}
          subtitle="Last 30 days"
          trend="up"
          trendValue="+2.5%"
          icon={<Target className="w-6 h-6 text-purple-400" />}
          gradient="purple"
          chart={<MiniChart data={chartData.liquidity} color="purple" height={50} />}
          animated={!isLoadingData}
        />
        <MetricCard
          title="Tokens Analyzed"
          value={isLoadingData ? '...' : (analyticsOverview?.totalJobs || backendJobs.length || jobs.length).toString()}
          subtitle="Total verifications"
          trend="up"
          trendValue={`+${Math.min(backendJobs.length || jobs.length, 10)} today`}
          icon={<Activity className="w-6 h-6 text-cyan-400" />}
          gradient="cyan"
          chart={<MiniChart data={chartData.activity} color="cyan" height={50} />}
          animated={!isLoadingData}
        />
        <MetricCard
          title="Avg Response Time"
          value={isLoadingData ? '...' : (analyticsOverview?.avgResponseTime || '2.3s')}
          subtitle="Real-time analysis"
          trend="down"
          trendValue="-0.4s"
          icon={<Zap className="w-6 h-6 text-green-400" />}
          gradient="green"
          chart={<MiniChart data={chartData.tokenomics} color="green" height={50} />}
          animated={!isLoadingData}
        />
      </div>

      {/* CENTER: Verification Pipeline Visualization */}
      {currentJob && (
        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            Verification Pipeline
          </h3>
          <VerificationPipeline job={currentJob} />
        </div>
      )}

      {/* MIDDLE ROW: Left Column (Agents) + Right Column (Risk Gauge & Decision) */}
      {currentJob && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN: Verification Agents */}
          <div className="lg:col-span-2">
            <VerificationAgentsDashboard currentJob={currentJob} />
          </div>

          {/* RIGHT COLUMN: Risk Gauge and Trade Decision */}
          <div className="space-y-6">
            {/* Risk Gauge */}
            <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 shadow-2xl">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Gauge className="w-5 h-5 text-blue-400" />
                Risk Score
              </h3>
              <div className="flex items-center justify-center py-4">
                {currentJob.finalRiskScore !== null ? (
                  <RiskGauge score={currentJob.finalRiskScore} size={200} strokeWidth={20} />
                ) : (
                  <div className="text-center py-8">
                    <Loader2 className="w-12 h-12 text-gray-500 animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Calculating...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Trade Decision */}
            {currentJob.status === 'completed' && currentJob.finalRiskScore !== null && (
              <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 shadow-2xl">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Trade Decision
                </h3>

                <div className="space-y-4">
                  {/* Risk Level */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Risk Level</div>
                    <div className={`w-full text-center px-4 py-3 rounded-lg font-bold text-lg ${getRiskLevelColor(currentJob.riskAggregation?.riskLevel)} shadow-lg`}>
                      {currentJob.riskAggregation?.riskLevel || 'UNKNOWN'}
                    </div>
                  </div>
                  
                  {/* Trade Decision */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Decision</div>
                    <div className={`w-full text-center px-4 py-3 rounded-lg font-bold text-lg border-2 ${getDecisionColor(currentJob.decision || undefined)} shadow-lg`}>
                      {currentJob.decision || 'PENDING'}
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  <div className="space-y-2 pt-4 border-t border-white/10">
                    <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Score Breakdown</div>
                    
                    <div className="flex justify-between items-center p-2 rounded-lg bg-gray-900/50 border border-white/5">
                      <span className="text-xs text-gray-300 flex items-center gap-2">
                        <Shield className="w-3 h-3 text-blue-400" />
                        Security
                      </span>
                      <span className="font-bold text-white">{currentJob.securityScore?.toFixed(1)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-2 rounded-lg bg-gray-900/50 border border-white/5">
                      <span className="text-xs text-gray-300 flex items-center gap-2">
                        <Activity className="w-3 h-3 text-cyan-400" />
                        Liquidity
                      </span>
                      <span className="font-bold text-white">{currentJob.liquidityScore?.toFixed(1)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-2 rounded-lg bg-gray-900/50 border border-white/5">
                      <span className="text-xs text-gray-300 flex items-center gap-2">
                        <TrendingUp className="w-3 h-3 text-purple-400" />
                        Tokenomics
                      </span>
                      <span className="font-bold text-white">{currentJob.tokenomicsScore?.toFixed(1)}</span>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 mt-3">
                      <span className="text-xs font-bold text-white uppercase tracking-wide">Final</span>
                      <span className="text-xl font-bold text-white">{currentJob.finalRiskScore.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error State */}
            {currentJob.status === 'failed' && (
              <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-red-500/20 to-red-500/10 backdrop-blur-xl border border-red-500/30 shadow-2xl shadow-red-500/20">
                <div className="flex items-center gap-2 text-red-400 font-semibold mb-2">
                  <XCircle className="w-5 h-5" />
                  <span>Verification Failed</span>
                </div>
                <div className="text-sm text-red-300/80">{currentJob.error || 'Unknown error occurred'}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BOTTOM: Activity Feed and Verification Jobs Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Feed */}
        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
          
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Live Activity Feed
            </h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
              <span className="text-xs text-gray-400 uppercase tracking-wide">Live</span>
            </div>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            <RealtimeActivity />
          </div>
        </div>
        
        {/* Recent Verification Jobs */}
        <div className="lg:col-span-1">
          <RecentVerificationJobsTable />
        </div>
      </div>
    </div>
  )
}
