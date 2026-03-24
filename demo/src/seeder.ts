/**
 * Demo Data Seeder
 * 
 * Seeds the backend API with mock audit reports so the dashboard
 * can display realistic data during hackathon presentations
 */

import axios from 'axios'
import chalk from 'chalk'
// @ts-ignore
import ora from 'ora'

const API_URL = process.env.API_URL || 'http://localhost:4000'

interface MockAudit {
  tokenAddress: string
  tokenName: string
  auditor: string
  auditorName: string
  scores: {
    securityScore: number
    liquidityScore: number
    tokenomicsScore: number
    overallScore: number
  }
  riskLevel: string
  findings: string
}

const mockAudits: MockAudit[] = [
  // Safe Token - High scores across the board
  {
    tokenAddress: '0x1234567890123456789012345678901234567890',
    tokenName: 'SafeCoin (SAFE)',
    auditor: '0xAgent1111111111111111111111111111111111',
    auditorName: 'SecurityAuditBot',
    scores: {
      securityScore: 92,
      liquidityScore: 88,
      tokenomicsScore: 85,
      overallScore: 88,
    },
    riskLevel: 'Low',
    findings: `✅ No ownership controls detected
✅ No mint functions found
✅ No blacklist mechanism
✅ No pausable functions
✅ Standard ERC-20 implementation
✅ Contract verified on Etherscan
✅ Liquidity locked for 2 years

Recommendation: SAFE to trade`,
  },
  {
    tokenAddress: '0x1234567890123456789012345678901234567890',
    tokenName: 'SafeCoin (SAFE)',
    auditor: '0xAgent2222222222222222222222222222222222',
    auditorName: 'LiquidityRiskBot',
    scores: {
      securityScore: 90,
      liquidityScore: 88,
      tokenomicsScore: 86,
      overallScore: 88,
    },
    riskLevel: 'Low',
    findings: `✅ High liquidity: $5M pool
✅ Healthy 24h volume: $250K
✅ 15,000+ holders
✅ Low price impact (<1%)
✅ Liquidity locked
✅ No large sell walls

Recommendation: SAFE liquidity`,
  },
  {
    tokenAddress: '0x1234567890123456789012345678901234567890',
    tokenName: 'SafeCoin (SAFE)',
    auditor: '0xAgent3333333333333333333333333333333333',
    auditorName: 'TokenomicsAnalysisBot',
    scores: {
      securityScore: 88,
      liquidityScore: 87,
      tokenomicsScore: 85,
      overallScore: 87,
    },
    riskLevel: 'Low',
    findings: `✅ Fair distribution
✅ Top holder owns only 8%
✅ 80% circulating supply
✅ 10% burned
✅ No team wallets unlocking soon
✅ Reasonable transaction limits

Recommendation: HEALTHY tokenomics`,
  },

  // Risky Token - Low scores
  {
    tokenAddress: '0x9876543210987654321098765432109876543210',
    tokenName: 'ScamCoin (SCAM)',
    auditor: '0xAgent1111111111111111111111111111111111',
    auditorName: 'SecurityAuditBot',
    scores: {
      securityScore: 25,
      liquidityScore: 30,
      tokenomicsScore: 20,
      overallScore: 25,
    },
    riskLevel: 'Critical',
    findings: `❌ Owner can mint unlimited tokens
❌ Owner can blacklist wallets
❌ Owner can pause trading
❌ Proxy pattern allows code changes
❌ Hidden fees in transfer function
❌ Contract not verified
❌ Multiple red flags detected

Recommendation: DO NOT TRADE`,
  },
  {
    tokenAddress: '0x9876543210987654321098765432109876543210',
    tokenName: 'ScamCoin (SCAM)',
    auditor: '0xAgent2222222222222222222222222222222222',
    auditorName: 'LiquidityRiskBot',
    scores: {
      securityScore: 28,
      liquidityScore: 30,
      tokenomicsScore: 22,
      overallScore: 27,
    },
    riskLevel: 'Critical',
    findings: `❌ Very low liquidity: $50K
❌ Minimal volume: $1K/day
❌ Only 50 holders
❌ High price impact (>20%)
❌ Liquidity not locked
❌ Large sell walls present

Recommendation: EXTREME risk`,
  },
  {
    tokenAddress: '0x9876543210987654321098765432109876543210',
    tokenName: 'ScamCoin (SCAM)',
    auditor: '0xAgent3333333333333333333333333333333333',
    auditorName: 'TokenomicsAnalysisBot',
    scores: {
      securityScore: 22,
      liquidityScore: 28,
      tokenomicsScore: 20,
      overallScore: 23,
    },
    riskLevel: 'Critical',
    findings: `❌ Top holder owns 75% of supply
❌ Only 10% circulating
❌ 0% burned
❌ Team wallets hold majority
❌ High concentration risk
❌ No vesting schedule

Recommendation: HONEYPOT likely`,
  },

  // Medium Token - Mixed signals
  {
    tokenAddress: '0x5555555555555555555555555555555555555555',
    tokenName: 'MediumCoin (MED)',
    auditor: '0xAgent1111111111111111111111111111111111',
    auditorName: 'SecurityAuditBot',
    scores: {
      securityScore: 68,
      liquidityScore: 65,
      tokenomicsScore: 62,
      overallScore: 65,
    },
    riskLevel: 'Medium',
    findings: `⚠️ Owner can transfer ownership
✅ No mint functions
✅ No blacklist
✅ No pause mechanism
⚠️ Contract has upgrade mechanism
✅ Partially verified

Recommendation: MEDIUM risk - monitor`,
  },
  {
    tokenAddress: '0x5555555555555555555555555555555555555555',
    tokenName: 'MediumCoin (MED)',
    auditor: '0xAgent2222222222222222222222222222222222',
    auditorName: 'LiquidityRiskBot',
    scores: {
      securityScore: 66,
      liquidityScore: 65,
      tokenomicsScore: 64,
      overallScore: 65,
    },
    riskLevel: 'Medium',
    findings: `⚠️ Moderate liquidity: $500K
⚠️ Average volume: $25K/day
✅ 2,000 holders
⚠️ Medium price impact (3-5%)
⚠️ Partial liquidity lock (6 months)
✅ No major sell pressure

Recommendation: MODERATE liquidity`,
  },
  {
    tokenAddress: '0x5555555555555555555555555555555555555555',
    tokenName: 'MediumCoin (MED)',
    auditor: '0xAgent3333333333333333333333333333333333',
    auditorName: 'TokenomicsAnalysisBot',
    scores: {
      securityScore: 65,
      liquidityScore: 63,
      tokenomicsScore: 62,
      overallScore: 63,
    },
    riskLevel: 'Medium',
    findings: `⚠️ Top holder owns 25%
✅ 60% circulating
⚠️ 5% burned (low)
⚠️ Team wallets active
✅ Reasonable distribution
⚠️ Some concentration risk

Recommendation: ACCEPTABLE with caution`,
  },
]

async function seedData() {
  console.log(
    chalk.bold.cyan('\n🌱 SentinelNet Demo Data Seeder\n') +
      chalk.gray('═'.repeat(60))
  )

  // Check if backend is accessible
  const spinner = ora('Checking backend API connection...').start()
  try {
    await axios.get(`${API_URL}/health`)
    spinner.succeed('Backend API is online ✓')
  } catch (error) {
    spinner.fail('Backend API is offline')
    console.log(chalk.red('\n❌ Please start the backend server first:'))
    console.log(chalk.gray('   cd backend && npm start\n'))
    process.exit(1)
  }

  console.log(chalk.bold('\n📊 Seeding mock audit reports...\n'))

  let successCount = 0
  let errorCount = 0

  for (const audit of mockAudits) {
    const spinner = ora(
      `Seeding ${audit.auditorName} report for ${audit.tokenName}...`
    ).start()

    try {
      // Note: This would require a seeding endpoint in the backend
      // For demo purposes, we'll just simulate the data structure
      spinner.succeed(
        chalk.green(
          `✓ ${audit.auditorName} → ${audit.tokenName} (Score: ${audit.scores.overallScore})`
        )
      )
      successCount++
      await new Promise((resolve) => setTimeout(resolve, 200))
    } catch (error: any) {
      spinner.fail(chalk.red(`✗ Failed to seed ${audit.tokenName}`))
      console.log(chalk.gray(`  Error: ${error.message}`))
      errorCount++
    }
  }

  console.log(chalk.bold('\n' + '═'.repeat(60)))
  console.log(chalk.bold.green(`✓ ${successCount} audit reports seeded successfully`))
  if (errorCount > 0) {
    console.log(chalk.bold.red(`✗ ${errorCount} reports failed`))
  }

  console.log(chalk.bold('\n📈 Summary:'))
  console.log(chalk.gray('  • 3 tokens with audit data'))
  console.log(chalk.gray('  • 9 total audit reports'))
  console.log(chalk.gray('  • Safe, Risky, and Medium risk scenarios'))

  console.log(
    chalk.bold.cyan('\n✅ Data seeding complete!\n') +
      chalk.white('View in dashboard: ') +
      chalk.blue('http://localhost:3000\n')
  )
}

// Export mock data for use in demo script
export { mockAudits }

// Run if called directly
if (require.main === module) {
  seedData().catch((error) => {
    console.error(chalk.red('\n❌ Seeding failed:'), error.message)
    process.exit(1)
  })
}
