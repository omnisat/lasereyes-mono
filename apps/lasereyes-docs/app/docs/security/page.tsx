"use client"

import * as React from "react"
import { ClientPageWrapper } from "@/components/client-page-wrapper"
import { CodeBlock } from "@/components/code-block"
import { Heading } from "@/components/heading"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Lock, Key, AlertTriangle, FileWarning, ShieldCheck, ShieldAlert, Eye, KeyRound } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface FeatureCardProps {
  icon: React.ElementType
  title: string
  description: string
  className?: string
  badges?: string[]
}

export default function SecurityPage() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-orange-500/10 via-background to-background p-8">
        {/* Enhanced background effects */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-500/20 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-yellow-500/10 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-[200px] h-[200px] bg-orange-800/10 rounded-full blur-[80px] -z-10 -translate-x-1/2 -translate-y-1/2" />

        <div className="flex items-center gap-3 mb-4">
          <Badge variant="secondary" className="bg-orange-900/10 text-orange-400 hover:bg-orange-900/20">Security</Badge>
          <Badge variant="secondary" className="bg-yellow-900/10 text-yellow-400 hover:bg-yellow-900/20">Best Practices</Badge>
          <Badge variant="secondary" className="bg-orange-900/10 text-orange-400 hover:bg-orange-900/20">Guidelines</Badge>
        </div>

        <div className="flex items-center gap-6 mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-orange-900/20 to-yellow-900/20 backdrop-blur-sm ring-1 ring-orange-900/20">
            <Shield className="h-7 w-7 text-orange-400" />
          </div>
          <div>
            <Heading level={1} className="bg-gradient-to-r from-orange-400 via-orange-500 to-yellow-400 bg-clip-text text-transparent">
              Security Guide
            </Heading>
            <p className="text-sm text-muted-foreground">Comprehensive Security Best Practices</p>
          </div>
        </div>

        <p className="text-xl mb-8 max-w-2xl text-muted-foreground">
          Learn how to build secure Bitcoin applications with LaserEyes' security-first approach and battle-tested guidelines.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="border-orange-900/20 bg-orange-900/5 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-900/10">
                  <Lock className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <div className="text-sm font-medium">Secure by Default</div>
                  <div className="text-xs text-muted-foreground">Built-in protections</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-orange-900/20 bg-orange-900/5 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-900/10">
                  <Key className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <div className="text-sm font-medium">Key Management</div>
                  <div className="text-xs text-muted-foreground">Safe key handling</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-orange-900/20 bg-orange-900/5 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-900/10">
                  <AlertTriangle className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <div className="text-sm font-medium">Attack Prevention</div>
                  <div className="text-xs text-muted-foreground">Common vulnerabilities</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 items-center">
          <Link href="#implementation">
            <Button size="lg" className="bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 group">
              View Guidelines
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="#best-practices">
            <Button variant="outline" size="lg" className="group">
              <Shield className="mr-2 h-4 w-4" />
              Best Practices
            </Button>
          </Link>
        </div>
      </div>

      <ClientPageWrapper>
        <SecurityContent />
      </ClientPageWrapper>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description, className, badges }: FeatureCardProps) {
  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300 hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5",
      className
    )}>
      <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-orange-500/10 blur-2xl filter group-hover:bg-orange-500/20" />
      <CardContent className="p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500/20 to-yellow-500/20 text-orange-400 ring-1 ring-orange-500/20">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mb-2 text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground mb-4">{description}</p>
        {badges && (
          <div className="flex gap-2 flex-wrap">
            {badges.map((badge) => (
              <Badge key={badge} variant="secondary" className="bg-orange-900/10 text-orange-400">
                {badge}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function SecurityContent() {
  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Security Categories</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <FeatureCard
            icon={Lock}
            title="Wallet Security"
            description="Secure wallet connection and transaction signing practices to protect user assets."
            badges={["Connection", "Signing", "Permissions"]}
          />
          <FeatureCard
            icon={Key}
            title="Key Management"
            description="Best practices for handling private keys, signatures, and sensitive data."
            badges={["Private Keys", "Signatures", "Storage"]}
          />
          <FeatureCard
            icon={ShieldCheck}
            title="Transaction Safety"
            description="Guidelines for secure transaction creation, validation, and broadcasting."
            badges={["Validation", "Broadcasting", "Confirmation"]}
          />
          <FeatureCard
            icon={Eye}
            title="Privacy Protection"
            description="Measures to protect user privacy and prevent data leakage."
            badges={["Data Protection", "Anonymity", "Encryption"]}
          />
        </div>
      </section>

      <section id="implementation" className="space-y-6">
        <h2 className="text-3xl font-bold">Implementation Guidelines</h2>
        <Card className="overflow-hidden border-2 border-dashed border-orange-900/20">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">Secure Wallet Connection</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="typescript"
              code={`import { useLaserEyes, WalletConnectionOptions } from '@kevinoyl/lasereyes-react'

function SecureWalletConnect() {
  const { connect } = useLaserEyes()

  const secureConnect = async () => {
    const options: WalletConnectionOptions = {
      requiredPermissions: ['SIGN_TRANSACTIONS'],
      networkValidation: true,
      timeout: 30000,
      onPermissionRequest: (permissions) => {
        // Validate requested permissions
        return validatePermissions(permissions)
      }
    }

    try {
      await connect(options)
    } catch (error) {
      // Handle connection errors securely
      handleSecurityError(error)
    }
  }
}`}
              copyButton={true}
            />
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-2 border-dashed border-orange-900/20">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">Secure Transaction Handling</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="typescript"
              code={`import { useLaserEyes, TransactionSecurity } from '@kevinoyl/lasereyes-react'

function SecureTransaction() {
  const { sendBitcoin } = useLaserEyes()

  const secureSend = async (recipient: string, amount: number) => {
    const security = new TransactionSecurity({
      validateAddress: true,
      validateAmount: true,
      requireConfirmation: true,
      maxFeeRate: 100, // sat/vB
      minimumChange: 1000 // sats
    })

    try {
      // Validate transaction parameters
      await security.validate({ recipient, amount })

      // Send transaction with security checks
      const txid = await sendBitcoin({
        recipient,
        amount,
        security
      })

      // Verify transaction broadcast
      await security.verifyBroadcast(txid)
    } catch (error) {
      // Handle security violations
      handleSecurityViolation(error)
    }
  }
}`}
              copyButton={true}
            />
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-2 border-dashed border-orange-900/20">
          <CardHeader className="border-b bg-muted/50 px-6">
            <h2 className="font-mono text-sm font-medium">Privacy Protection</h2>
          </CardHeader>
          <CardContent className="p-6">
            <CodeBlock
              language="typescript"
              code={`import { useLaserEyes, PrivacyConfig } from '@kevinoyl/lasereyes-react'

function PrivacyProtection() {
  const privacyConfig: PrivacyConfig = {
    maskAddresses: true,
    hideBalances: true,
    preventTracking: true,
    secureStorage: {
      encryption: true,
      autoClear: true,
      storageKey: 'secure_storage'
    }
  }

  return (
    <LaserEyesProvider
      config={{
        privacy: privacyConfig,
        network: MAINNET
      }}
    >
      <YourApp />
    </LaserEyesProvider>
  )
}`}
              copyButton={true}
            />
          </CardContent>
        </Card>
      </section>

      <section id="best-practices" className="space-y-6">
        <Card className="overflow-hidden border-orange-900/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-900/10">
                <ShieldAlert className="h-5 w-5 text-orange-400" />
              </div>
              <h2 className="text-2xl font-bold">Security Best Practices</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-2">Input Validation</h3>
                <p className="text-sm text-muted-foreground">
                  Always validate and sanitize user inputs, especially addresses and amounts, before processing transactions.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Error Handling</h3>
                <p className="text-sm text-muted-foreground">
                  Implement secure error handling that doesn't expose sensitive information in error messages.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Network Security</h3>
                <p className="text-sm text-muted-foreground">
                  Use secure connections (HTTPS) and validate network responses to prevent man-in-the-middle attacks.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Data Protection</h3>
                <p className="text-sm text-muted-foreground">
                  Encrypt sensitive data at rest and in transit, and implement secure storage practices.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-orange-900/20 bg-orange-900/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-900/10">
                <FileWarning className="h-5 w-5 text-orange-400" />
              </div>
              <h2 className="text-2xl font-bold">Security Checklist</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <KeyRound className="h-5 w-5 text-orange-400 mt-1" />
                <div>
                  <h3 className="font-semibold">Secure Key Management</h3>
                  <p className="text-sm text-muted-foreground">Never store private keys in localStorage or expose them in the frontend.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-orange-400 mt-1" />
                <div>
                  <h3 className="font-semibold">Transaction Validation</h3>
                  <p className="text-sm text-muted-foreground">Implement multiple validation layers for all transactions.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-orange-400 mt-1" />
                <div>
                  <h3 className="font-semibold">Access Control</h3>
                  <p className="text-sm text-muted-foreground">Implement proper permission checks and wallet authentication.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Eye className="h-5 w-5 text-orange-400 mt-1" />
                <div>
                  <h3 className="font-semibold">Privacy Measures</h3>
                  <p className="text-sm text-muted-foreground">Protect user data and implement privacy-preserving features.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

