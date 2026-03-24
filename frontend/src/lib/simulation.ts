import type {
  Agent,
  VerificationJob,
  ActivityLog,
  AgentActivity,
  MockToken,
  RiskScores,
  AuditReport,
  TokenScenario,
  TradeRecommendation,
  JobStatus,
  VerificationStep,
} from '@/types'

// ============================================
// MOCK TOKEN SCENARIOS
// ============================================

export const MOCK_TOKENS: Record<TokenScenario, MockToken> = {
  safe: {
    address: '0x1234567890123456789012345678901234567890',
    name: 'SafeCoin',
    symbol: 'SAFE',
    scenario: 'safe',
    expectedOutcome: 'EXECUTE',
    mockData: {
      security: {
        hasOwnership: false,
        hasMint: false,
        hasBlacklist: false,
        hasPausable: false,
        hasProxyPattern: false,
        score: 92,
      },
      liquidity: {
        poolSize: '$5,000,000',
        volume24h: '$250,000',
        holders: 15000,
        liquidity: 'High',
        score: 88,
      },
      tokenomics: {
        totalSupply: '1,000,000,000',
        circulatingSupply: '800,000,000',
        topHolderPercentage: 8,
        burnPercentage: 10,
        score: 85,
      },
    },
  },
  risky: {
    address: '0xABCDEF1234567890ABCDEF1234567890ABCDEF12',
    name: 'ScamCoin',
    symbol: 'SCAM',
    scenario: 'risky',
    expectedOutcome: 'REJECT',
    mockData: {
      security: {
        hasOwnership: true,
        hasMint: true,
        hasBlacklist: true,
        hasPausable: true,
        hasProxyPattern: true,
        score: 25,
      },
      liquidity: {
        poolSize: '$50,000',
        volume24h: '$2,000',
        holders: 50,
        liquidity: 'Very Low',
        score: 30,
      },
      tokenomics: {
        totalSupply: '1,000,000,000,000',
        circulatingSupply: '100,000,000',
        topHolderPercentage: 75,
        burnPercentage: 0,
        score: 20,
      },
    },
  },
  medium: {
    address: '0x9876543210987654321098765432109876543210',
    name: 'MediumCoin',
    symbol: 'MED',
    scenario: 'medium',
    expectedOutcome: 'CAUTION',
    mockData: {
      security: {
        hasOwnership: true,
        hasMint: false,
        hasBlacklist: false,
        hasPausable: false,
        hasProxyPattern: false,
        score: 68,
      },
      liquidity: {
        poolSize: '$500,000',
        volume24h: '$35,000',
        holders: 2000,
        liquidity: 'Medium',
        score: 65,
      },
      tokenomics: {
        totalSupply: '100,000,000',
        circulatingSupply: '80,000,000',
        topHolderPercentage: 25,
        burnPercentage: 5,
        score: 62,
      },
    },
  },
  custom: {
    address: '0x0000000000000000000000000000000000000000',
    name: 'CustomToken',
    symbol: 'CSTM',
    scenario: 'custom',
    expectedOutcome: 'CAUTION',
    mockData: {
      security: {
        hasOwnership: false,
        hasMint: false,
        hasBlacklist: false,
        hasPausable: false,
        hasProxyPattern: false,
        score: 70,
      },
      liquidity: {
        poolSize: '$1,000,000',
        volume24h: '$50,000',
        holders: 5000,
        liquidity: 'Medium',
        score: 70,
      },
      tokenomics: {
        totalSupply: '500,000,000',
        circulatingSupply: '400,000,000',
        topHolderPercentage: 15,
        burnPercentage: 7,
        score: 70,
      },
    },
  },
}

// ============================================
// MOCK AGENTS
// ============================================

export const MOCK_AGENTS: Agent[] = [
  {
    address: '0xAgent1111111111111111111111111111111111111',
    name: 'SecurityAuditBot',
    agentType: 0,
    agentTypeName: 'Security',
    specialization: 'Smart Contract Security',
    pricePerVerification: '0.01',
    reputation: 95,
    totalJobs: 1247,
    successfulJobs: 1235,
    isActive: true,
  },
  {
    address: '0xAgent2222222222222222222222222222222222222',
    name: 'LiquidityRiskBot',
    agentType: 1,
    agentTypeName: 'Liquidity',
    specialization: 'Market Liquidity Analysis',
    pricePerVerification: '0.008',
    reputation: 88,
    totalJobs: 892,
    successfulJobs: 881,
    isActive: true,
  },
  {
    address: '0xAgent3333333333333333333333333333333333333',
    name: 'TokenomicsAnalysisBot',
    agentType: 2,
    agentTypeName: 'Tokenomics',
    specialization: 'Token Distribution & Economics',
    pricePerVerification: '0.009',
    reputation: 90,
    totalJobs: 1056,
    successfulJobs: 1045,
    isActive: true,
  },
  {
    address: '0xAgent4444444444444444444444444444444444444',
    name: 'TraderAgent',
    agentType: 3,
    agentTypeName: 'Market',
    specialization: 'Autonomous Trading',
    pricePerVerification: '0.015',
    reputation: 92,
    totalJobs: 658,
    successfulJobs: 655,
    isActive: true,
  },
]

// ============================================
// SIMULATION ENGINE
// ============================================

export class SimulationEngine {
  private jobs: Map<string, VerificationJob> = new Map()
  private activityLog: ActivityLog[] = []
  private listeners: Set<(state: any) => void> = new Set()

  constructor() {}

  // Subscribe to simulation updates
  subscribe(callback: (state: any) => void) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private notify() {
    const state = {
      jobs: Array.from(this.jobs.values()),
      activityLog: this.activityLog,
      activeJobs: Array.from(this.jobs.values()).filter(j => j.status === 'in-progress').length,
      completedJobs: Array.from(this.jobs.values()).filter(j => j.status === 'completed').length,
    }
    this.listeners.forEach(callback => callback(state))
  }

  // Create a new verification job
  createJob(token: MockToken): string {
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const job: VerificationJob = {
      id: jobId,
      tokenAddress: token.address,
      tokenName: token.name,
      status: 'queued',
      assignedAgents: [],
      startTime: Date.now(),
      estimatedCompletion: Date.now() + 30000, // 30 seconds
      progress: 0,
      currentStep: 'discovery',
    }

    this.jobs.set(jobId, job)
    
    this.addLog({
      type: 'token-discovered',
      message: `New token discovered: ${token.name} (${token.symbol})`,
      severity: 'info',
      metadata: { token },
    })

    this.notify()
    return jobId
  }

  // Start job execution
  async executeJob(jobId: string, token: MockToken, speedMultiplier: number = 1): Promise<void> {
    const job = this.jobs.get(jobId)
    if (!job) return

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms / speedMultiplier))

    try {
      // Ensure token has proper mockData structure
      if (!token.mockData) {
        console.warn('Token missing mockData, using defaults:', token)
        token.mockData = {
          security: { hasOwnership: false, hasMint: false, hasBlacklist: false, hasPausable: false, hasProxyPattern: false, score: 50 },
          liquidity: { poolSize: '$500,000', volume24h: '$25,000', holders: 1000, liquidity: 'Medium', score: 50 },
          tokenomics: { totalSupply: '1B', circulatingSupply: '500M', topHolderPercentage: 20, burnPercentage: 5, score: 50 },
        }
      }

      // Step 1: Hire agents
      job.status = 'in-progress'
      job.currentStep = 'hiring-agents'
      job.progress = 10
      this.notify()
      await delay(2000)

      const agentsToHire = MOCK_AGENTS.slice(0, 3) // Hire first 3 agents
      job.assignedAgents = agentsToHire.map(a => a.address)
      
      this.addLog({
        type: 'agent-hired',
        message: `Hired ${agentsToHire.length} agents for verification`,
        severity: 'success',
        metadata: { jobId, agents: agentsToHire.map(a => a.name) },
      })
      this.notify()
      await delay(1500)

      // Step 2: Security analysis
      job.currentStep = 'security-analysis'
      job.progress = 30
      this.notify()
      await delay(3000)

      this.addLog({
        type: 'audit-completed',
        message: `Security analysis complete: Score ${token.mockData.security.score}/100`,
        severity: token.mockData.security.score >= 70 ? 'success' : 'warning',
        metadata: { jobId, score: token.mockData.security.score },
      })
      this.notify()
      await delay(1500)

      // Step 3: Liquidity analysis
      job.currentStep = 'liquidity-analysis'
      job.progress = 50
      this.notify()
      await delay(3000)

      this.addLog({
        type: 'audit-completed',
        message: `Liquidity analysis complete: Score ${token.mockData.liquidity.score}/100`,
        severity: token.mockData.liquidity.score >= 70 ? 'success' : 'warning',
        metadata: { jobId, score: token.mockData.liquidity.score },
      })
      this.notify()
      await delay(1500)

      // Step 4: Tokenomics analysis
      job.currentStep = 'tokenomics-analysis'
      job.progress = 70
      this.notify()
      await delay(3000)

      this.addLog({
        type: 'audit-completed',
        message: `Tokenomics analysis complete: Score ${token.mockData.tokenomics.score}/100`,
        severity: token.mockData.tokenomics.score >= 70 ? 'success' : 'warning',
        metadata: { jobId, score: token.mockData.tokenomics.score },
      })
      this.notify()
      await delay(1500)

      // Step 5: Risk aggregation
      job.currentStep = 'risk-aggregation'
      job.progress = 85
      this.notify()
      await delay(2000)

      const overallScore = Math.round(
        (token.mockData.security.score * 0.4) +
        (token.mockData.liquidity.score * 0.3) +
        (token.mockData.tokenomics.score * 0.3)
      )

      job.results = {
        securityScore: token.mockData.security.score,
        liquidityScore: token.mockData.liquidity.score,
        tokenomicsScore: token.mockData.tokenomics.score,
        overallScore,
      }

      this.addLog({
        type: 'risk-calculated',
        message: `Risk aggregation complete: Overall score ${overallScore}/100`,
        severity: overallScore >= 80 ? 'success' : overallScore >= 60 ? 'warning' : 'error',
        metadata: { jobId, overallScore },
      })
      this.notify()
      await delay(1500)

      // Step 6: Trade decision
      job.currentStep = 'decision-making'
      job.progress = 100
      this.notify()
      await delay(2000)

      this.addLog({
        type: 'trade-decision',
        message: `Trade decision: ${token.expectedOutcome} - ${this.getDecisionReason(token.expectedOutcome)}`,
        severity: token.expectedOutcome === 'EXECUTE' ? 'success' : token.expectedOutcome === 'CAUTION' ? 'warning' : 'error',
        metadata: { jobId, decision: token.expectedOutcome, score: overallScore },
      })

      // Complete job
      job.status = 'completed'
      this.notify()

    } catch (error) {
      job.status = 'failed'
      this.addLog({
        type: 'error',
        message: `Job ${jobId} failed: ${error}`,
        severity: 'error',
        metadata: { jobId, error },
      })
      this.notify()
    }
  }

  private getDecisionReason(decision: TradeRecommendation): string {
    switch (decision) {
      case 'EXECUTE':
        return 'All safety checks passed. Safe to trade.'
      case 'CAUTION':
        return 'Some concerns detected. Proceed with caution.'
      case 'REJECT':
        return 'High risk detected. Do not trade.'
      default:
        return 'Analysis incomplete'
    }
  }

  private addLog(log: Omit<ActivityLog, 'id' | 'timestamp'>) {
    const newLog: ActivityLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    }
    
    this.activityLog.unshift(newLog)
    
    // Keep only last 100 logs
    if (this.activityLog.length > 100) {
      this.activityLog = this.activityLog.slice(0, 100)
    }
  }

  getJob(jobId: string): VerificationJob | undefined {
    return this.jobs.get(jobId)
  }

  getAllJobs(): VerificationJob[] {
    return Array.from(this.jobs.values())
  }

  getActivityLog(): ActivityLog[] {
    return this.activityLog
  }

  clear() {
    this.jobs.clear()
    this.activityLog = []
    this.notify()
  }
}

// Export singleton instance
export const simulationEngine = new SimulationEngine()
