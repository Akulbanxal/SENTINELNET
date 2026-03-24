import { Router, Request, Response, NextFunction } from 'express';
import { agentService } from '../services/agentService.js';
import { validateAddress, validatePagination, validateAgentSpecialization } from '../utils/validators.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * GET /agents
 * Get all registered verification agents
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info('GET /agents');
    
    const { page, limit } = validatePagination(
      req.query.page as string,
      req.query.limit as string
    );

    const allAgents = await agentService.getAllAgents();
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedAgents = allAgents.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        agents: paginatedAgents,
        pagination: {
          page,
          limit,
          total: allAgents.length,
          pages: Math.ceil(allAgents.length / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /agents/top
 * Get agents ranked by reputation
 */
router.get('/top', async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info('GET /agents/top');
    
    const limit = parseInt(req.query.limit as string, 10) || 10;
    
    if (limit < 1 || limit > 50) {
      return res.status(400).json({
        success: false,
        error: 'Limit must be between 1 and 50',
      });
    }

    const topAgents = await agentService.getTopAgents(limit);

    res.json({
      success: true,
      data: {
        agents: topAgents,
        count: topAgents.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /agents/:specialization
 * Get agents filtered by specialization (security, liquidity, tokenomics, market)
 */
router.get('/:specialization', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { specialization } = req.params;
    logger.info('GET /agents/:specialization', { specialization });
    
    const agentType = validateAgentSpecialization(specialization);
    const agents = await agentService.getAgentsBySpecialization(agentType);

    res.json({
      success: true,
      data: {
        specialization,
        agentType,
        agents,
        count: agents.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /agents/address/:address
 * Get detailed information about a specific agent
 */
router.get('/address/:address', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    logger.info('GET /agents/address/:address', { address });
    
    validateAddress(address, 'agent address');
    
    const agentStats = await agentService.getAgentStats(address);

    res.json({
      success: true,
      data: agentStats,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
