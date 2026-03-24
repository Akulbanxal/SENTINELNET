# SentinelNet Scripts

This directory contains utility scripts for managing the SentinelNet system.

## Available Scripts

### Deployment

#### deploy-all.sh
Deploys all contracts and starts all services.

```bash
./scripts/deploy-all.sh
```

#### deploy-contracts.sh
Deploys only smart contracts.

```bash
./scripts/deploy-contracts.sh sepolia
```

### Agent Management

#### register-agents.sh
Registers all verification agents in the marketplace.

```bash
./scripts/register-agents.sh
```

#### start-agents.sh
Starts all agent services in separate processes.

```bash
./scripts/start-agents.sh
```

#### stop-agents.sh
Stops all running agent services.

```bash
./scripts/stop-agents.sh
```

### Monitoring

#### health-check.sh
Checks health of all services.

```bash
./scripts/health-check.sh
```

#### logs.sh
Tails logs from all services.

```bash
./scripts/logs.sh
```

### Testing

#### test-all.sh
Runs tests for all components.

```bash
./scripts/test-all.sh
```

#### test-contracts.sh
Tests only smart contracts.

```bash
./scripts/test-contracts.sh
```

### Database

#### db-setup.sh
Initializes database schema.

```bash
./scripts/db-setup.sh
```

#### db-seed.sh
Seeds database with test data.

```bash
./scripts/db-seed.sh
```

### Utilities

#### generate-wallets.js
Generates new wallets for agents.

```bash
node scripts/generate-wallets.js
```

#### fund-agents.js
Funds agent wallets with testnet ETH.

```bash
node scripts/fund-agents.js
```

## Usage Examples

### Complete Setup

```bash
# 1. Install dependencies
npm run install:all

# 2. Set up environment
cp .env.example .env
# Edit .env file

# 3. Deploy contracts
./scripts/deploy-contracts.sh sepolia

# 4. Register agents
./scripts/register-agents.sh

# 5. Start all services
./scripts/deploy-all.sh
```

### Development Workflow

```bash
# Start in development mode
npm run dev:backend  # Terminal 1
npm run dev:frontend # Terminal 2
npm run dev:agents   # Terminal 3
```

### Running Tests

```bash
# Test everything
./scripts/test-all.sh

# Or test individually
cd contracts && npm test
cd agents && npm test
cd backend && npm test
```

## Environment Variables

Scripts respect these environment variables:

- `NETWORK`: Blockchain network (default: sepolia)
- `LOG_LEVEL`: Logging verbosity (default: info)
- `NODE_ENV`: Environment mode (default: development)

## Notes

- Scripts assume Bash shell (macOS/Linux)
- For Windows, use WSL or Git Bash
- Always run scripts from project root
- Check script permissions: `chmod +x scripts/*.sh`
