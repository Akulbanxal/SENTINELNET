'use client'

import { Play, Square } from 'lucide-react'

interface DemoModeToggleProps {
  isEnabled: boolean
  demoCount: number
  onToggle: () => void
}

export function DemoModeToggle({ isEnabled, demoCount, onToggle }: DemoModeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
        isEnabled
          ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30'
          : 'bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600'
      }`}
      title={isEnabled ? 'Stop Demo Mode' : 'Start Demo Mode'}
    >
      {isEnabled ? (
        <>
          <Square className="w-4 h-4 fill-current" />
          <span className="hidden md:inline">Demo Mode ON</span>
          <span className="md:hidden">Demo ON</span>
          {demoCount > 0 && (
            <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">
              {demoCount}
            </span>
          )}
        </>
      ) : (
        <>
          <Play className="w-4 h-4 fill-current" />
          <span className="hidden md:inline">Demo Mode</span>
          <span className="md:hidden">Demo</span>
        </>
      )}
    </button>
  )
}
