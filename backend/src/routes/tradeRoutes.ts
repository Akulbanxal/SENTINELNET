import { Router, Request, Response, NextFunction } from 'express';
import { tradeService } from '../services/tradeService.js';
import { validateAddress, validateAmount, validateTradeDirection } from '../utils/validators.js';
import { logger } from '../utils/logger.js';
import { TradeDirection } from '../config/contracts.js';

const router = Router();

/**
 * POST /trade
 * Trigger autonomous trade evaluation
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tokenAddress } = req.body;
    logger.info('POST /trade', { tokenAddress });
    
    if (!tokenAddress) {
      return res.status(400).json({
        success: false,
        error: 'tokenAddress is required',
      });
    }
    
    validateAddress(tokenAddress, 'token address');
    
    const evaluation = await tradeService.evaluateTrade(tokenAddress);

    res.json({
      success: true,
      data: evaluation,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /trade/create
 * Create a trade order (requires backend wallet)
 */
router.post('/create', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tokenAddress, direction, amount, minAmountOut, deadline } = req.body;
    logger.info('POST /trade/create', { tokenAddress, direction, amount });
    
    // Validate inputs
    if (!tokenAddress || !direction || !amount) {
      return res.status(400).json({
        success: false,
        error: 'tokenAddress, direction, and amount are required',
      });
    }
    
    validateAddress(tokenAddress, 'token address');
    const tradeDirection = validateTradeDirection(direction);
    validateAmount(amount);
    
    const minOut = minAmountOut || '0';
    const deadlineTimestamp = deadline || Math.floor(Date.now() / 1000) + 300; // 5 minutes default

    const result = await tradeService.createTradeOrder(
      tokenAddress,
      tradeDirection,
      amount,
      minOut,
      deadlineTimestamp
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /trade/:orderId
 * Get trade order details
 */
router.get('/:orderId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    logger.info('GET /trade/:orderId', { orderId });
    
    const order = await tradeService.getTradeOrder(orderId);

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
