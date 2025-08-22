'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useLaserEyes } from '@kevinoyl/lasereyes'
import { ConnectWalletButton, ConnectWalletModal, ThemeControls, useTheme } from '@kevinoyl/lasereyes-ui'
import {
  Wallet,
  Bitcoin,
  Zap,
  Shield,
  Globe,
  ArrowRight,
  ExternalLink,
  Palette,
  Sun,
  Moon
} from 'lucide-react'

// Quick theme toggle component
function QuickThemeToggle() {
  const { isDark, toggleDarkMode, darkMode } = useTheme()

  if (darkMode === 'disabled') {
    return (
      <Button disabled variant="outline" size="sm">
        <Sun className="h-4 w-4 mr-2" />
        Light Mode Only
      </Button>
    )
  }

  return (
    <Button onClick={toggleDarkMode} variant="outline" size="sm">
      {isDark ? (
        <>
          <Sun className="h-4 w-4 mr-2" />
          Switch to Light
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 mr-2" />
          Switch to Dark
        </>
      )}
    </Button>
  )
}

export default function UIPage() {
  const {
    isConnecting,
  } = useLaserEyes(({
    isConnecting,
  }) => ({
    isConnecting,
  }))

  const [showModal, setShowModal] = useState(false)

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
    },
    {
      icon: <Palette className="h-6 w-6" />,
      title: "Customizable Themes",
      description: "Full theming support with dark mode, custom colors, and real-time updates"
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

        {/* Connection Status & Theme Controls */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Wallet Connection */}
            <div className="lg:col-span-2">
              <Card className="border-2 border-dashed border-blue-200 dark:border-blue-800 h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Wallet Connection & Demo
                  </CardTitle>
                  <CardDescription>
                    Connect your Bitcoin wallet and explore theming options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Connection buttons */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <ConnectWalletButton className="flex-1 h-12 text-lg font-semibold" />
                      <Button
                        variant="outline"
                        onClick={() => setShowModal(true)}
                        className="flex-1 h-12"
                      >
                        <Wallet className="mr-2 h-4 w-4" />
                        Custom Modal
                      </Button>
                    </div>
                  </div>

                  {/* Quick Theme Preview */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Palette className="h-4 w-4" />
                      Live Theme Preview
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm">Primary</Button>
                      <Button size="sm" variant="secondary">Secondary</Button>
                      <Button size="sm" variant="outline">Outline</Button>
                      <Button size="sm" variant="ghost">Ghost</Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Card className="bg-primary/10 border-primary/20">
                        <CardContent className="pt-3 pb-3">
                          <div className="flex items-center gap-2 text-primary text-sm">
                            <Bitcoin className="h-3 w-3" />
                            <span className="font-medium">Primary Theme</span>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-muted">
                        <CardContent className="pt-3 pb-3">
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Shield className="h-3 w-3" />
                            <span className="font-medium">Muted Theme</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg bg-card">
                      <p className="text-sm text-muted-foreground">Dark mode toggle:</p>
                      <QuickThemeToggle />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Theme Controls */}
            <div className="lg:col-span-1">
              <ThemeControls />
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Why Choose LaserEyes?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
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

        {/* Interactive Demo Section - always visible now */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Interactive Demo
              </CardTitle>
              <CardDescription>
                Try out some wallet interactions (connect your wallet to enable)
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