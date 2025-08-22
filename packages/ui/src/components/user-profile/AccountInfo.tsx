'use client'

import { useState } from 'react'
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useLaserEyes, useBalance, MAINNET, TESTNET, TESTNET4, SIGNET, FRACTAL_MAINNET, FRACTAL_TESTNET, BTC } from '@kevinoyl/lasereyes'
import {
  Wallet,
  Bitcoin,
  Globe,
  Copy,
  LogOut
} from 'lucide-react'

export default function AccountInfo() {
  const {
    connected,
    address,
    disconnect,
    network,
    switchNetwork,
  } = useLaserEyes(({
    connected,
    address,
    disconnect,
    network,
    switchNetwork,
  }) => ({
    connected,
    address,
    disconnect,
    network,
    switchNetwork,
  }))

  const { data: btcBalance, isPending: isBtcBalancePending, error: btcBalanceError } = useBalance(BTC);

  const [copied, setCopied] = useState(false)
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false)

  // TODO: Replace this with actual configuration from context/props
  // This is where configured allowed networks would be retrieved
  const allowedNetworks = [
    { value: MAINNET, label: 'Mainnet' },
    { value: TESTNET, label: 'Testnet' },
    { value: TESTNET4, label: 'Testnet4' },
    { value: SIGNET, label: 'Signet' },
    { value: FRACTAL_MAINNET, label: 'Fractal Mainnet' },
    { value: FRACTAL_TESTNET, label: 'Fractal Testnet' },
  ]

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

  const handleNetworkChange = async (networkValue: string) => {
    if (networkValue === network) return

    setIsSwitchingNetwork(true)
    try {
      await switchNetwork(networkValue)
    } catch (error) {
      console.error('Failed to switch network:', error)
      // You might want to show an error toast/notification here
    } finally {
      setIsSwitchingNetwork(false)
    }
  }

  const getCurrentNetworkLabel = () => {
    const found = allowedNetworks.find(n => n.value === network)
    return found?.label || network || 'Mainnet'
  }

  if (!connected) {
    return null
  }

  return (
    <Card className="lem-border-none !lem-shadow-lg">
      <CardHeader>
        <CardTitle className="lem-flex lem-items-center lem-gap-2">
          <Wallet className="lem-h-5 lem-w-5" />
          Account Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="lem-space-y-4">
          <div className="lem-grid lem-grid-cols-1 md:lem-grid-cols-2 lem-gap-4">
            <div className="lem-p-4 lem-bg-primary/10 dark:lem-bg-primary/20 lem-border lem-border-primary/20 dark:lem-border-primary/40 lem-rounded-lg">
              <div className="lem-flex lem-items-center lem-gap-2 lem-mb-2">
                <Bitcoin className="lem-h-4 lem-w-4 lem-text-foreground" />
                <span className="lem-text-foreground lem-leading-none">Balance</span>
              </div>
              <p className={`lem-text-sm ${btcBalanceError ? 'lem-text-red-600 dark:lem-text-red-400' : 'lem-text-foreground'}`}>
                {btcBalanceError ? 'Error' : isBtcBalancePending ? '...' : `${btcBalance} BTC`}
              </p>
            </div>

            <div className="lem-p-4 lem-bg-primary/10 dark:lem-bg-primary/20 lem-border lem-border-primary/20 dark:lem-border-primary/40 lem-rounded-lg">
              <div className="lem-flex lem-items-center lem-gap-2 lem-mb-2">
                <Globe className="lem-h-4 lem-w-4 lem-text-foreground" />
                <span className="lem-text-foreground lem-leading-none">Network</span>
              </div>
              <Select value={network || MAINNET} onValueChange={handleNetworkChange} disabled={isSwitchingNetwork}>
                <SelectTrigger className="lem-w-full lem-h-6 lem-text-sm lem-bg-transparent lem-border-primary/30 lem-text-foreground">
                  <SelectValue>
                    {isSwitchingNetwork ? 'Switching...' : getCurrentNetworkLabel()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {allowedNetworks.map((networkOption) => (
                    <SelectItem key={networkOption.value} value={networkOption.value}>
                      {networkOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="lem-p-4 lem-bg-slate-50/50 dark:lem-bg-slate-800/30 lem-border lem-border-slate-200/60 dark:lem-border-slate-700/40 lem-rounded-lg">
            <div className="lem-hidden sm:lem-flex lem-items-center lem-justify-between">
              <div>
                <p className="lem-text-sm lem-font-medium lem-text-muted-foreground lem-mb-1">Wallet Address</p>
                <p className="lem-font-mono lem-text-sm">{formatAddress(address!)}</p>
              </div>
              <div className="lem-flex lem-gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyAddress}
                  className="lem-h-8"
                >
                  <Copy className="lem-h-3 lem-w-3 lem-mr-1" />
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={disconnect}
                  className="lem-h-8"
                >
                  Disconnect
                </Button>
              </div>
            </div>
            <div className="lem-flex sm:lem-hidden lem-items-center lem-justify-between">
              <span className="lem-font-mono lem-text-base">{formatAddress(address!)}</span>
              <div className="lem-flex lem-gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyAddress}
                  className="lem-h-8 lem-w-8 lem-p-0 lem-flex lem-items-center lem-justify-center"
                  aria-label="Copy address"
                  title="Copy address"
                >
                  <Copy className="lem-h-4 lem-w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={disconnect}
                  className="lem-h-8 lem-w-8 lem-p-0 lem-flex lem-items-center lem-justify-center"
                  aria-label="Disconnect"
                  title="Disconnect"
                >
                  <LogOut className="lem-h-4 lem-w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}