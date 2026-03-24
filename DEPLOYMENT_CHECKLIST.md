# SentinelNet - Deployment Checklist

Use this checklist when deploying SentinelNet.

## Pre-Deployment

- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] MetaMask wallet configured
- [ ] Testnet ETH acquired (at least 0.5 ETH)
- [ ] Alchemy API key obtained
- [ ] OpenAI API key obtained
- [ ] Etherscan API key obtained (optional, for verification)

## Environment Setup

- [ ] Repository cloned
- [ ] `.env` file created from `.env.example`
- [ ] All API keys added to `.env`
- [ ] Private key added to `.env` (NEVER commit this!)
- [ ] Network configuration verified (Sepolia)

## Dependencies

- [ ] Root dependencies installed (`npm install`)
- [ ] Contract dependencies installed (`cd contracts && npm install`)
- [ ] Agent dependencies installed (`cd agents && npm install`)
- [ ] Backend dependencies installed (`cd backend && npm install`)
- [ ] Frontend dependencies installed (`cd frontend && npm install`)

## Smart Contracts

- [ ] Contracts compiled successfully
- [ ] Tests pass (`cd contracts && npm test`)
- [ ] Contracts deployed to Sepolia
- [ ] AgentMarketplace address saved to `.env`
- [ ] EscrowContract address saved to `.env`
- [ ] ReputationRegistry address saved to `.env`
- [ ] Contracts verified on Etherscan (optional)
- [ ] Platform fee configured (default: 2.5%)
- [ ] Platform wallet set correctly

## Agent Registration

- [ ] Agent wallets funded with testnet ETH
- [ ] Security agent registered
- [ ] Liquidity agent registered
- [ ] Tokenomics agent registered
- [ ] Agent reputations initialized
- [ ] Agent pricing configured

## Backend

- [ ] Environment variables configured
- [ ] Database initialized (if using)
- [ ] API server starts without errors
- [ ] Health check endpoint responds (`/health`)
- [ ] WebSocket connection working
- [ ] Rate limiting configured
- [ ] CORS configured correctly

## Frontend

- [ ] Environment variables configured
- [ ] Next.js builds successfully
- [ ] Development server starts
- [ ] Dashboard loads correctly
- [ ] API connection working
- [ ] Real-time updates functioning
- [ ] Responsive design verified

## Agents

- [ ] All agents start without errors
- [ ] Agents connect to contracts successfully
- [ ] Agents listen for job events
- [ ] OpenAI integration working
- [ ] Logging configured correctly
- [ ] Error handling tested

## Integration Testing

- [ ] TraderAgent discovers tokens
- [ ] TraderAgent queries marketplace
- [ ] TraderAgent creates escrow jobs
- [ ] Verification agents receive jobs
- [ ] Agents perform analysis
- [ ] Reports submitted on-chain
- [ ] Payments released correctly
- [ ] Reputation updates working
- [ ] Dashboard shows real-time updates
- [ ] End-to-end flow complete

## Security

- [ ] Private keys stored securely
- [ ] API keys not exposed
- [ ] Rate limiting active
- [ ] Input validation in place
- [ ] Error messages don't leak sensitive info
- [ ] HTTPS enforced (production)
- [ ] Dependencies audited (`npm audit`)

## Monitoring

- [ ] Logs directory created
- [ ] Winston logging configured
- [ ] Error tracking set up
- [ ] Performance monitoring enabled
- [ ] Alert system configured (optional)

## Documentation

- [ ] README.md updated with deployment info
- [ ] Contract addresses documented
- [ ] API endpoints documented
- [ ] Agent configuration documented
- [ ] Troubleshooting guide available

## Post-Deployment

- [ ] System running for 1 hour without errors
- [ ] Test trade executed successfully
- [ ] All agents reporting correctly
- [ ] Dashboard accessible
- [ ] No memory leaks detected
- [ ] Gas costs within expected range

## Production (Additional)

- [ ] Domain name configured
- [ ] SSL certificate installed
- [ ] Database backups configured
- [ ] Monitoring/alerting set up
- [ ] Load balancer configured (if needed)
- [ ] CDN configured for frontend
- [ ] DDoS protection enabled
- [ ] Incident response plan documented

## Rollback Plan

If deployment fails:

1. [ ] Stop all services
2. [ ] Revert to previous contract version
3. [ ] Restore database backup
4. [ ] Update DNS if needed
5. [ ] Notify users
6. [ ] Document issues

## Success Criteria

✅ All smart contracts deployed and verified  
✅ All agents registered and active  
✅ Backend API responding correctly  
✅ Frontend dashboard accessible  
✅ End-to-end flow working  
✅ No critical errors in logs  
✅ System stable for 24 hours  

---

**Deployment Date:** _____________  
**Deployed By:** _____________  
**Network:** Sepolia Testnet  
**Version:** 1.0.0  

**Notes:**
