'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Shield, Wallet } from 'lucide-react'
import { useWallet } from '@/context/WalletContext'
import { useDemoModeContext } from '@/context/DemoModeContext'
import { DemoModeToggle } from '@/components/DemoModeToggle'

export default function Navbar() {
  const pathname = usePathname()
  const { account, chainId, isConnecting, connectWallet, disconnectWallet } = useWallet()
  const { isEnabled, demoCount, toggleDemo } = useDemoModeContext()

  const navItems = [
    { name: 'Home', path: '/' },
  ]

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getNetworkName = (chainId: number) => {
    const networks: Record<number, string> = {
      1: 'Ethereum',
      11155111: 'Sepolia',
      5: 'Goerli',
    }
    return networks[chainId] || 'Unknown'
  }

  return (
    <nav className="border-b border-white/10 bg-gray-900/30 backdrop-blur-xl sticky top-0 z-50 shadow-lg shadow-black/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold group">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 group-hover:scale-110 transition-transform">
                <Shield className="w-5 h-5 text-blue-400" />
              </div>
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent whitespace-nowrap">
                SentinelNet
              </span>
            </Link>
          </div>

          {/* Navigation Links - Centered */}
          <div className="flex-1 flex justify-center mx-4">
            <div className="flex items-center gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-4 py-2 rounded-lg transition-all font-medium ${
                    pathname === item.path
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30 shadow-lg shadow-blue-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center gap-3">
            {/* Demo Mode Toggle */}
            <DemoModeToggle 
              isEnabled={isEnabled}
              demoCount={demoCount}
              onToggle={toggleDemo}
            />

            {account ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">{getNetworkName(chainId!)}</div>
                  <div className="text-sm font-medium text-gray-300">{formatAddress(account)}</div>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-gray-800/50 to-gray-700/50 hover:from-gray-700/50 hover:to-gray-600/50 text-white border border-white/10 backdrop-blur-sm transition-all flex items-center gap-2 shadow-lg"
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
                  <span className="hidden sm:inline font-medium">Connected</span>
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-700 disabled:to-gray-800 text-white font-medium transition-all flex items-center gap-2 shadow-lg shadow-blue-500/30 disabled:shadow-none"
              >
                <Wallet className="w-4 h-4" />
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
