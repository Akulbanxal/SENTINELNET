'use client'

import { useState } from 'react'
import { Search, Shield, TrendingUp, Activity, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import axios from 'axios'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts'

interface RiskScores {
  securityScore: number
  liquidityScore: number
  tokenomicsScore: number
  overallScore: number
}

interface AuditReport {
  auditor: string
  auditorName: string
  timestamp: number
  scores: RiskScores
  riskLevel: string
  findings: string
}

interface TokenAuditData {
  tokenAddress: string
  auditCount: number
  isSafe: boolean
  hasConsensus: boolean
  isBlacklisted: boolean
  reports: AuditReport[]
  aggregatedScores: {
    avgSecurityScore: number
    avgLiquidityScore: number
    avgTokenomicsScore: number
    avgOverallScore: number
    overallRiskLevel: string
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export default function RiskAnalyzerPage() {
  const [tokenAddress, setTokenAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [auditData, setAuditData] = useState<TokenAuditData | null>(null)
  const [error, setError] = useState('')

  const analyzeToken = async () => {
    if (!tokenAddress || !tokenAddress.startsWith('0x')) {
      setError('Please enter a valid Ethereum address')
      return
    }

    setLoading(true)
    setError('')
    setAuditData(null)

    try {
      const response = await axios.get(`${API_URL}/api/audits/${tokenAddress}`)
      setAuditData(response.data.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch audit data')
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-success'
    if (score >= 60) return 'text-warning'
    return 'text-danger'
  }

  const getRiskBgColor = (score: number) => {
    if (score >= 80) return 'bg-success'
    if (score >= 60) return 'bg-warning'
    return 'bg-danger'
  }

  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low':
        return 'badge-success'
      case 'medium':
        return 'badge-warning'
      case 'high':
      case 'critical':
        return 'badge-danger'
      default:
        return 'badge-info'
    }
  }

  const pieData = auditData
    ? [
        { name: 'Security', value: auditData.aggregatedScores.avgSecurityScore, color: '#3b82f6' },
        { name: 'Liquidity', value: auditData.aggregatedScores.avgLiquidityScore, color: '#06b6d4' },
        { name: 'Tokenomics', value: auditData.aggregatedScores.avgTokenomicsScore, color: '#a855f7' },
      ]
    : []

  const radarData = auditData
    ? [
        {
          category: 'Security',
          score: auditData.aggregatedScores.avgSecurityScore,
        },
        {
          category: 'Liquidity',
          score: auditData.aggregatedScores.avgLiquidityScore,
        },
        {
          category: 'Tokenomics',
          score: auditData.aggregatedScores.avgTokenomicsScore,
        },
      ]
    : []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold gradient-text">Token Risk Analyzer</h1>
        <p className="text-xl text-gray-400">
          Comprehensive risk assessment powered by AI agents
        </p>
      </div>

      {/* Search Box */}
      <div className="card p-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && analyzeToken()}
            placeholder="Enter ERC-20 token address (0x...)"
            className="input flex-1"
          />
          <button
            onClick={analyzeToken}
            disabled={loading}
            className="btn btn-primary flex items-center gap-2 min-w-[140px]"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Analyze
              </>
            )}
          </button>
        </div>
        {error && <p className="text-danger text-sm mt-2">{error}</p>}
      </div>

      {/* Results */}
      {auditData && (
        <div className="space-y-6">
          {/* Safety Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`card p-6 ${auditData.isSafe ? 'border-success' : 'border-danger'}`}>
              {auditData.isSafe ? (
                <CheckCircle className="w-12 h-12 text-success mb-3" />
              ) : (
                <XCircle className="w-12 h-12 text-danger mb-3" />
              )}
              <h3 className="text-lg font-semibold mb-2">Safety Status</h3>
              <p className={auditData.isSafe ? 'text-success' : 'text-danger'}>
                {auditData.isSafe ? 'Safe to Trade' : 'High Risk'}
              </p>
            </div>

            <div className={`card p-6 ${auditData.hasConsensus ? 'border-success' : 'border-warning'}`}>
              {auditData.hasConsensus ? (
                <CheckCircle className="w-12 h-12 text-success mb-3" />
              ) : (
                <AlertTriangle className="w-12 h-12 text-warning mb-3" />
              )}
              <h3 className="text-lg font-semibold mb-2">Consensus</h3>
              <p className={auditData.hasConsensus ? 'text-success' : 'text-warning'}>
                {auditData.hasConsensus ? 'Reached' : 'No Consensus'}
              </p>
            </div>

            <div className={`card p-6 ${auditData.isBlacklisted ? 'border-danger' : 'border-success'}`}>
              {auditData.isBlacklisted ? (
                <XCircle className="w-12 h-12 text-danger mb-3" />
              ) : (
                <CheckCircle className="w-12 h-12 text-success mb-3" />
              )}
              <h3 className="text-lg font-semibold mb-2">Blacklist Status</h3>
              <p className={auditData.isBlacklisted ? 'text-danger' : 'text-success'}>
                {auditData.isBlacklisted ? 'Blacklisted' : 'Not Blacklisted'}
              </p>
            </div>
          </div>

          {/* Overall Score */}
          <div className="card p-8">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Overall Risk Score</h2>
              <div className={`text-7xl font-bold ${getRiskColor(auditData.aggregatedScores.avgOverallScore)}`}>
                {Math.round(auditData.aggregatedScores.avgOverallScore)}
              </div>
              <span className={`badge ${getRiskLevelColor(auditData.aggregatedScores.overallRiskLevel)} text-lg px-4 py-2`}>
                {auditData.aggregatedScores.overallRiskLevel} Risk
              </span>
              <p className="text-gray-400">Based on {auditData.auditCount} audit reports</p>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gauges */}
            <div className="card p-6 space-y-6">
              <h2 className="text-2xl font-bold">Score Breakdown</h2>
              
              {/* Security */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Security</span>
                  </div>
                  <span className={`font-bold ${getRiskColor(auditData.aggregatedScores.avgSecurityScore)}`}>
                    {Math.round(auditData.aggregatedScores.avgSecurityScore)}
                  </span>
                </div>
                <div className="w-full bg-background-tertiary rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${getRiskBgColor(auditData.aggregatedScores.avgSecurityScore)}`}
                    style={{ width: `${auditData.aggregatedScores.avgSecurityScore}%` }}
                  />
                </div>
              </div>

              {/* Liquidity */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-accent-cyan" />
                    <span className="font-semibold">Liquidity</span>
                  </div>
                  <span className={`font-bold ${getRiskColor(auditData.aggregatedScores.avgLiquidityScore)}`}>
                    {Math.round(auditData.aggregatedScores.avgLiquidityScore)}
                  </span>
                </div>
                <div className="w-full bg-background-tertiary rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${getRiskBgColor(auditData.aggregatedScores.avgLiquidityScore)}`}
                    style={{ width: `${auditData.aggregatedScores.avgLiquidityScore}%` }}
                  />
                </div>
              </div>

              {/* Tokenomics */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-accent-purple" />
                    <span className="font-semibold">Tokenomics</span>
                  </div>
                  <span className={`font-bold ${getRiskColor(auditData.aggregatedScores.avgTokenomicsScore)}`}>
                    {Math.round(auditData.aggregatedScores.avgTokenomicsScore)}
                  </span>
                </div>
                <div className="w-full bg-background-tertiary rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${getRiskBgColor(auditData.aggregatedScores.avgTokenomicsScore)}`}
                    style={{ width: `${auditData.aggregatedScores.avgTokenomicsScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Radar Chart */}
            <div className="card p-6">
              <h2 className="text-2xl font-bold mb-4">Risk Profile</h2>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="category" tick={{ fill: '#9ca3af' }} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="card p-6">
            <h2 className="text-2xl font-bold mb-4">Score Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${Math.round(entry.value)}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
