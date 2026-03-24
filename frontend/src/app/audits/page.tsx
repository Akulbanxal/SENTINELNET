'use client'

import { useState, useEffect } from 'react'
import { FileText, Clock, Shield, TrendingUp, Activity, User } from 'lucide-react'
import axios from 'axios'
import { format } from 'date-fns'

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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export default function AuditsPage() {
  const [tokenAddress, setTokenAddress] = useState('')
  const [reports, setReports] = useState<AuditReport[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const searchAudits = async () => {
    if (!tokenAddress || !tokenAddress.startsWith('0x')) {
      setError('Please enter a valid token address')
      return
    }

    setLoading(true)
    setError('')
    setReports([])

    try {
      const response = await axios.get(`${API_URL}/api/audits/${tokenAddress}`)
      setReports(response.data.data.reports || [])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch audits')
    } finally {
      setLoading(false)
    }
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success'
    if (score >= 60) return 'text-warning'
    return 'text-danger'
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold gradient-text">Audit Reports</h1>
        <p className="text-xl text-gray-400">
          Detailed verification reports from autonomous agents
        </p>
      </div>

      {/* Search */}
      <div className="card p-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchAudits()}
            placeholder="Enter token address to view audit reports"
            className="input flex-1"
          />
          <button
            onClick={searchAudits}
            disabled={loading}
            className="btn btn-primary flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            {loading ? 'Loading...' : 'Search'}
          </button>
        </div>
        {error && <p className="text-danger text-sm mt-2">{error}</p>}
      </div>

      {/* Reports */}
      {reports.length > 0 && (
        <div className="space-y-6">
          {/* Timeline Visualization */}
          <div className="card p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6 text-primary" />
              Verification Timeline
            </h2>
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent-cyan to-accent-purple" />

              {/* Timeline Items */}
              <div className="space-y-8">
                {reports
                  .sort((a, b) => b.timestamp - a.timestamp)
                  .map((report, index) => (
                    <div key={index} className="relative pl-20">
                      {/* Timeline Dot */}
                      <div className="absolute left-6 w-5 h-5 bg-primary rounded-full border-4 border-background" />

                      {/* Report Card */}
                      <div className="card p-6 card-hover">
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/20 rounded-lg">
                              <User className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg">{report.auditorName}</h3>
                              <p className="text-sm text-gray-400 font-mono">
                                {report.auditor.slice(0, 10)}...{report.auditor.slice(-8)}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`badge ${getRiskLevelColor(report.riskLevel)}`}>
                              {report.riskLevel} Risk
                            </span>
                            <span className="text-sm text-gray-400">
                              {format(new Date(report.timestamp * 1000), 'MMM dd, yyyy HH:mm')}
                            </span>
                          </div>
                        </div>

                        {/* Scores Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="bg-background-tertiary p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Shield className="w-4 h-4 text-primary" />
                              <span className="text-sm text-gray-400">Security</span>
                            </div>
                            <div className={`text-2xl font-bold ${getScoreColor(report.scores.securityScore)}`}>
                              {report.scores.securityScore}
                            </div>
                          </div>

                          <div className="bg-background-tertiary p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className="w-4 h-4 text-accent-cyan" />
                              <span className="text-sm text-gray-400">Liquidity</span>
                            </div>
                            <div className={`text-2xl font-bold ${getScoreColor(report.scores.liquidityScore)}`}>
                              {report.scores.liquidityScore}
                            </div>
                          </div>

                          <div className="bg-background-tertiary p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Activity className="w-4 h-4 text-accent-purple" />
                              <span className="text-sm text-gray-400">Tokenomics</span>
                            </div>
                            <div className={`text-2xl font-bold ${getScoreColor(report.scores.tokenomicsScore)}`}>
                              {report.scores.tokenomicsScore}
                            </div>
                          </div>

                          <div className="bg-background-tertiary p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="w-4 h-4 text-warning" />
                              <span className="text-sm text-gray-400">Overall</span>
                            </div>
                            <div className={`text-2xl font-bold ${getScoreColor(report.scores.overallScore)}`}>
                              {report.scores.overallScore}
                            </div>
                          </div>
                        </div>

                        {/* Findings */}
                        {report.findings && (
                          <div className="bg-background-tertiary p-4 rounded-lg">
                            <h4 className="font-semibold mb-2 text-gray-300">Key Findings:</h4>
                            <p className="text-gray-400 text-sm whitespace-pre-wrap">{report.findings}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="stat-card">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">{reports.length}</div>
                <div className="text-gray-400">Total Audits</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="text-center">
                <div className="text-4xl font-bold text-success mb-2">
                  {Math.round(
                    reports.reduce((sum, r) => sum + r.scores.overallScore, 0) / reports.length
                  )}
                </div>
                <div className="text-gray-400">Average Score</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="text-center">
                <div className="text-4xl font-bold text-accent-cyan mb-2">
                  {new Set(reports.map((r) => r.auditor)).size}
                </div>
                <div className="text-gray-400">Unique Auditors</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
