import React from 'react'
import { Play, Pause, RotateCcw, Zap, Gauge } from 'lucide-react'

interface SimulationControlsProps {
  isRunning: boolean
  onStart: () => void
  onStop: () => void
  onClear: () => void
  onSpeedChange: (speed: 'slow' | 'normal' | 'fast') => void
  currentSpeed: number
}

export function SimulationControls({
  isRunning,
  onStart,
  onStop,
  onClear,
  onSpeedChange,
  currentSpeed,
}: SimulationControlsProps) {
  const getSpeedLabel = () => {
    if (currentSpeed === 0.5) return 'Slow'
    if (currentSpeed === 1) return 'Normal'
    if (currentSpeed === 2) return 'Fast'
    return 'Normal'
  }

  return (
    <div className="glass-panel p-4">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Start/Stop Button */}
        <button
          onClick={isRunning ? onStop : onStart}
          className={`btn ${isRunning ? 'btn-danger' : 'btn-primary'} flex items-center gap-2`}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4" />
              Stop Demo
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Start Demo
            </>
          )}
        </button>

        {/* Clear Button */}
        <button
          onClick={onClear}
          disabled={isRunning}
          className="btn btn-secondary flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Clear
        </button>

        {/* Speed Control */}
        <div className="flex items-center gap-2 ml-auto">
          <Gauge className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-500">Speed:</span>
          <div className="flex gap-1">
            <button
              onClick={() => onSpeedChange('slow')}
              disabled={isRunning}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                currentSpeed === 0.5
                  ? 'bg-primary text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              0.5x
            </button>
            <button
              onClick={() => onSpeedChange('normal')}
              disabled={isRunning}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                currentSpeed === 1
                  ? 'bg-primary text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              1x
            </button>
            <button
              onClick={() => onSpeedChange('fast')}
              disabled={isRunning}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                currentSpeed === 2
                  ? 'bg-primary text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              2x
            </button>
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      {isRunning && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-gray-400">
              Simulation running at {getSpeedLabel()} speed
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
