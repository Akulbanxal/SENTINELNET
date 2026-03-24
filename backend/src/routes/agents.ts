import express from 'express';
import { ethers } from 'ethers';

const router = express.Router();

// Mock agent data (in production, fetch from blockchain)
const mockAgents = [
  {
    address: '0x1234567890123456789012345678901234567890',
    name: 'SecurityBot Alpha',
    type: 'Security',
    reputationScore: 8750,
    totalJobs: 42,
    successfulJobs: 40,
    pricePerVerification: '0.01',
    isActive: true,
  },
  {
    address: '0x2345678901234567890123456789012345678901',
    name: 'LiquidityScanner Pro',
    type: 'Liquidity',
    reputationScore: 9200,
    totalJobs: 38,
    successfulJobs: 37,
    pricePerVerification: '0.015',
    isActive: true,
  },
  {
    address: '0x3456789012345678901234567890123456789012',
    name: 'TokenomicsAnalyzer',
    type: 'Tokenomics',
    reputationScore: 8900,
    totalJobs: 35,
    successfulJobs: 34,
    pricePerVerification: '0.012',
    isActive: true,
  },
];

// GET /api/agents - Get all agents
router.get('/', async (req, res) => {
  try {
    const { type, minReputation } = req.query;
    
    let filteredAgents = mockAgents;
    
    if (type) {
      filteredAgents = filteredAgents.filter(a => a.type === type);
    }
    
    if (minReputation) {
      filteredAgents = filteredAgents.filter(a => a.reputationScore >= Number(minReputation));
    }
    
    res.json({
      success: true,
      data: filteredAgents,
      count: filteredAgents.length,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/agents/:address - Get agent by address
router.get('/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    const agent = mockAgents.find(a => 
      a.address.toLowerCase() === address.toLowerCase()
    );
    
    if (!agent) {
      return res.status(404).json({ success: false, error: 'Agent not found' });
    }
    
    res.json({
      success: true,
      data: agent,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/agents/:address/stats - Get agent statistics
router.get('/:address/stats', async (req, res) => {
  try {
    const { address } = req.params;
    
    const agent = mockAgents.find(a => 
      a.address.toLowerCase() === address.toLowerCase()
    );
    
    if (!agent) {
      return res.status(404).json({ success: false, error: 'Agent not found' });
    }
    
    const successRate = (agent.successfulJobs / agent.totalJobs * 100).toFixed(2);
    
    res.json({
      success: true,
      data: {
        ...agent,
        successRate: `${successRate}%`,
        averageResponseTime: '2.3s',
        totalEarnings: `${(Number(agent.pricePerVerification) * agent.totalJobs).toFixed(3)} ETH`,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/agents/:address/reviews - Get agent reviews
router.get('/:address/reviews', async (req, res) => {
  try {
    const { address } = req.params;
    
    // Mock reviews
    const mockReviews = [
      {
        id: 1,
        reviewer: '0xabcd...',
        rating: 5,
        comment: 'Excellent security analysis, found critical vulnerabilities',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 2,
        reviewer: '0xef12...',
        rating: 4,
        comment: 'Good work, comprehensive report',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
      },
    ];
    
    res.json({
      success: true,
      data: mockReviews,
      count: mockReviews.length,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
