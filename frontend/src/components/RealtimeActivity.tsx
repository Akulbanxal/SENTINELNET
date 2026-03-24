"use client"

import React, { useEffect, useState } from 'react'
import { ActivityFeed } from './ActivityFeed'
import ActivityLogger from '@/lib/activityLog'
import { wsClient } from '@/lib/wsClient'

export default function RealtimeActivity() {
  const [logs, setLogs] = useState(ActivityLogger.getAll(50))

  useEffect(() => {
    // Subscribe to ActivityLogger updates
    const unsub = ActivityLogger.subscribe((entry) => {
      setLogs((prev) => [entry, ...prev].slice(0, 200))
    })

    // Wire WebSocket events to ActivityLogger
    const mapJobCreated = (data: any) => {
      ActivityLogger.jobCreated(data.id, data.tokenAddress)
    }

    const mapJobStarted = (data: any) => {
      ActivityLogger.jobStarted(data.id || data.jobId, data.tokenAddress || data.token)
    }

    const mapAgentStarted = (data: any) => {
      const agent = data.agent || data
      ActivityLogger.log(`${agent.name} analyzing ${data.jobId || ''}` as any, { type: 'system_info', agentName: agent.name })
    }

    const mapAgentFinished = (data: any) => {
      const agent = data.agent || data
      ActivityLogger.log(`${agent.name} finished ${data.jobId || ''}` as any, { type: 'system_info', agentName: agent.name })
    }

    const mapRisk = (data: any) => {
      ActivityLogger.riskCalculated(data.riskScore || data.riskScore || 0, (data.riskLevel || 'UNKNOWN'), data.tokenAddress, data.jobId)
    }

    const mapTradeDecision = (data: any) => {
      const decision = data.decision || data
      ActivityLogger.log(`Trade decision made: ${decision.decision || decision}`, { type: 'trade_review', decision: decision.decision || decision })
    }

  wsClient.on('job_created', mapJobCreated)
  wsClient.on('job_started', mapJobStarted)
  wsClient.on('agent_started', mapAgentStarted)
  wsClient.on('agent_finished', mapAgentFinished)
  wsClient.on('risk_score_updated', mapRisk)
  wsClient.on('trade_decision', mapTradeDecision)

    return () => {
      unsub()
      wsClient.off('job_created', mapJobCreated)
      wsClient.off('job_started', mapJobStarted)
      wsClient.off('agent_started', mapAgentStarted)
      wsClient.off('agent_finished', mapAgentFinished)
      wsClient.off('risk_score_updated', mapRisk)
      wsClient.off('trade_decision', mapTradeDecision)
    }
  }, [])

  return (
    <ActivityFeed
      logs={logs.map((l) => ({
    id: l.id,
    message: l.message,
    metadata: l.metadata,
    severity: l.level,
    timestamp: typeof l.timestamp === 'number' ? l.timestamp : l.timestamp.getTime(),
    type: l.type as any,
    agentName: l.agentName,
    tokenAddress: l.tokenAddress,
    jobId: l.jobId,
      }))}
    />
  )
}
