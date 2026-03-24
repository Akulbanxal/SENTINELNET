import { Router, Request, Response, NextFunction } from 'express';
import { auditService } from '../services/auditService.js';
import { validateAddress } from '../utils/validators.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * GET /audits/:token
 * Get verification reports for a token
 */
router.get('/:token', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;
    logger.info('GET /audits/:token', { token });
    
    validateAddress(token, 'token address');
    
    const audits = await auditService.getTokenAudits(token);

    res.json({
      success: true,
      data: audits,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /audits/:token/safety
 * Check if a token is safe to trade
 */
router.get('/:token/safety', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;
    logger.info('GET /audits/:token/safety', { token });
    
    validateAddress(token, 'token address');
    
    const safety = await auditService.isTokenSafe(token);

    res.json({
      success: true,
      data: safety,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /audits/:token/report/:auditor
 * Get a specific audit report
 */
router.get('/:token/report/:auditor', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, auditor } = req.params;
    logger.info('GET /audits/:token/report/:auditor', { token, auditor });
    
    validateAddress(token, 'token address');
    validateAddress(auditor, 'auditor address');
    
    const report = await auditService.getAuditReport(token, auditor);

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /audits/stats
 * Get overall audit statistics
 */
router.get('/stats/overview', async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info('GET /audits/stats/overview');
    
    const stats = await auditService.getAuditStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
