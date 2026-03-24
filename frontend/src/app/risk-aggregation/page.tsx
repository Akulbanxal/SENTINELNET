'use client'

import { useState } from 'react'
import { useRiskAggregation } from '@/hooks/useRiskAggregation'
import { RISK_WEIGHTS, RISK_THRESHOLDS } from '@/lib/riskAggregation'

export default function RiskAggregationPage() {
  const [showBreakdown, setShowBreakdown] = useState(true)

  const {
    result,
    inputs,
    isValid,
    description,
    colors,
    recommendation,
    updateSecurityScore,
    updateLiquidityScore,
    updateTokenomicsScore,
    updateAllScores,
    reset,
    finalRiskScore,
    riskLevel,
    breakdown,
  } = useRiskAggregation({
    autoCalculate: true,
    onRiskLevelChange: (newLevel, oldLevel) => {
      console.log(`Risk level changed from ${oldLevel} to ${newLevel}`)
    },
  })

  // Predefined test scenarios
  const scenarios = [
    {
      name: '🟢 Safe Token',
      description: 'Low risk across all metrics',
      scores: { securityScore: 15, liquidityScore: 20, tokenomicsScore: 25 },
    },
    {
      name: '🟡 Moderate Risk',
      description: 'Some concerns but manageable',
      scores: { securityScore: 35, liquidityScore: 45, tokenomicsScore: 50 },
    },
    {
      name: '🔴 High Risk',
      description: 'Dangerous - avoid trading',
      scores: { securityScore: 75, liquidityScore: 80, tokenomicsScore: 70 },
    },
    {
      name: '⚠️ Security Focused',
      description: 'High security risk dominates',
      scores: { securityScore: 85, liquidityScore: 20, tokenomicsScore: 15 },
    },
    {
      name: '💧 Liquidity Issues',
      description: 'Liquidity concerns',
      scores: { securityScore: 20, liquidityScore: 90, tokenomicsScore: 25 },
    },
    {
      name: '📊 Tokenomics Problems',
      description: 'Poor token distribution',
      scores: { securityScore: 15, liquidityScore: 25, tokenomicsScore: 95 },
    },
  ]

  const getRiskScoreColor = (score: number) => {
    if (score < 30) return 'text-green-600'
    if (score <= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRiskScoreBg = (score: number) => {
    if (score < 30) return 'bg-green-100 border-green-300'
    if (score <= 60) return 'bg-yellow-100 border-yellow-300'
    return 'bg-red-100 border-red-300'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎯 Risk Aggregation Engine
          </h1>
          <p className="text-gray-600">
            Calculate final risk scores using weighted aggregation of security, liquidity, and
            tokenomics metrics
          </p>
        </div>

        {/* Algorithm Explanation */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📐 Algorithm</h2>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <code className="text-sm font-mono text-blue-900">
                finalRiskScore = (securityScore × 0.5) + (liquidityScore × 0.3) +
                (tokenomicsScore × 0.2)
              </code>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-sm font-medium text-purple-900 mb-1">Security Weight</div>
                <div className="text-2xl font-bold text-purple-600">
                  {RISK_WEIGHTS.security * 100}%
                </div>
                <p className="text-xs text-purple-700 mt-1">Most critical for safety</p>
              </div>
              <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                <div className="text-sm font-medium text-cyan-900 mb-1">Liquidity Weight</div>
                <div className="text-2xl font-bold text-cyan-600">
                  {RISK_WEIGHTS.liquidity * 100}%
                </div>
                <p className="text-xs text-cyan-700 mt-1">Important for execution</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="text-sm font-medium text-emerald-900 mb-1">
                  Tokenomics Weight
                </div>
                <div className="text-2xl font-bold text-emerald-600">
                  {RISK_WEIGHTS.tokenomics * 100}%
                </div>
                <p className="text-xs text-emerald-700 mt-1">Long-term indicator</p>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-900 mb-2">Risk Levels:</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    🟢 SAFE (0 - {RISK_THRESHOLDS.safe - 1})
                  </span>
                  <span className="text-xs text-green-600 font-medium">Low risk, safe to trade</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    🟡 WARNING ({RISK_THRESHOLDS.safe} - {RISK_THRESHOLDS.warning})
                  </span>
                  <span className="text-xs text-yellow-600 font-medium">
                    Moderate risk, proceed with caution
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    🔴 DANGER ({RISK_THRESHOLDS.warning + 1} - 100)
                  </span>
                  <span className="text-xs text-red-600 font-medium">High risk, avoid trading</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Input Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🎮 Input Scores</h2>
          <div className="space-y-6">
            {/* Security Score */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  🔒 Security Score
                </label>
                <span className="text-lg font-bold text-purple-600">
                  {inputs.securityScore}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={inputs.securityScore}
                onChange={(e) => updateSecurityScore(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0 (Safe)</span>
                <span>100 (Dangerous)</span>
              </div>
            </div>

            {/* Liquidity Score */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  💧 Liquidity Score
                </label>
                <span className="text-lg font-bold text-cyan-600">{inputs.liquidityScore}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={inputs.liquidityScore}
                onChange={(e) => updateLiquidityScore(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0 (Safe)</span>
                <span>100 (Dangerous)</span>
              </div>
            </div>

            {/* Tokenomics Score */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  📊 Tokenomics Score
                </label>
                <span className="text-lg font-bold text-emerald-600">
                  {inputs.tokenomicsScore}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={inputs.tokenomicsScore}
                onChange={(e) => updateTokenomicsScore(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0 (Safe)</span>
                <span>100 (Dangerous)</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={reset}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                🔄 Reset
              </button>
              <button
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {showBreakdown ? '👁️ Hide' : '👁️ Show'} Breakdown
              </button>
            </div>
          </div>
        </div>

        {/* Test Scenarios */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🧪 Test Scenarios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenarios.map((scenario, idx) => (
              <button
                key={idx}
                onClick={() => updateAllScores(scenario.scores)}
                className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all"
              >
                <div className="text-lg font-semibold text-gray-900 mb-1">{scenario.name}</div>
                <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Sec:</span>{' '}
                    <span className="font-medium">{scenario.scores.securityScore}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Liq:</span>{' '}
                    <span className="font-medium">{scenario.scores.liquidityScore}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Tok:</span>{' '}
                    <span className="font-medium">{scenario.scores.tokenomicsScore}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Final Risk Score */}
            <div
              className={`rounded-xl shadow-lg p-8 border-2 ${
                colors ? `${colors.bg} ${colors.border}` : 'bg-gray-100 border-gray-300'
              }`}
            >
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Final Risk Score
                </h2>
                <div className={`text-7xl font-bold mb-4 ${getRiskScoreColor(finalRiskScore!)}`}>
                  {finalRiskScore?.toFixed(2)}
                </div>
                <div className="space-y-2">
                  <div
                    className={`inline-block px-6 py-3 rounded-full text-xl font-bold ${
                      colors ? `${colors.bg} ${colors.text}` : 'bg-gray-200 text-gray-800'
                    } border-2 ${colors?.border}`}
                  >
                    {riskLevel}
                  </div>
                  {description && (
                    <p className="text-lg text-gray-700 font-medium">{description}</p>
                  )}
                  {recommendation && (
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <p className="text-sm text-gray-600 mb-2">Trade Recommendation:</p>
                      <div
                        className={`inline-block px-4 py-2 rounded-lg text-lg font-bold ${
                          recommendation === 'APPROVE'
                            ? 'bg-green-600 text-white'
                            : recommendation === 'REVIEW'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-red-600 text-white'
                        }`}
                      >
                        {recommendation}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Breakdown */}
            {showBreakdown && breakdown && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  📊 Score Breakdown
                </h2>
                <div className="space-y-4">
                  {/* Security Contribution */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        🔒 Security Contribution (50%)
                      </span>
                      <span className="text-lg font-bold text-purple-600">
                        {breakdown.securityContribution.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mb-1">
                      {inputs.securityScore} × 0.5 = {breakdown.securityContribution.toFixed(2)}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${breakdown.securityContribution}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Liquidity Contribution */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        💧 Liquidity Contribution (30%)
                      </span>
                      <span className="text-lg font-bold text-cyan-600">
                        {breakdown.liquidityContribution.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mb-1">
                      {inputs.liquidityScore} × 0.3 = {breakdown.liquidityContribution.toFixed(2)}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-cyan-600 h-2 rounded-full"
                        style={{ width: `${breakdown.liquidityContribution}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Tokenomics Contribution */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        📊 Tokenomics Contribution (20%)
                      </span>
                      <span className="text-lg font-bold text-emerald-600">
                        {breakdown.tokenomicsContribution.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mb-1">
                      {inputs.tokenomicsScore} × 0.2 ={' '}
                      {breakdown.tokenomicsContribution.toFixed(2)}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-emerald-600 h-2 rounded-full"
                        style={{ width: `${breakdown.tokenomicsContribution}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="pt-4 border-t-2 border-gray-300">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">Total Risk Score</span>
                      <span className={`text-2xl font-bold ${getRiskScoreColor(finalRiskScore!)}`}>
                        {finalRiskScore?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
