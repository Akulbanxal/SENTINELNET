import express from 'express';

const router = express.Router();

// GET /api/analytics/overview - Get system overview
router.get('/overview', async (req, res) => {
  try {
    const overview = {
      totalAgents: 3,
      activeAgents: 3,
      totalJobs: 42,
      completedJobs: 40,
      averageRiskScore: 86.5,
      totalValueScanned: '127.5 ETH',
      last24h: {
        jobs: 5,
        averageResponseTime: '2.1s',
        successRate: '95.2%',
      },
    };
    
    res.json({
      success: true,
      data: overview,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/analytics/agents - Get agent performance analytics
router.get('/agents', async (req, res) => {
  try {
    const agentAnalytics = [
      {
        agentName: 'SecurityBot Alpha',
        type: 'Security',
        jobsCompleted: 42,
        averageRiskScore: 84.2,
        averageResponseTime: 2.3,
        successRate: 95.2,
        earnings: '0.42 ETH',
      },
      {
        agentName: 'LiquidityScanner Pro',
        type: 'Liquidity',
        jobsCompleted: 38,
        averageRiskScore: 79.8,
        averageResponseTime: 1.8,
        successRate: 97.4,
        earnings: '0.57 ETH',
      },
      {
        agentName: 'TokenomicsAnalyzer',
        type: 'Tokenomics',
        jobsCompleted: 35,
        averageRiskScore: 88.1,
        averageResponseTime: 2.1,
        successRate: 97.1,
        earnings: '0.42 ETH',
      },
    ];
    
    res.json({
      success: true,
      data: agentAnalytics,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/analytics/jobs/timeline - Get job timeline data
router.get('/jobs/timeline', async (req, res) => {
  try {
    const timeline = [];
    const now = Date.now();
    
    // Generate mock timeline data for last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      timeline.push({
        date: date.toISOString().split('T')[0],
        jobsCreated: Math.floor(Math.random() * 10) + 5,
        jobsCompleted: Math.floor(Math.random() * 10) + 3,
        averageRiskScore: Math.floor(Math.random() * 20) + 75,
      });
    }
    
    res.json({
      success: true,
      data: timeline,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/analytics/risk-distribution - Get risk score distribution
router.get('/risk-distribution', async (req, res) => {
  try {
    const distribution = [
      { range: '0-20', count: 2, label: 'Critical Risk' },
      { range: '21-40', count: 3, label: 'High Risk' },
      { range: '41-60', count: 5, label: 'Medium Risk' },
      { range: '61-80', count: 12, label: 'Low Risk' },
      { range: '81-100', count: 20, label: 'Very Low Risk' },
    ];
    
    res.json({
      success: true,
      data: distribution,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
