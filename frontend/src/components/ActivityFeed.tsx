import React from 'react'
import { Activity, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react'
import type { ActivityLog } from '@/types'
import { formatTimeAgo } from '@/lib/utils'

interface ActivityFeedProps {
  logs: ActivityLog[]
  maxHeight?: string
  showTimestamps?: boolean
}

export function ActivityFeed({ 
  logs, 
  maxHeight = 'max-h-96', 
  showTimestamps = true 
}: ActivityFeedProps) {
  const getIcon = (severity: ActivityLog['severity']) => {
    switch (severity) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning" />
      case 'error':
        return <XCircle className="w-5 h-5 text-danger" />
      default:
        return <Info className="w-5 h-5 text-primary" />
    }
  }

  const getSeverityColor = (severity: ActivityLog['severity']) => {
    switch (severity) {
      case 'success':
        return 'border-l-success bg-success/5'
      case 'warning':
        return 'border-l-warning bg-warning/5'
      case 'error':
        return 'border-l-danger bg-danger/5'
      default:
        return 'border-l-primary bg-primary/5'
    }
  }

  if (logs.length === 0) {
    return (
      <div className="glass-panel p-8 text-center">
        <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">No activity yet</p>
        <p className="text-sm text-gray-500 mt-2">
          Start a verification to see activity logs
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-2 overflow-y-auto ${maxHeight} scrollbar-thin`}>
      {logs.map((log) => (
        <div
          key={log.id}
          className={`glass-panel p-4 border-l-4 ${getSeverityColor(log.severity)} 
            hover:bg-gray-800/50 transition-colors duration-200`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">{getIcon(log.severity)}</div>
            
            <div className="flex-1 min-w-0">
              <p className="text-gray-200 text-sm">{log.message}</p>
              
              {log.metadata && Object.keys(log.metadata).length > 0 && (
                <div className="mt-2 text-xs text-gray-500 space-y-1">
                  {Object.entries(log.metadata).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="font-medium">{key}:</span>
                      <span className="text-gray-400">
                        {typeof value === 'object' 
                          ? JSON.stringify(value, null, 2) 
                          : String(value)
                        }
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {showTimestamps && (
              <div className="flex-shrink-0 text-xs text-gray-500">
                {formatTimeAgo(log.timestamp)}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
