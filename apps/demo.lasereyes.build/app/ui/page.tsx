'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useLaserEyes } from '@omnisat/lasereyes'
import { ConnectWalletButton, ConnectWalletModal } from '@omnisat/lasereyes-ui'
import { 
  Wallet, 
  Bitcoin, 
  Zap, 
  Shield, 
  Globe, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  Copy,
  ExternalLink
} from 'lucide-react'

export default function UIPage() {
  const { 
    connected, 
    address, 
    disconnect, 
    balance,
    network,
    isConnecting,
  } = useLaserEyes(({ 
    connected, 
    address, 
    disconnect, 
    balance,
    network,
    isConnecting,
  }) => ({ 
    connected, 
    address, 
    disconnect, 
    balance,
    network,
    isConnecting,
  }))

  const [showModal, setShowModal] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const features = [
    {
      icon: <Wallet className="h-6 w-6" />,
      title: "Multi-Wallet Support",
      description: "Connect with UniSat, Xverse, Oyl, Magic Eden, OKX, Leather, Phantom, Wizz, and Orange"
    },
    {
      icon: <Bitcoin className="h-6 w-6" />,
      title: "Bitcoin Native",
      description: "Built specifically for Bitcoin ecosystem with support for inscriptions and runes"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Lightning Fast",
      description: "Optimized for performance with instant wallet detection and connection"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure by Design",
      description: "No private key storage, direct wallet communication for maximum security"
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Cross-Platform",
      description: "Works seamlessly across web, mobile, and desktop applications"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            LaserEyes UI Demo
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the future of Bitcoin wallet integration with our comprehensive React components
          </p>
        </div>

        {/* Connection Status */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="border-2 border-dashed border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Wallet Connection Status
              </CardTitle>
              <CardDescription>
                {connected ? "Your wallet is connected and ready to use" : "Connect your Bitcoin wallet to get started"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!connected ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <ConnectWalletButton 
                      className="flex-1 h-12 text-lg font-semibold"
                      variant="default"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => setShowModal(true)}
                      className="flex-1 h-12"
                    >
                      <Wallet className="mr-2 h-4 w-4" />
                      Custom Modal
                    </Button>
                  </div>
                  
                  {/* {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
                    </div>
                  )} */}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-green-700 dark:text-green-300">Connected</span>
                      </div>
                      <p className="text-sm text-green-600 dark:text-green-400">Wallet is ready</p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Bitcoin className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold text-blue-700 dark:text-blue-300">Balance</span>
                      </div>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        {balance ? `${balance} BTC` : 'Loading...'}
                      </p>
                    </div>
                    
                    <div className="p-4 bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="h-4 w-4 text-purple-600" />
                        <span className="font-semibold text-purple-700 dark:text-purple-300">Network</span>
                      </div>
                      <p className="text-sm text-purple-600 dark:text-purple-400">
                        {network || 'Mainnet'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Wallet Address</p>
                        <p className="font-mono text-sm">{formatAddress(address!)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyAddress}
                          className="h-8"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          {copied ? 'Copied!' : 'Copy'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={disconnect}
                          className="h-8"
                        >
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Why Choose LaserEyes?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Interactive Demo Section */}
        {connected && (
          <div className="max-w-4xl mx-auto mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Interactive Demo
                </CardTitle>
                <CardDescription>
                  Try out some wallet interactions (simulated for demo purposes)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button className="h-12" variant="outline">
                    <Bitcoin className="mr-2 h-4 w-4" />
                    Send Transaction
                  </Button>
                  <Button className="h-12" variant="outline">
                    <Shield className="mr-2 h-4 w-4" />
                    Sign Message
                  </Button>
                  <Button className="h-12" variant="outline">
                    <Globe className="mr-2 h-4 w-4" />
                    Switch Network
                  </Button>
                  <Button className="h-12" variant="outline">
                    <Wallet className="mr-2 h-4 w-4" />
                    View Inscriptions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Call to Action */}
        <div className="max-w-2xl mx-auto text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-2">Ready to Build?</h3>
              <p className="mb-4 opacity-90">
                Start building Bitcoin applications with LaserEyes today
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Documentation
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Get Started
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Custom Modal */}
      <ConnectWalletModal 
        open={showModal} 
        onClose={() => setShowModal(false)}
      />
    </div>
  )
}