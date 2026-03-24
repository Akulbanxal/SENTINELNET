import express from 'express';

const router = express.Router();

// Mock job data
const mockJobs = [
  {
    id: 1,
    tokenAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    client: '0xabcdef...',
    status: 'completed',
    agents: ['SecurityBot Alpha', 'LiquidityScanner Pro', 'TokenomicsAnalyzer'],
    totalBudget: '0.037',
    riskScore: 82,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    completedAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 2,
    tokenAddress: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    client: '0x123456...',
    status: 'in_progress',
    agents: ['SecurityBot Alpha', 'LiquidityScanner Pro', 'TokenomicsAnalyzer'],
    totalBudget: '0.037',
    riskScore: null,
    createdAt: new Date(Date.now() - 600000).toISOString(),
    completedAt: null,
  },
  {
    id: 3,
    tokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    client: '0xfedcba...',
    status: 'completed',
    agents: ['SecurityBot Alpha', 'LiquidityScanner Pro', 'TokenomicsAnalyzer'],
    totalBudget: '0.037',
    riskScore: 95,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    completedAt: new Date(Date.now() - 5400000).toISOString(),
  },
];

// GET /api/jobs - Get all jobs
router.get('/', async (req, res) => {
  try {
    const { status, client } = req.query;
    
    let filteredJobs = mockJobs;
    
    if (status) {
      filteredJobs = filteredJobs.filter(j => j.status === status);
    }
    
    if (client) {
      filteredJobs = filteredJobs.filter(j => 
        j.client.toLowerCase() === (client as string).toLowerCase()
      );
    }
    
    res.json({
      success: true,
      data: filteredJobs,
      count: filteredJobs.length,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/jobs/:id - Get job by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const job = mockJobs.find(j => j.id === Number(id));
    
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    
    res.json({
      success: true,
      data: job,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/jobs/:id/reports - Get job reports
router.get('/:id/reports', async (req, res) => {
  try {
    const { id } = req.params;
    
    const job = mockJobs.find(j => j.id === Number(id));
    
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }
    
    // Mock reports
    const mockReports = [
      {
        agentName: 'SecurityBot Alpha',
        agentType: 'Security',
        riskScore: 85,
        findings: [
          'No reentrancy vulnerabilities detected',
          'Access control properly implemented',
          'No integer overflow risks',
        ],
        recommendations: [
          'Consider adding emergency pause functionality',
          'Implement timelocks for critical functions',
        ],
        submittedAt: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        agentName: 'LiquidityScanner Pro',
        agentType: 'Liquidity',
        riskScore: 78,
        findings: [
          'Total liquidity: $2.5M',
          '24h volume: $450K',
          'Liquidity locked for 6 months',
        ],
        recommendations: [
          'Monitor for sudden liquidity changes',
          'Watch for large holder sell-offs',
        ],
        submittedAt: new Date(Date.now() - 1750000).toISOString(),
      },
      {
        agentName: 'TokenomicsAnalyzer',
        agentType: 'Tokenomics',
        riskScore: 83,
        findings: [
          'Fair distribution across holders',
          'Top 10 holders: 35% of supply',
          'No concerning transfer taxes',
        ],
        recommendations: [
          'Continue monitoring holder distribution',
          'Track team wallet movements',
        ],
        submittedAt: new Date(Date.now() - 1700000).toISOString(),
      },
    ];
    
    res.json({
      success: true,
      data: mockReports,
      count: mockReports.length,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/jobs - Create new job (for demo purposes)
router.post('/', async (req, res) => {
  try {
    const { tokenAddress, agents, budget } = req.body;
    
    if (!tokenAddress || !agents || !budget) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: tokenAddress, agents, budget' 
      });
    }
    
    const newJob = {
      id: mockJobs.length + 1,
      tokenAddress,
      client: '0xdemo...',
      status: 'pending',
      agents,
      totalBudget: budget,
      riskScore: null,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    
    mockJobs.push(newJob);
    
    res.status(201).json({
      success: true,
      data: newJob,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
