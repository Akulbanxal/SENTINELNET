import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { WalletProvider } from '@/context/WalletContext'
import { DemoModeProvider } from '@/context/DemoModeContext'
import Navbar from '@/components/layout/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SentinelNet - Decentralized Verification Network',
  description: 'Professional trading analytics platform with autonomous verification agents',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider>
          <DemoModeProvider>
            <div className="min-h-screen bg-background relative overflow-hidden">
              {/* Animated gradient background */}
              <div className="fixed inset-0 bg-gradient-mesh opacity-50" />
              <div className="fixed inset-0 bg-grid-pattern" style={{ backgroundSize: '50px 50px' }} />
              
              {/* Floating orbs */}
              <div className="fixed top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
              <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
              <div className="fixed top-1/2 right-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
              
              <div className="relative z-10">
                <Navbar />
                <main className="container mx-auto px-4 py-8">
                  {children}
                </main>
              </div>
            </div>
          </DemoModeProvider>
        </WalletProvider>
      </body>
    </html>
  )
}
