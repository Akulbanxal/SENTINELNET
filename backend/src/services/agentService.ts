import { ethers } from 'ethers';
import { agentMarketplaceContract, AgentType } from '../config/contracts.js';
import { cache } from '../utils/cache.js';
import { logger } from '../utils/logger.js';
import { ContractError, NotFoundError } from '../utils/errors.js';

export interface AgentInfo {
  address: string;
  name: string;
  endpoint: string;
  agentType: number;
  agentTypeName: string;
  pricePerVerification: string;
  reputation: number;
  totalJobs: number;
  isActive: boolean;
}

export interface AgentStats extends AgentInfo {
  successRate: number;
  averageResponseTime: number;
}

// Map agent type enum to readable name
function getAgentTypeName(agentType: number): string {
  switch (agentType) {
    case AgentType.Security:
      return 'Security';
    case AgentType.Liquidity:
      return 'Liquidity';
    case AgentType.Tokenomics:
      return 'Tokenomics';
    case AgentType.Market:
      return 'Market';
    default:
      return 'Unknown';
  }
}

export class AgentService {
  /**
   * Get all registered agents
   */
  async getAllAgents(): Promise<AgentInfo[]> {
    const cacheKey = 'agents:all';
    const cached = cache.get<AgentInfo[]>(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      logger.info('Fetching all agents from contract');

      const agentAddresses: string[] = await agentMarketplaceContract.getAllAgents();

      const agents = await Promise.all(
        agentAddresses.map((address: string) => this.getAgentInfo(address))
      );

      // Filter out null results
      const validAgents = agents.filter((a): a is AgentInfo => a !== null);

      cache.set(cacheKey, validAgents);
      return validAgents;
    } catch (error: any) {
      logger.error('Failed to fetch all agents', { error: error.message });
      throw new ContractError('Failed to fetch agents from marketplace contract');
    }
  }

  /**
   * Get agent info by address
   */
  async getAgentInfo(address: string): Promise<AgentInfo | null> {
    const cacheKey = `agent:${address.toLowerCase()}`;
    const cached = cache.get<AgentInfo>(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const agentData = await agentMarketplaceContract.getAgent(address);

      const agent: AgentInfo = {
        address,
        name: agentData.name,
        endpoint: agentData.endpoint,
        agentType: Number(agentData.agentType),
        agentTypeName: getAgentTypeName(Number(agentData.agentType)),
        pricePerVerification: ethers.formatEther(agentData.pricePerVerification),
        reputation: Number(agentData.reputation),
        totalJobs: Number(agentData.totalJobs),
        isActive: agentData.isActive,
      };

      cache.set(cacheKey, agent);
      return agent;
    } catch (error: any) {
      logger.warn('Failed to fetch agent info', { address, error: error.message });
      return null;
    }
  }

  /**
   * Get agents by specialization/type
   */
  async getAgentsBySpecialization(agentType: number): Promise<AgentInfo[]> {
    const cacheKey = `agents:type:${agentType}`;
    const cached = cache.get<AgentInfo[]>(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      logger.info('Fetching agents by type', { agentType });

      const agentAddresses: string[] = await agentMarketplaceContract.getAgentsByType(agentType);

      const agents = await Promise.all(
        agentAddresses.map((address: string) => this.getAgentInfo(address))
      );

      const validAgents = agents.filter((a): a is AgentInfo => a !== null);

      cache.set(cacheKey, validAgents);
      return validAgents;
    } catch (error: any) {
      logger.error('Failed to fetch agents by type', { agentType, error: error.message });
      throw new ContractError('Failed to fetch agents by specialization');
    }
  }

  /**
   * Get top agents sorted by reputation
   */
  async getTopAgents(limit: number = 10): Promise<AgentInfo[]> {
    const allAgents = await this.getAllAgents();

    return allAgents
      .sort((a, b) => b.reputation - a.reputation)
      .slice(0, limit);
  }

  /**
   * Get detailed stats for a specific agent
   */
  async getAgentStats(address: string): Promise<AgentStats> {
    const agent = await this.getAgentInfo(address);

    if (!agent) {
      throw new NotFoundError(`Agent not found: ${address}`);
    }

    // Calculate success rate (in production, fetch from contract events)
    const successRate = agent.totalJobs > 0
      ? Math.round((agent.reputation / 10000) * 100)
      : 0;

    return {
      ...agent,
      successRate,
      averageResponseTime: 2.3, // placeholder — compute from logs in production
    };
  }
}

// Export singleton instance
export const agentService = new AgentService();
