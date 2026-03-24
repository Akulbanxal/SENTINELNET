import { EventEmitter } from 'events'
import { broadcast } from './ws'

type Agent = {
  id: string
  name: string
  type: string
  reputation: number
  isActive: boolean
}

type Job = {
  id: string
  tokenAddress: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  riskScore?: number | null
  agents: Agent[]
  createdAt: string
  updatedAt: string
}

class SimulationService extends EventEmitter {
  private running = false
  private interval: NodeJS.Timeout | null = null
  private jobs: Job[] = []
  private agents: Agent[] = []
  private jobCounter = 1

  constructor() {
    super()
    // Initialize mock agents
    this.agents = [
      { id: 'a1', name: 'SecurityBot Alpha', type: 'Security', reputation: 95, isActive: true },
      { id: 'a2', name: 'LiquidityScanner Pro', type: 'Liquidity', reputation: 88, isActive: true },
      { id: 'a3', name: 'TokenomicsAnalyzer', type: 'Tokenomics', reputation: 90, isActive: true },
    ]
  }

  start() {
    if (this.running) return
    this.running = true
    this.emitStatus()
    this.interval = setInterval(() => this.generateAndRun(), 5000)
    console.log('SimulationService started')
  }

  stop() {
    if (!this.running) return
    this.running = false
    if (this.interval) clearInterval(this.interval)
    this.interval = null
    this.emitStatus()
    console.log('SimulationService stopped')
  }

  isRunning() {
    return this.running
  }

  listAgents() {
    return this.agents
  }

  listJobs() {
    return this.jobs
  }

  createJob(tokenAddress?: string) {
    const job: Job = {
      id: String(this.jobCounter++),
      tokenAddress: tokenAddress || this.randomTokenAddress(),
      status: 'pending',
      agents: this.agents,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.jobs.unshift(job)
    this.emitEvent('job_created', job)
    broadcast({ type: 'job_created', data: job })
    return job
  }

  async generateAndRun() {
    const job = this.createJob()
    await this.runJob(job)
  }

  async runJob(job: Job) {
    try {
      job.status = 'in_progress'
      job.updatedAt = new Date().toISOString()
      this.emitEvent('job_started', job)
      broadcast({ type: 'job_started', data: job })

      // Simulate each agent work
      for (const agent of job.agents) {
        this.emitEvent('agent_started', { jobId: job.id, agent })
        broadcast({ type: 'agent_started', data: { jobId: job.id, agent } })
        await this.delay(800 + Math.random() * 1200)
        this.emitEvent('agent_finished', { jobId: job.id, agent })
        broadcast({ type: 'agent_finished', data: { jobId: job.id, agent } })
      }

      // Calculate risk score
      const riskScore = this.calculateRisk(job)
      job.riskScore = riskScore
      job.status = 'completed'
      job.updatedAt = new Date().toISOString()

      this.emitEvent('risk_score_updated', { jobId: job.id, riskScore })
      broadcast({ type: 'risk_score_updated', data: { jobId: job.id, riskScore } })

      // Trade decision
      const decision = riskScore >= 80 ? 'EXECUTE' : riskScore >= 60 ? 'CAUTION' : 'REJECT'
      this.emitEvent('trade_decision', { jobId: job.id, decision })
      broadcast({ type: 'trade_decision', data: { jobId: job.id, decision } })

      this.emitEvent('job_finished', job)
      broadcast({ type: 'job_finished', data: job })
    } catch (err) {
      job.status = 'failed'
      job.updatedAt = new Date().toISOString()
      this.emitEvent('job_failed', { job, error: err })
      broadcast({ type: 'job_failed', data: { job, error: String(err) } })
    }
  }

  calculateRisk(job: Job) {
    // Simple average of agent reputations plus random noise
    const avgRep = job.agents.reduce((s, a) => s + a.reputation, 0) / job.agents.length
    const noise = (Math.random() - 0.5) * 20
    const score = Math.max(0, Math.min(100, Math.round(avgRep + noise)))
    return score
  }

  emitEvent(type: string, payload: any) {
    this.emit(type, payload)
    console.log(`[SIM] ${type}`, payload && payload.jobId ? payload.jobId : '')
  }

  emitStatus() {
    const status = {
      running: this.running,
      agents: this.agents.length,
      jobs: this.jobs.length,
    }
    this.emit('status', status)
    broadcast({ type: 'simulation_status', data: status })
  }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  randomTokenAddress() {
    const hex = () => Math.floor(Math.random() * 16).toString(16)
    return '0x' + Array.from({ length: 40 }).map(hex).join('')
  }
}

export const simulationService = new SimulationService()

export default simulationService
