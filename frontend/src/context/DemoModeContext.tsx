'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useDemoMode } from '@/hooks/useDemoMode'

interface DemoModeContextType {
  isEnabled: boolean
  demoCount: number
  startDemo: () => void
  stopDemo: () => void
  toggleDemo: () => void
  runDemoVerification: () => Promise<void>
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined)

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const demoMode = useDemoMode({ interval: 10000 })

  return (
    <DemoModeContext.Provider value={demoMode}>
      {children}
    </DemoModeContext.Provider>
  )
}

export function useDemoModeContext() {
  const context = useContext(DemoModeContext)
  if (context === undefined) {
    throw new Error('useDemoModeContext must be used within a DemoModeProvider')
  }
  return context
}
