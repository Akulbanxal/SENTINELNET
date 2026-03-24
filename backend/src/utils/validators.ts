import { ethers } from 'ethers';
import { ValidationError } from './errors.js';

/**
 * Validate Ethereum address
 */
export function validateAddress(address: string, fieldName: string = 'address'): void {
  if (!address) {
    throw new ValidationError(`${fieldName} is required`);
  }
  
  if (!ethers.isAddress(address)) {
    throw new ValidationError(`Invalid ${fieldName}: ${address}`);
  }
}

/**
 * Validate pagination parameters
 */
export function validatePagination(page?: string, limit?: string, maxLimit: number = 100) {
  const pageNum = page ? parseInt(page, 10) : 1;
  const limitNum = limit ? parseInt(limit, 10) : 20;

  if (isNaN(pageNum) || pageNum < 1) {
    throw new ValidationError('Invalid page number');
  }

  if (isNaN(limitNum) || limitNum < 1 || limitNum > maxLimit) {
    throw new ValidationError(`Invalid limit. Must be between 1 and ${maxLimit}`);
  }

  return { page: pageNum, limit: limitNum };
}

/**
 * Validate agent specialization
 */
export function validateAgentSpecialization(specialization: string): number {
  const validTypes: { [key: string]: number } = {
    security: 0,
    liquidity: 1,
    tokenomics: 2,
    market: 3,
  };

  const normalized = specialization.toLowerCase();
  
  if (!(normalized in validTypes)) {
    throw new ValidationError(
      `Invalid specialization. Must be one of: ${Object.keys(validTypes).join(', ')}`
    );
  }

  return validTypes[normalized];
}

/**
 * Validate trade direction
 */
export function validateTradeDirection(direction: string): number {
  const normalized = direction.toLowerCase();
  
  if (normalized === 'buy') return 0;
  if (normalized === 'sell') return 1;
  
  throw new ValidationError('Invalid trade direction. Must be "buy" or "sell"');
}

/**
 * Validate amount (must be positive number)
 */
export function validateAmount(amount: string | number, fieldName: string = 'amount'): string {
  try {
    const value = typeof amount === 'string' ? amount : amount.toString();
    const parsed = ethers.parseEther(value);
    
    if (parsed <= 0n) {
      throw new ValidationError(`${fieldName} must be greater than 0`);
    }
    
    return value;
  } catch (error) {
    throw new ValidationError(`Invalid ${fieldName}`);
  }
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string, maxLength: number = 200): string {
  return input.trim().slice(0, maxLength);
}
