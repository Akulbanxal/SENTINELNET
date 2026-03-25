import dotenv from 'dotenv';
import { ethers } from 'ethers';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from root directory
dotenv.config({ path: resolve(__dirname, '../../.env') });

// Validate required environment variables (only critical ones)
const requiredEnvVars = ['SEPOLIA_RPC_URL'];

// For production, we can use demo addresses if contracts not deployed yet
// Only fail if trying to use actual contract functions

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`Warning: Missing environment variable: ${envVar}`);
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
}

export const config = {
  // Server
  port: parseInt(process.env.PORT || '4000', 10),
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Ethereum
  rpcUrl: process.env.SEPOLIA_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/demo',
  network: process.env.ETHEREUM_NETWORK || 'sepolia',
  privateKey: process.env.PRIVATE_KEY,
  
  // Contract Addresses
  contracts: {
    agentMarketplace: process.env.AGENT_MARKETPLACE_ADDRESS || '0x0000000000000000000000000000000000000000',
    agentEscrow: process.env.AGENT_ESCROW_ADDRESS || '0x0000000000000000000000000000000000000000',
    auditRegistry: process.env.AUDIT_REGISTRY_ADDRESS || '0x0000000000000000000000000000000000000000',
    tradeExecutor: process.env.TRADE_EXECUTOR_ADDRESS || '0x0000000000000000000000000000000000000000',
  },
  
  // API Configuration
  api: {
    rateLimitWindowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS || '900000', 10),
    rateLimitMaxRequests: parseInt(process.env.API_RATE_LIMIT_MAX_REQUESTS || '100', 10),
    corsOrigin: process.env.CORS_ORIGIN || '*',
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/backend.log',
  },
  
  // Cache
  cache: {
    ttlSeconds: parseInt(process.env.CACHE_TTL_SECONDS || '300', 10),
  },
  
  // Pagination
  pagination: {
    defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE || '20', 10),
    maxPageSize: parseInt(process.env.MAX_PAGE_SIZE || '100', 10),
  },
};

// Create Ethereum provider
export const provider = new ethers.JsonRpcProvider(config.rpcUrl);

// Create wallet if private key is provided
export const wallet = config.privateKey 
  ? new ethers.Wallet(config.privateKey, provider)
  : null;

export default config;
