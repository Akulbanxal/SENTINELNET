# Contract Addresses

## Sepolia Testnet

Deployed on: 2026-03-10

### Core Contracts

| Contract | Address | Etherscan |
|----------|---------|-----------|
| AgentMarketplace | TBD | [View](https://sepolia.etherscan.io/address/TBD) |
| EscrowContract | TBD | [View](https://sepolia.etherscan.io/address/TBD) |
| ReputationRegistry | TBD | [View](https://sepolia.etherscan.io/address/TBD) |

### Registered Agents

| Agent Name | Type | Address | Status |
|------------|------|---------|--------|
| SecurityBot Alpha | Security | TBD | Active |
| LiquidityScanner Pro | Liquidity | TBD | Active |
| TokenomicsAnalyzer | Tokenomics | TBD | Active |

## Deployment History

### v1.0.0 - Initial Deployment (2026-03-10)

- Deployed all core contracts
- Registered initial verification agents
- Configured platform fees (2.5%)
- Set up reputation system

## Contract Verification

All contracts are verified on Etherscan for transparency.

### Verification Command

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## Integration

### Using the Contracts

```typescript
import { ethers } from 'ethers';

// Connect to AgentMarketplace
const marketplace = new ethers.Contract(
  AGENT_MARKETPLACE_ADDRESS,
  MARKETPLACE_ABI,
  signer
);

// Get available agents
const agents = await marketplace.getAgentsByType(0); // Security agents
```

## Security Audits

- [ ] Internal review completed
- [ ] External audit pending
- [ ] Bug bounty program: TBD

## Updates

Contract addresses will be updated here after deployment.
