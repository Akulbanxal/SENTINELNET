import axios, { AxiosInstance, AxiosError } from 'axios'
import type {
  Agent,
  AuditReport,
  TokenAuditData,
  TradeEvaluation,
  RiskAssessment,
  ApiResponse,
  PaginatedResponse,
} from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

class ApiService {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        console.error('API Error:', error.response?.data || error.message)
        return Promise.reject(error)
      }
    )
  }

  // ============================================
  // HEALTH CHECK
  // ============================================

  async healthCheck(): Promise<{ status: string; message: string }> {
    const response = await this.client.get('/health')
    return response.data
  }

  // ============================================
  // AGENT ENDPOINTS
  // ============================================

  async getAgents(filter?: string): Promise<ApiResponse<{ agents: Agent[] }>> {
    const endpoint = filter && filter !== 'all' 
      ? `/api/agents/${filter}` 
      : '/api/agents'
    
    const response = await this.client.get(endpoint)
    return response.data
  }

  async getAgentById(address: string): Promise<ApiResponse<{ agent: Agent }>> {
    const response = await this.client.get(`/api/agents/${address}`)
    return response.data
  }

  async registerAgent(agentData: Partial<Agent>): Promise<ApiResponse<{ agent: Agent }>> {
    const response = await this.client.post('/api/agents/register', agentData)
    return response.data
  }

  async updateAgentStatus(
    address: string, 
    isActive: boolean
  ): Promise<ApiResponse<{ agent: Agent }>> {
    const response = await this.client.patch(`/api/agents/${address}/status`, {
      isActive,
    })
    return response.data
  }

  // ============================================
  // AUDIT ENDPOINTS
  // ============================================

  async getAudits(
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<AuditReport>> {
    const response = await this.client.get('/api/audits', {
      params: { page, pageSize },
    })
    return response.data
  }

  async getAuditsByToken(
    tokenAddress: string
  ): Promise<ApiResponse<TokenAuditData>> {
    const response = await this.client.get(`/api/audits/${tokenAddress}`)
    return response.data
  }

  async submitAudit(
    auditData: Partial<AuditReport>
  ): Promise<ApiResponse<{ audit: AuditReport }>> {
    const response = await this.client.post('/api/audits/submit', auditData)
    return response.data
  }

  async getAuditsByAgent(
    agentAddress: string
  ): Promise<ApiResponse<{ audits: AuditReport[] }>> {
    const response = await this.client.get(`/api/audits/agent/${agentAddress}`)
    return response.data
  }

  // ============================================
  // RISK ASSESSMENT ENDPOINTS
  // ============================================

  async getRiskAssessment(
    tokenAddress: string
  ): Promise<ApiResponse<RiskAssessment>> {
    const response = await this.client.get(`/api/risk/${tokenAddress}`)
    return response.data
  }

  async analyzeRisk(tokenAddress: string): Promise<ApiResponse<RiskAssessment>> {
    const response = await this.client.post('/api/risk/analyze', {
      tokenAddress,
    })
    return response.data
  }

  // ============================================
  // TRADE ENDPOINTS
  // ============================================

  async evaluateTrade(
    tokenAddress: string
  ): Promise<ApiResponse<TradeEvaluation>> {
    const response = await this.client.post('/api/trades/evaluate', {
      tokenAddress,
    })
    return response.data
  }

  async getTrades(
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<TradeEvaluation>> {
    const response = await this.client.get('/api/trades', {
      params: { page, pageSize },
    })
    return response.data
  }

  async executeTrade(tokenAddress: string, amount: string): Promise<ApiResponse<any>> {
    const response = await this.client.post('/api/trades/execute', {
      tokenAddress,
      amount,
    })
    return response.data
  }

  // ============================================
  // STATS ENDPOINTS
  // ============================================

  async getStats(): Promise<ApiResponse<{
    totalAgents: number
    activeAgents: number
    totalAudits: number
    totalTrades: number
  }>> {
    const response = await this.client.get('/api/stats')
    return response.data
  }
}

// Export singleton instance
export const apiService = new ApiService()

// Export class for testing
export default ApiService
