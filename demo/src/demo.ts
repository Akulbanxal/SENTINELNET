/**
 * SentinelNet Demo Simulation
 * 
 * Simulates the entire autonomous verification workflow:
 * 1. Mock token appears
 * 2. TraderAgent hires verification agents
 * 3. SecurityAuditBot analyzes contract
 * 4. LiquidityRiskBot analyzes liquidity
 * 5. TokenomicsAnalysisBot analyzes distribution
 * 6. Risk aggregation calculates final score
 * 7. TradeExecutor makes trade decision
 */

import { ethers } from 'ethers'
import dotenv from 'dotenv'
import chalk from 'chalk'
// @ts-ignore
import ora from 'ora'
// @ts-ignore
import boxen from 'boxen'
// @ts-ignore
import Table from 'cli-table3'
import axios from 'axios'

dotenv.config()

// Configuration
const config = {
  apiUrl: process.env.API_URL || 'http://localhost:4000',
  demoSpeed: process.env.DEMO_SPEED || 'normal',
  delayMs: parseInt(process.env.DEMO_DELAY_MS || '2000'),
  autoAdvance: process.env.DEMO_AUTO_ADVANCE !== 'false',
}

// Speed multipliers
const speedMultipliers: Record<string, number> = {
  slow: 2,
  normal: 1,
  fast: 0.5,
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms * speedMultipliers[config.demoSpeed]))

// Mock token scenarios
interface MockToken {
  name: string
  symbol: string
  address: string
  scenario: 'safe' | 'risky' | 'medium'
  description: string
  expectedOutcome: string
  mockData: {
    security: {
      hasOwnership: boolean
      hasMint: boolean
      hasBlacklist: boolean
      hasPausable: boolean
      hasProxyPattern: boolean
      score: number
    }
    liquidity: {
      poolSize: string
      volume24h: string
      holders: number
      liquidity: string
      score: number
    }
    tokenomics: {
      totalSupply: string
      circulatingSupply: string
      topHolderPercentage: number
      burnPercentage: number
      score: number
    }
  }
}

const mockTokens: Record<string, MockToken> = {
  safe: {
    name: 'SafeCoin',
    symbol: 'SAFE',
    address: '0x1234567890123456789012345678901234567890',
    scenario: 'safe',
    description: 'A well-audited token with high liquidity and fair distribution',
    expectedOutcome: 'EXECUTE - Safe to trade',
    mockData: {
      security: {
        hasOwnership: false,
        hasMint: false,
        hasBlacklist: false,
        hasPausable: false,
        hasProxyPattern: false,
        score: 92,
      },
      liquidity: {
        poolSize: '5000000',
        volume24h: '250000',
        holders: 15000,
        liquidity: 'High',
        score: 88,
      },
      tokenomics: {
        totalSupply: '1000000000',
        circulatingSupply: '800000000',
        topHolderPercentage: 8,
        burnPercentage: 10,
        score: 85,
      },
    },
  },
  risky: {
    name: 'ScamCoin',
    symbol: 'SCAM',
    address: '0x9876543210987654321098765432109876543210',
    scenario: 'risky',
    description: 'A suspicious token with ownership risks and poor liquidity',
    expectedOutcome: 'REJECT - High risk, do not trade',
    mockData: {
      security: {
        hasOwnership: true,
        hasMint: true,
        hasBlacklist: true,
        hasPausable: true,
        hasProxyPattern: true,
        score: 25,
      },
      liquidity: {
        poolSize: '50000',
        volume24h: '1000',
        holders: 50,
        liquidity: 'Low',
        score: 30,
      },
      tokenomics: {
        totalSupply: '1000000000',
        circulatingSupply: '100000000',
        topHolderPercentage: 75,
        burnPercentage: 0,
        score: 20,
      },
    },
  },
  medium: {
    name: 'MediumCoin',
    symbol: 'MED',
    address: '0x5555555555555555555555555555555555555555',
    scenario: 'medium',
    description: 'A token with mixed signals - some concerns but not critical',
    expectedOutcome: 'CAUTION - Proceed with care',
    mockData: {
      security: {
        hasOwnership: true,
        hasMint: false,
        hasBlacklist: false,
        hasPausable: false,
        hasProxyPattern: false,
        score: 68,
      },
      liquidity: {
        poolSize: '500000',
        volume24h: '25000',
        holders: 2000,
        liquidity: 'Medium',
        score: 65,
      },
      tokenomics: {
        totalSupply: '1000000000',
        circulatingSupply: '600000000',
        topHolderPercentage: 25,
        burnPercentage: 5,
        score: 62,
      },
    },
  },
}

// Agent information
const agents = [
  {
    name: 'SecurityAuditBot',
    address: '0xAgent1111111111111111111111111111111111',
    specialization: 'Security',
    reputation: 95,
    color: chalk.blue,
  },
  {
    name: 'LiquidityRiskBot',
    address: '0xAgent2222222222222222222222222222222222',
    specialization: 'Liquidity',
    reputation: 88,
    color: chalk.cyan,
  },
  {
    name: 'TokenomicsAnalysisBot',
    address: '0xAgent3333333333333333333333333333333333',
    specialization: 'Tokenomics',
    reputation: 90,
    color: chalk.magenta,
  },
  {
    name: 'TraderAgent',
    address: '0xTrader4444444444444444444444444444444444',
    specialization: 'Trading',
    reputation: 92,
    color: chalk.green,
  },
]

class DemoSimulation {
  private token: MockToken
  private spinner: any
  private step: number = 0

  constructor(tokenScenario: string = 'safe') {
    this.token = mockTokens[tokenScenario] || mockTokens.safe
  }

  private printHeader() {
    console.clear()
    console.log(
      boxen(
        chalk.bold.cyan('SentinelNet Demo Simulation\n') +
          chalk.gray('Autonomous Verification Workflow'),
        {
          padding: 1,
          margin: 1,
          borderStyle: 'double',
          borderColor: 'cyan',
        }
      )
    )
  }

  private printStep(title: string) {
    this.step++
    console.log('\n' + chalk.bold.yellow(`Step ${this.step}: ${title}`))
    console.log(chalk.gray('─'.repeat(60)))
  }

  private async wait(message?: string) {
    if (message && config.autoAdvance) {
      console.log(chalk.gray(`\n⏱  ${message}`))
    }
    await delay(config.delayMs)
  }

  async run() {
    this.printHeader()

    // Step 1: Token Discovery
    await this.step1_TokenDiscovery()
    await this.wait('Waiting before hiring agents...')

    // Step 2: Hire Agents
    await this.step2_HireAgents()
    await this.wait('Agents are preparing analysis...')

    // Step 3: Security Analysis
    await this.step3_SecurityAnalysis()
    await this.wait('Moving to liquidity analysis...')

    // Step 4: Liquidity Analysis
    await this.step4_LiquidityAnalysis()
    await this.wait('Moving to tokenomics analysis...')

    // Step 5: Tokenomics Analysis
    await this.step5_TokenomicsAnalysis()
    await this.wait('Aggregating risk scores...')

    // Step 6: Risk Aggregation
    await this.step6_RiskAggregation()
    await this.wait('Making trade decision...')

    // Step 7: Trade Decision
    await this.step7_TradeDecision()

    // Final Summary
    await this.showFinalSummary()
  }

  private async step1_TokenDiscovery() {
    this.printStep('Token Discovery')

    this.spinner = ora('New token detected on-chain...').start()
    await delay(1000)
    this.spinner.succeed('Token discovered!')

    console.log('\n' + chalk.bold('Token Information:'))
    const tokenTable = new Table({
      chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
    })

    tokenTable.push(
      ['Name', chalk.cyan(this.token.name)],
      ['Symbol', chalk.cyan(this.token.symbol)],
      ['Address', chalk.gray(this.token.address)],
      ['Scenario', this.getScenarioColor(this.token.scenario)],
      ['Description', chalk.white(this.token.description)]
    )

    console.log(tokenTable.toString())

    // Simulate blockchain verification
    this.spinner = ora('Verifying contract on blockchain...').start()
    await delay(1500)
    this.spinner.succeed('Contract verified ✓')
  }

  private async step2_HireAgents() {
    this.printStep('TraderAgent Hires Verification Agents')

    console.log(chalk.green('\n👤 TraderAgent:') + ' "I need to verify this token before trading."')
    await delay(1000)

    this.spinner = ora('Searching for available verification agents...').start()
    await delay(1500)
    this.spinner.succeed(`Found ${agents.length - 1} specialized agents`)

    console.log('\n' + chalk.bold('Hiring Agents:'))

    for (const agent of agents.slice(0, 3)) {
      // Exclude TraderAgent
      this.spinner = ora(`Hiring ${agent.name}...`).start()
      await delay(800)
      this.spinner.succeed(
        agent.color(`✓ ${agent.name} hired (Reputation: ${agent.reputation})`)
      )
    }

    console.log('\n' + chalk.bold.green('✓ All verification agents hired and ready'))
  }

  private async step3_SecurityAnalysis() {
    this.printStep('SecurityAuditBot Analysis')

    const agent = agents[0]
    console.log('\n' + agent.color(`🛡️  ${agent.name}:`) + ' "Starting security audit..."')

    const checks = [
      { name: 'Checking for ownership controls', key: 'hasOwnership', risk: true },
      { name: 'Checking for mint functions', key: 'hasMint', risk: true },
      { name: 'Checking for blacklist functions', key: 'hasBlacklist', risk: true },
      { name: 'Checking for pausable functions', key: 'hasPausable', risk: true },
      { name: 'Checking for proxy patterns', key: 'hasProxyPattern', risk: true },
    ]

    for (const check of checks) {
      this.spinner = ora(check.name).start()
      await delay(600)
      const hasIssue = this.token.mockData.security[check.key as keyof typeof this.token.mockData.security]
      if (hasIssue && check.risk) {
        this.spinner.warn(chalk.yellow(`${check.name} - FOUND ⚠️`))
      } else {
        this.spinner.succeed(chalk.green(`${check.name} - SAFE ✓`))
      }
    }

    await delay(500)
    console.log(
      '\n' +
        agent.color(`📊 Security Score: ${this.token.mockData.security.score}/100`) +
        this.getScoreEmoji(this.token.mockData.security.score)
    )

    // Simulate writing to blockchain
    this.spinner = ora('Submitting audit report to blockchain...').start()
    await delay(1200)
    this.spinner.succeed('Audit report submitted ✓')
  }

  private async step4_LiquidityAnalysis() {
    this.printStep('LiquidityRiskBot Analysis')

    const agent = agents[1]
    console.log('\n' + agent.color(`💧 ${agent.name}:`) + ' "Analyzing liquidity metrics..."')

    const checks = [
      { name: 'Fetching pool size', value: `$${this.token.mockData.liquidity.poolSize}` },
      { name: 'Checking 24h volume', value: `$${this.token.mockData.liquidity.volume24h}` },
      { name: 'Counting holders', value: this.token.mockData.liquidity.holders.toLocaleString() },
      { name: 'Assessing liquidity depth', value: this.token.mockData.liquidity.liquidity },
    ]

    for (const check of checks) {
      this.spinner = ora(check.name).start()
      await delay(600)
      this.spinner.succeed(`${check.name} - ${chalk.cyan(check.value)}`)
    }

    await delay(500)
    console.log(
      '\n' +
        agent.color(`📊 Liquidity Score: ${this.token.mockData.liquidity.score}/100`) +
        this.getScoreEmoji(this.token.mockData.liquidity.score)
    )

    // Simulate writing to blockchain
    this.spinner = ora('Submitting liquidity report to blockchain...').start()
    await delay(1200)
    this.spinner.succeed('Liquidity report submitted ✓')
  }

  private async step5_TokenomicsAnalysis() {
    this.printStep('TokenomicsAnalysisBot Analysis')

    const agent = agents[2]
    console.log('\n' + agent.color(`📈 ${agent.name}:`) + ' "Analyzing token distribution..."')

    const checks = [
      {
        name: 'Total supply',
        value: (parseInt(this.token.mockData.tokenomics.totalSupply) / 1e9).toFixed(1) + 'B',
      },
      {
        name: 'Circulating supply',
        value: (parseInt(this.token.mockData.tokenomics.circulatingSupply) / 1e9).toFixed(1) + 'B',
      },
      {
        name: 'Top holder concentration',
        value: this.token.mockData.tokenomics.topHolderPercentage + '%',
      },
      { name: 'Burn percentage', value: this.token.mockData.tokenomics.burnPercentage + '%' },
    ]

    for (const check of checks) {
      this.spinner = ora(check.name).start()
      await delay(600)
      this.spinner.succeed(`${check.name} - ${chalk.magenta(check.value)}`)
    }

    await delay(500)
    console.log(
      '\n' +
        agent.color(`📊 Tokenomics Score: ${this.token.mockData.tokenomics.score}/100`) +
        this.getScoreEmoji(this.token.mockData.tokenomics.score)
    )

    // Simulate writing to blockchain
    this.spinner = ora('Submitting tokenomics report to blockchain...').start()
    await delay(1200)
    this.spinner.succeed('Tokenomics report submitted ✓')
  }

  private async step6_RiskAggregation() {
    this.printStep('Risk Aggregation Engine')

    console.log('\n' + chalk.bold('⚙️  Aggregating all risk scores...'))

    const scores = [
      {
        category: 'Security',
        score: this.token.mockData.security.score,
        weight: 0.4,
        color: chalk.blue,
      },
      {
        category: 'Liquidity',
        score: this.token.mockData.liquidity.score,
        weight: 0.3,
        color: chalk.cyan,
      },
      {
        category: 'Tokenomics',
        score: this.token.mockData.tokenomics.score,
        weight: 0.3,
        color: chalk.magenta,
      },
    ]

    console.log('\n' + chalk.bold('Score Breakdown:'))
    const scoreTable = new Table({
      head: ['Category', 'Score', 'Weight', 'Weighted Score'],
      chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
    })

    let totalWeightedScore = 0
    for (const item of scores) {
      const weightedScore = item.score * item.weight
      totalWeightedScore += weightedScore

      this.spinner = ora(`Calculating ${item.category} weighted score...`).start()
      await delay(500)
      this.spinner.succeed()

      scoreTable.push([
        item.color(item.category),
        item.color(item.score.toString()),
        chalk.gray((item.weight * 100).toFixed(0) + '%'),
        item.color(weightedScore.toFixed(1)),
      ])
    }

    console.log(scoreTable.toString())

    await delay(1000)

    const finalScore = Math.round(totalWeightedScore)
    const riskLevel = this.getRiskLevel(finalScore)

    console.log('\n' + chalk.bold.yellow('═'.repeat(60)))
    console.log(
      chalk.bold('Overall Risk Score: ') +
        this.getScoreColor(finalScore) +
        this.getScoreEmoji(finalScore)
    )
    console.log(chalk.bold('Risk Level: ') + this.getRiskLevelColor(riskLevel))
    console.log(chalk.bold.yellow('═'.repeat(60)))
  }

  private async step7_TradeDecision() {
    this.printStep('TradeExecutor Decision')

    const overallScore =
      (this.token.mockData.security.score * 0.4 +
        this.token.mockData.liquidity.score * 0.3 +
        this.token.mockData.tokenomics.score * 0.3)

    console.log('\n' + chalk.bold('🤖 TradeExecutor analyzing aggregated data...'))

    const checks = [
      'Checking consensus threshold (3/3 agents)',
      'Verifying minimum score requirement (>60)',
      'Checking blacklist status',
      'Evaluating risk/reward ratio',
      'Calculating position size',
    ]

    for (const check of checks) {
      this.spinner = ora(check).start()
      await delay(700)
      this.spinner.succeed()
    }

    await delay(1500)

    // Decision logic
    let decision: 'EXECUTE' | 'CAUTION' | 'REJECT'
    let reason: string
    let action: string

    if (overallScore >= 80) {
      decision = 'EXECUTE'
      reason = 'All safety checks passed. Token meets all criteria.'
      action = '✅ Trade will be EXECUTED'
    } else if (overallScore >= 60) {
      decision = 'CAUTION'
      reason = 'Some concerns detected. Manual review recommended.'
      action = '⚠️  Trade requires CAUTION'
    } else {
      decision = 'REJECT'
      reason = 'Critical issues detected. Token does not meet safety standards.'
      action = '❌ Trade will be REJECTED'
    }

    console.log('\n' + chalk.bold.yellow('═'.repeat(60)))
    console.log(this.getDecisionDisplay(decision))
    console.log(chalk.bold.yellow('═'.repeat(60)))
    console.log('\n' + chalk.bold('Reason: ') + chalk.white(reason))
    console.log(chalk.bold('Action: ') + this.getActionColor(action))

    // Simulate blockchain transaction
    if (decision === 'EXECUTE') {
      await delay(1000)
      this.spinner = ora('Creating trade order on blockchain...').start()
      await delay(1500)
      this.spinner.succeed('Trade order created ✓')
      console.log(chalk.gray('Transaction hash: 0x' + '1234'.repeat(16)))
    }
  }

  private async showFinalSummary() {
    await delay(2000)

    console.log('\n\n' + chalk.bold.cyan('═'.repeat(60)))
    console.log(chalk.bold.cyan('                    SIMULATION COMPLETE                    '))
    console.log(chalk.bold.cyan('═'.repeat(60)))

    const summaryTable = new Table({
      head: ['Metric', 'Value'],
      chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
    })

    const overallScore = Math.round(
      this.token.mockData.security.score * 0.4 +
        this.token.mockData.liquidity.score * 0.3 +
        this.token.mockData.tokenomics.score * 0.3
    )

    summaryTable.push(
      ['Token', chalk.cyan(this.token.name)],
      ['Scenario', this.getScenarioColor(this.token.scenario)],
      ['Security Score', chalk.blue(this.token.mockData.security.score + '/100')],
      ['Liquidity Score', chalk.cyan(this.token.mockData.liquidity.score + '/100')],
      ['Tokenomics Score', chalk.magenta(this.token.mockData.tokenomics.score + '/100')],
      ['Overall Score', this.getScoreColor(overallScore)],
      ['Expected Outcome', chalk.yellow(this.token.expectedOutcome)]
    )

    console.log('\n' + summaryTable.toString())

    console.log('\n' + chalk.bold.green('✓ All data saved to blockchain'))
    console.log(chalk.bold.green('✓ Dashboard updated with real-time data'))
    console.log(chalk.bold.green('✓ Agents ready for next verification'))

    console.log(
      '\n' +
        boxen(
          chalk.bold.cyan('Demo Complete!\n') +
            chalk.white('View results in dashboard: ') +
            chalk.blue('http://localhost:3000'),
          {
            padding: 1,
            margin: 1,
            borderStyle: 'round',
            borderColor: 'green',
          }
        )
    )

    console.log(chalk.gray('\nPress Ctrl+C to exit or run another scenario\n'))
  }

  // Helper methods
  private getScenarioColor(scenario: string): string {
    switch (scenario) {
      case 'safe':
        return chalk.green.bold('✓ SAFE')
      case 'risky':
        return chalk.red.bold('✗ RISKY')
      case 'medium':
        return chalk.yellow.bold('⚠ MEDIUM')
      default:
        return chalk.gray(scenario)
    }
  }

  private getScoreEmoji(score: number): string {
    if (score >= 90) return ' 🟢'
    if (score >= 80) return ' 🟢'
    if (score >= 70) return ' 🟡'
    if (score >= 60) return ' 🟡'
    return ' 🔴'
  }

  private getScoreColor(score: number): string {
    if (score >= 80) return chalk.green.bold(score.toString() + '/100')
    if (score >= 60) return chalk.yellow.bold(score.toString() + '/100')
    return chalk.red.bold(score.toString() + '/100')
  }

  private getRiskLevel(score: number): string {
    if (score >= 80) return 'Low'
    if (score >= 60) return 'Medium'
    return 'High'
  }

  private getRiskLevelColor(level: string): string {
    switch (level) {
      case 'Low':
        return chalk.green.bold(level)
      case 'Medium':
        return chalk.yellow.bold(level)
      case 'High':
        return chalk.red.bold(level)
      default:
        return chalk.gray(level)
    }
  }

  private getDecisionDisplay(decision: string): string {
    switch (decision) {
      case 'EXECUTE':
        return chalk.bold.green('✅ DECISION: EXECUTE TRADE')
      case 'CAUTION':
        return chalk.bold.yellow('⚠️  DECISION: PROCEED WITH CAUTION')
      case 'REJECT':
        return chalk.bold.red('❌ DECISION: REJECT TRADE')
      default:
        return chalk.gray(decision)
    }
  }

  private getActionColor(action: string): string {
    if (action.includes('EXECUTED')) return chalk.green(action)
    if (action.includes('CAUTION')) return chalk.yellow(action)
    if (action.includes('REJECTED')) return chalk.red(action)
    return chalk.white(action)
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2)
  let scenario = 'safe'
  let loop = false

  // Parse command line arguments
  for (const arg of args) {
    if (arg === '--safe-token') scenario = 'safe'
    else if (arg === '--risky-token') scenario = 'risky'
    else if (arg === '--medium-token') scenario = 'medium'
    else if (arg === '--loop') loop = true
    else if (arg === '--fast') config.demoSpeed = 'fast'
    else if (arg === '--slow') config.demoSpeed = 'slow'
  }

  do {
    const demo = new DemoSimulation(scenario)
    await demo.run()

    if (loop) {
      console.log(chalk.gray('\nStarting next scenario in 5 seconds...\n'))
      await delay(5000)
      // Cycle through scenarios
      if (scenario === 'safe') scenario = 'medium'
      else if (scenario === 'medium') scenario = 'risky'
      else scenario = 'safe'
    }
  } while (loop)
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n' + chalk.yellow('Demo interrupted. Goodbye! 👋\n'))
  process.exit(0)
})

main().catch((error) => {
  console.error(chalk.red('\n❌ Demo failed:'), error.message)
  process.exit(1)
})
