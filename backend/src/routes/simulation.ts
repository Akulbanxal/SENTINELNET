import express from 'express'
import simulationService from '../services/simulationService'

const router = express.Router()

// Start simulation
router.post('/start', (req, res) => {
  simulationService.start()
  res.json({ success: true, message: 'Simulation started' })
})

// Stop simulation
router.post('/stop', (req, res) => {
  simulationService.stop()
  res.json({ success: true, message: 'Simulation stopped' })
})

// Create one-off job
router.post('/jobs', (req, res) => {
  const { tokenAddress } = req.body
  const job = simulationService.createJob(tokenAddress)
  res.json({ success: true, data: job })
})

// Create one-off job (singular alias)
router.post('/job', (req, res) => {
  const { tokenAddress } = req.body
  const job = simulationService.createJob(tokenAddress)
  res.json({ success: true, data: job })
})

// Get jobs
router.get('/jobs', (req, res) => {
  const jobs = simulationService.listJobs()
  res.json({ success: true, data: jobs })
})

// Get agents
router.get('/agents', (req, res) => {
  const agents = simulationService.listAgents()
  res.json({ success: true, data: agents })
})

// Status
router.get('/status', (req, res) => {
  res.json({ success: true, data: { running: simulationService.isRunning() } })
})

export default router
