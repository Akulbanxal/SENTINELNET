'use client'

import { useState } from 'react'
import { TrendingUp, AlertTriangle, CheckCircle, XCircle, Shield, Activity } from 'lucide-react'
import axios from 'axios'

interface RiskAssessment {
  isSafe: boolean
  hasConsensus: boolean
  isBlacklisted: boolean
  auditCount: number
  overallScore: number
  riskLevel: string
}

interface TradeEvaluation {
  tokenAddress: string
  canTrade: boolean
  reason: string
  riskAssessment: RiskAssessment
  recommendation: 'EXECUTE' | 'CAUTION' | 'REJECT'
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export default function TradePage() {
  const [tokenAddress, setTokenAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [evaluation, setEvaluation] = useState<TradeEvaluation | null>(null)
  const [error, setError] = useState('')

  const evaluateTrade = async () => {
    if (!tokenAddress || !tokenAddress.startsWith('0x')) {
      setError('Please enter a valid token address')
      return
    }

    setLoading(true)
    setError('')
    setEvaluation(null)

    try {
      const response = await axios.post(`${API_URL}/api/trade`, {
        tokenAddress,
      })
      setEvaluation(response.data.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to evaluate trade')
    } finally {
      setLoading(false)
    }
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'EXECUTE':
        return 'text-success'
      case 'CAUTION':
        return 'text-warning'
      case 'REJECT':
        return 'text-danger'
      default:
        return 'text-gray-400'
    }
  }

  const getRecommendationBg = (recommendation: string) => {
    switch (recommendation) {
      case 'EXECUTE':
        return 'bg-success/20 border-success'
      case 'CAUTION':
        return 'bg-warning/20 border-warning'
      case 'REJECT':
        return 'bg-danger/20 border-danger'
      default:
        return 'bg-gray-800 border-gray-700'
    }
  }

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'EXECUTE':
        return <CheckCircle className="w-16 h-16 text-success" />
      case 'CAUTION':
        return <AlertTriangle className="w-16 h-16 text-warning" />
      case 'REJECT':
        return <XCircle className="w-16 h-16 text-danger" />
      default:
        return <Activity className="w-16 h-16 text-gray-400" />
    }
  }

  const getRiskLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold gradient-text">Autonomous Trade Panel</h1>
        <p className="text-xl text-gray-400">
          AI-powered trade safety evaluation in real-time
        </p>
      </div>

      {/* Evaluation Form */}
      <div className="card p-8">
        <h2 className="text-2xl font-bold mb-6">Evaluate Token Safety</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && evaluateTrade()}
            placeholder="Enter token address (0x...)"
            className="input flex-1"
          />
          <button
            onClick={evaluateTrade}
            disabled={loading}
            className="btn btn-primary flex items-center gap-2 min-w-[160px]"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Evaluating...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4" />
                Evaluate Trade
              </>
            )}
          </button>
        </div>
        {error && <p className="text-danger text-sm mt-3">{error}</p>}
      </div>

      {/* Results */}
      {evaluation && (
        <div className="space-y-6 animate-fade-in">
          {/* Main Recommendation */}
          <div className={`card p-10 border-2 ${getRecommendationBg(evaluation.recommendation)}`}>
            <div className="text-center space-y-6">
              {getRecommendationIcon(evaluation.recommendation)}
              <div>
                <h2 className="text-4xl font-bold mb-2">
                  <span className={getRecommendationColor(evaluation.recommendation)}>
                    {evaluation.recommendation}
                  </span>
                </h2>
                <p className="text-xl text-gray-300">{evaluation.reason}</p>
              </div>
              {!evaluation.canTrade && (
                <div className="inline-block px-6 py-3 bg-danger/30 border border-danger rounded-lg">
                  <p className="text-danger font-semibold">⚠️ Trading NOT recommended</p>
                </div>
              )}
              {evaluation.canTrade && evaluation.recommendation === 'EXECUTE' && (
                <div className="inline-block px-6 py-3 bg-success/30 border border-success rounded-lg">
                  <p className="text-success font-semibold">✓ Safe to trade</p>
                </div>
              )}
            </div>
          </div>

          {/* Risk Assessment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Safety Checks */}
            <div className="card p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Safety Checks
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-background-tertiary rounded-lg">
                  <span className="text-gray-300">Token Safety</span>
                  {evaluation.riskAssessment.isSafe ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : (
                    <XCircle className="w-5 h-5 text-danger" />
                  )}
                </div>
                <div className="flex items-center justify-between p-3 bg-background-tertiary rounded-lg">
                  <span className="text-gray-300">Consensus Reached</span>
                  {evaluation.riskAssessment.hasConsensus ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : (
                    <XCircle className="w-5 h-5 text-warning" />
                  )}
                </div>
                <div className="flex items-center justify-between p-3 bg-background-tertiary rounded-lg">
                  <span className="text-gray-300">Blacklist Status</span>
                  {!evaluation.riskAssessment.isBlacklisted ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : (
                    <XCircle className="w-5 h-5 text-danger" />
                  )}
                </div>
              </div>
            </div>

            {/* Risk Metrics */}
            <div className="card p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-accent-purple" />
                Risk Metrics
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Overall Score</span>
                    <span className="text-2xl font-bold text-primary">
                      {evaluation.riskAssessment.overallScore}
                    </span>
                  </div>
                  <div className="w-full bg-background-tertiary rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        evaluation.riskAssessment.overallScore >= 80
                          ? 'bg-success'
                          : evaluation.riskAssessment.overallScore >= 60
                          ? 'bg-warning'
                          : 'bg-danger'
                      }`}
                      style={{ width: `${evaluation.riskAssessment.overallScore}%` }}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Risk Level</span>
                    <span className={`badge ${getRiskLevelColor(evaluation.riskAssessment.riskLevel)}`}>
                      {evaluation.riskAssessment.riskLevel}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Audit Count</span>
                  <span className="font-semibold">{evaluation.riskAssessment.auditCount} reports</span>
                </div>
              </div>
            </div>
          </div>

          {/* Token Address */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Token Address:</span>
              <code className="text-sm font-mono bg-background-tertiary px-4 py-2 rounded-lg">
                {evaluation.tokenAddress}
              </code>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            {evaluation.canTrade && (
              <button className="btn btn-success px-8 py-3 text-lg">
                Proceed with Trade
              </button>
            )}
            <button
              onClick={() => setEvaluation(null)}
              className="btn btn-secondary px-8 py-3 text-lg"
            >
              Evaluate Another Token
            </button>
          </div>
        </div>
      )}

      {/* Info Section */}
      {!evaluation && (
        <div className="card p-8">
          <h2 className="text-2xl font-bold mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold text-lg">Submit Token</h3>
              <p className="text-gray-400 text-sm">
                Enter the token address you want to evaluate for trading
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 bg-accent-cyan/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-accent-cyan">2</span>
              </div>
              <h3 className="font-semibold text-lg">AI Analysis</h3>
              <p className="text-gray-400 text-sm">
                Autonomous agents analyze security, liquidity, and consensus data
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-success">3</span>
              </div>
              <h3 className="font-semibold text-lg">Get Recommendation</h3>
              <p className="text-gray-400 text-sm">
                Receive instant trade recommendation: EXECUTE, CAUTION, or REJECT
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
