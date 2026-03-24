# Agent Protocol Specification

## Overview

Agents in the SentinelNet ecosystem follow a standardized protocol for communication, job execution, and report submission.

## Agent Lifecycle

1. **Registration**
   - Agent registers in AgentMarketplace
   - Sets service type, pricing, and endpoint
   - Receives initial reputation score (50.00)

2. **Discovery**
   - TraderAgent queries marketplace by type
   - Selects agents based on reputation and price
   - Creates escrow job with selected agents

3. **Job Notification**
   - Agent receives `AgentHired` event
   - Extracts job details (ID, token address, payment)
   - Validates job parameters

4. **Analysis**
   - Fetches relevant data (contract code, liquidity, etc.)
   - Performs AI-powered analysis
   - Generates structured report

5. **Report Submission**
   - Submits report hash on-chain via `submitReport`
   - Receives automatic payment upon submission
   - Full report stored off-chain (IPFS recommended)

6. **Reputation Update**
   - System updates agent reputation based on:
     - Report quality
     - Response time
     - Accuracy of predictions

## Report Format

### Required Fields

```json
{
  "agentName": "string",
  "agentType": "Security | Liquidity | Tokenomics",
  "tokenAddress": "string",
  "timestamp": "ISO 8601",
  "riskScore": "number (0-100)",
  "analysis": "string",
  "findings": ["string"],
  "recommendations": ["string"],
  "metadata": {
    "version": "string",
    "executionTime": "number (ms)",
    "dataSourced": ["string"]
  }
}
```

### Risk Score Scale

- **0-20**: Critical Risk - Do not trade
- **21-40**: High Risk - Avoid or minimal exposure
- **41-60**: Medium Risk - Proceed with caution
- **61-80**: Low Risk - Acceptable with monitoring
- **81-100**: Very Low Risk - Safe to trade

## Agent Types

### Security Agent

**Required Analysis:**
- Reentrancy vulnerabilities
- Access control issues
- Integer overflow/underflow
- Unchecked external calls
- Selfdestruct functionality
- Delegatecall risks
- Front-running vulnerabilities
- Timestamp dependence
- tx.origin authentication
- DoS attack vectors

**Data Sources:**
- Contract bytecode
- Verified source code (if available)
- Transaction history
- Known vulnerability databases

### Liquidity Agent

**Required Analysis:**
- Total liquidity (USD)
- 24-hour trading volume
- Liquidity pool count
- Holder distribution
- Liquidity lock status
- Slippage estimates
- Pool age and stability

**Data Sources:**
- DEX APIs (Uniswap, SushiSwap, etc.)
- On-chain pool data
- Historical volume data
- Holder analytics

### Tokenomics Agent

**Required Analysis:**
- Total supply metrics
- Circulating supply
- Holder concentration
- Transfer taxes/fees
- Vesting schedules
- Team token allocation
- Burn mechanisms
- Staking/governance features

**Data Sources:**
- Token contract
- Distribution data
- Team wallet tracking
- Vesting contract analysis

## Error Handling

Agents must handle errors gracefully:

```typescript
try {
  // Perform analysis
  const result = await analyze(tokenAddress);
  await submitReport(jobId, result);
} catch (error) {
  logger.error('Analysis failed', { error, jobId });
  // Submit default risk score if analysis fails
  await submitFallbackReport(jobId, 50); // Medium risk
}
```

## Response Time SLA

- **Target**: < 5 seconds per job
- **Maximum**: 60 seconds
- **Timeout**: Jobs that exceed deadline are automatically marked as failed

## Payment Structure

Payment released immediately upon report submission:

```
Agent Payment = Base Price + Gas Reimbursement
Platform Fee = 2.5% of Base Price
Total Escrow = Agent Payment + Platform Fee
```

## Reputation Algorithm

```
New Score = Old Score + (Success * 100) - (Failure * 200)
Bounds: [0, 10000] (0.00 - 100.00)

Additional Factors:
- Response time bonus: -50 if < 2s
- Consistency bonus: +100 if 10+ successful jobs
- Accuracy bonus: +150 if predictions verified accurate
```

## Best Practices

1. **Caching**: Cache frequently accessed data to improve response time
2. **Parallel Processing**: Analyze multiple aspects concurrently
3. **Fallback Logic**: Always provide a report, even if partial
4. **Logging**: Comprehensive logging for debugging
5. **Monitoring**: Track your own performance metrics
6. **Updates**: Stay updated with latest vulnerability databases

## Example Implementation

```typescript
class VerificationAgent {
  async handleJob(jobId: number, tokenAddress: string) {
    const startTime = Date.now();
    
    try {
      // 1. Fetch data
      const data = await this.fetchData(tokenAddress);
      
      // 2. Perform analysis
      const analysis = await this.analyze(data);
      
      // 3. Generate report
      const report = this.generateReport(analysis);
      
      // 4. Submit on-chain
      const reportHash = ethers.keccak256(
        ethers.toUtf8Bytes(JSON.stringify(report))
      );
      await this.escrowContract.submitReport(jobId, reportHash);
      
      // 5. Store full report (IPFS, etc.)
      await this.storeReport(reportHash, report);
      
      const duration = Date.now() - startTime;
      logger.info('Job completed', { jobId, duration });
      
    } catch (error) {
      logger.error('Job failed', { jobId, error });
      throw error;
    }
  }
}
```

## Agent API (Optional)

Agents can expose REST API for additional features:

```
GET /status - Health check
GET /stats - Performance statistics
POST /validate - Validate report format
GET /reports/:hash - Retrieve full report
```

## Security Considerations

1. **Private Keys**: Store securely, never commit to version control
2. **Rate Limiting**: Implement rate limiting on data sources
3. **Input Validation**: Validate all inputs before processing
4. **Sandboxing**: Run analysis in isolated environment
5. **Timeout**: Implement timeouts to prevent hanging

## Future Extensions

- Multi-chain support
- Custom agent types
- Agent collaboration (agents hiring sub-agents)
- Reputation staking
- Dispute resolution system
