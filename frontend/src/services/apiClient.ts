/**
 * API Client for SentinelNet Backend
 * Base URL: http://localhost:3001
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic fetch wrapper with error handling
   */
  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API Request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // ============================================
  // AGENTS API
  // ============================================

  /**
   * GET /api/agents - Get all agents
   */
  async getAgents(type?: string, minReputation?: number) {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (minReputation) params.append('minReputation', minReputation.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.fetch<any>(`/api/agents${query}`);
  }

  /**
   * GET /api/agents/:address - Get agent by address
   */
  async getAgentByAddress(address: string) {
    return this.fetch<any>(`/api/agents/${address}`);
  }

  // ============================================
  // JOBS API
  // ============================================

  /**
   * GET /api/jobs - Get all jobs
   */
  async getJobs(status?: string, client?: string) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (client) params.append('client', client);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.fetch<any>(`/api/jobs${query}`);
  }

  /**
   * GET /api/jobs/:id - Get job by ID
   */
  async getJobById(id: string | number) {
    return this.fetch<any>(`/api/jobs/${id}`);
  }

  /**
   * POST /api/jobs - Create a new verification job
   */
  async createJob(jobData: any) {
    return this.fetch<any>('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  // ============================================
  // AUDITS API
  // ============================================

  /**
   * GET /api/audits/stats - Get audit statistics
   */
  async getAuditStats() {
    return this.fetch<any>('/api/audits/stats');
  }

  /**
   * GET /api/audits/:token - Get audits for a token
   */
  async getTokenAudits(tokenAddress: string) {
    return this.fetch<any>(`/api/audits/${tokenAddress}`);
  }

  /**
   * GET /api/audits/:token/safety - Check if token is safe
   */
  async checkTokenSafety(tokenAddress: string) {
    return this.fetch<any>(`/api/audits/${tokenAddress}/safety`);
  }

  // ============================================
  // TRADES API
  // ============================================

  /**
   * POST /api/trades - Evaluate a trade
   */
  async evaluateTrade(tokenAddress: string) {
    return this.fetch<any>('/api/trades', {
      method: 'POST',
      body: JSON.stringify({ tokenAddress }),
    });
  }

  /**
   * POST /api/trades/create - Create a trade order
   */
  async createTradeOrder(orderData: any) {
    return this.fetch<any>('/api/trades/create', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  /**
   * GET /api/trades/:orderId - Get trade order by ID
   */
  async getTradeOrder(orderId: string) {
    return this.fetch<any>(`/api/trades/${orderId}`);
  }

  // ============================================
  // ANALYTICS API
  // ============================================

  /**
   * GET /api/analytics/overview - Get analytics overview
   */
  async getAnalyticsOverview() {
    return this.fetch<any>('/api/analytics/overview');
  }

  /**
   * GET /api/analytics/risk-distribution - Get risk distribution
   */
  async getRiskDistribution() {
    return this.fetch<any>('/api/analytics/risk-distribution');
  }

  // ============================================
  // HEALTH CHECK
  // ============================================

  /**
   * GET /health - Health check
   */
  async healthCheck() {
    return this.fetch<any>('/health');
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for custom instances
export default ApiClient;
