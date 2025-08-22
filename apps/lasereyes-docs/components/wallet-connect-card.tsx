"use client"

import { useState, useEffect } from "react"
import { useLaserEyes } from "@kevinoyl/lasereyes-react"
import { UNISAT, XVERSE, OYL, LEATHER, MAGIC_EDEN, OKX, PHANTOM, WIZZ, ORANGE, OP_NET } from "@kevinoyl/lasereyes-core"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Copy, Check, ExternalLink, Send, Pencil, Upload, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { LaserEyesLogo, WalletIcon } from "@kevinoyl/lasereyes-react"
import type { colorsType } from "@kevinoyl/lasereyes-react"
import Link from "next/link"

export function WalletConnectCard() {
  const {
    connect,
    disconnect,
    connected,
    address,
    balance,
    sendBTC,
    provider,
    signMessage,
    getInscriptions,
    getMetaBalances,
    inscribe,
    sendInscriptions,
    send,
  } = useLaserEyes()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [signature, setSignature] = useState("")
  const [activeTab, setActiveTab] = useState("wallet")

  // Inscriptions state
  const [inscriptions, setInscriptions] = useState<any[]>([])
  const [inscriptionText, setInscriptionText] = useState("Inscribed with LaserEyes")
  const [selectedInscriptionIds, setSelectedInscriptionIds] = useState<string[]>([])
  const [inscriptionRecipient, setInscriptionRecipient] = useState("")

  // BRC-20 state
  const [brc20Tokens, setBrc20Tokens] = useState<any[]>([])
  const [selectedToken, setSelectedToken] = useState<any>()
  const [tokenRecipient, setTokenRecipient] = useState("")
  const [tokenAmount, setTokenAmount] = useState("")

  // Runes state
  const [runes, setRunes] = useState<any[]>([])
  const [selectedRune, setSelectedRune] = useState<any>()
  const [runeRecipient, setRuneRecipient] = useState("")
  const [runeAmount, setRuneAmount] = useState("")

  // BTC send state
  const [btcRecipient, setBtcRecipient] = useState("")
  const [btcAmount, setBtcAmount] = useState("")

  // Define all supported wallets
  const wallets = [
    { name: "UniSat", provider: UNISAT },
    { name: "Xverse", provider: XVERSE },
    { name: "OYL", provider: OYL },
    { name: "Leather", provider: LEATHER },
    { name: "Magic Eden", provider: MAGIC_EDEN },
    { name: "OKX", provider: OKX },
    { name: "Phantom", provider: PHANTOM },
    { name: "Wizz", provider: WIZZ },
    { name: "Orange", provider: ORANGE },
    { name: "OP_NET", provider: OP_NET },
  ]

  // Load data when connected
  useEffect(() => {
    if (connected) {
      fetchData()
    } else {
      resetState()
    }
  }, [connected, provider])

  const fetchData = async () => {
    try {
      // Fetch inscriptions
      const inscriptionsData = await getInscriptions()
      setInscriptions(inscriptionsData || [])

      // Fetch BRC-20 tokens
      const brc20Data = await getMetaBalances("brc20")
      setBrc20Tokens(brc20Data || [])

      // Fetch Runes
      const runesData = await getMetaBalances("runes")
      setRunes(runesData || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  const resetState = () => {
    setInscriptions([])
    setBrc20Tokens([])
    setRunes([])
    setSelectedInscriptionIds([])
    setSelectedToken(undefined)
    setSelectedRune(undefined)
    setInscriptionRecipient("")
    setTokenRecipient("")
    setRuneRecipient("")
    setTokenAmount("")
    setRuneAmount("")
    setBtcRecipient("")
    setBtcAmount("")
    setSignature("")
  }

  const connectWallet = async (walletProvider: string) => {
    setError("")
    setLoading(true)
    try {
      await connect(walletProvider)
    } catch (error: any) {
      setError(error.message || "Failed to connect wallet")
    } finally {
      setLoading(false)
    }
  }

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatBalance = () => {
    if (!balance) return "0"
    // Convert from satoshis to BTC
    return (Number(balance) / 100000000).toFixed(8)
  }

  const truncateAddress = (addr: string) => {
    if (!addr) return ""
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const handleSendBTC = async () => {
    if (!btcRecipient || !btcAmount) {
      setError("Please enter recipient address and amount")
      return
    }

    setError("")
    setLoading(true)

    try {
      // Convert amount to satoshis (1 BTC = 100,000,000 satoshis)
      const satoshis = Math.floor(Number.parseFloat(btcAmount) * 100000000)

      // Send transaction
      const txid = await sendBTC(btcRecipient, satoshis)
      alert(`Transaction sent! TXID: ${txid}`)
      setBtcAmount("")
      setBtcRecipient("")
    } catch (error: any) {
      setError(error.message || "Transaction failed")
    } finally {
      setLoading(false)
    }
  }

  const handleSignMessage = async () => {
    try {
      const message = "Verify with LaserEyes"
      const sig = await signMessage(message, address)
      setSignature(sig)
    } catch (error: any) {
      setError(error.message || "Failed to sign message")
    }
  }

  const handleInscribe = async () => {
    try {
      setLoading(true)
      const txid = await inscribe(Buffer.from(inscriptionText).toString("base64"), "text/plain")
      alert(`Inscription created! TXID: ${txid}`)
      setInscriptionText("Inscribed with LaserEyes")
      // Refresh inscriptions
      fetchData()
    } catch (error: any) {
      setError(error.message || "Failed to inscribe")
    } finally {
      setLoading(false)
    }
  }

  const toggleInscriptionSelection = (id: string) => {
    if (!id) return

    setSelectedInscriptionIds((prev) => {
      // If already selected, remove it
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id)
      }
      // Otherwise add it
      else {
        return [...prev, id]
      }
    })
  }

  const handleSendInscriptions = async () => {
    if (!inscriptionRecipient || selectedInscriptionIds.length === 0) {
      setError("Please select inscriptions and enter recipient address")
      return
    }

    try {
      setLoading(true)
      const txid = await sendInscriptions(selectedInscriptionIds, inscriptionRecipient)
      alert(`Inscriptions sent! TXID: ${txid}`)
      setSelectedInscriptionIds([])
      setInscriptionRecipient("")
      // Refresh inscriptions
      fetchData()
    } catch (error: any) {
      setError(error.message || "Failed to send inscriptions")
    } finally {
      setLoading(false)
    }
  }

  const handleSendToken = async () => {
    if (!selectedToken || !tokenRecipient || !tokenAmount) {
      setError("Please select token, recipient, and amount")
      return
    }

    try {
      setLoading(true)
      const txid = await send("brc20", {
        fromAddress: address,
        toAddress: tokenRecipient,
        amount: Number(tokenAmount),
        ticker: selectedToken.ticker,
      })
      alert(`Token sent! TXID: ${txid}`)
      setSelectedToken(undefined)
      setTokenRecipient("")
      setTokenAmount("")
      // Refresh tokens
      fetchData()
    } catch (error: any) {
      setError(error.message || "Failed to send token")
    } finally {
      setLoading(false)
    }
  }

  const handleSendRune = async () => {
    if (!selectedRune || !runeRecipient || !runeAmount) {
      setError("Please select rune, recipient, and amount")
      return
    }

    try {
      setLoading(true)
      const txid = await send("runes", {
        fromAddress: address,
        toAddress: runeRecipient,
        amount: Number(runeAmount),
        runeId: selectedRune.name,
      })
      alert(`Rune sent! TXID: ${txid}`)
      setSelectedRune(undefined)
      setRuneRecipient("")
      setRuneAmount("")
      // Refresh runes
      fetchData()
    } catch (error: any) {
      setError(error.message || "Failed to send rune")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full overflow-hidden border-2">
      <CardHeader className="pb-2">
        <div className="flex items-center">
          <LaserEyesLogo width={32} color={(connected ? "green" : "orange") as colorsType} className="mr-2" />
          <div>
            <CardTitle>LaserEyes Wallet Connect</CardTitle>
            <CardDescription>Connect your Bitcoin wallet to explore LaserEyes features</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div>
          {!connected ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {wallets.map((wallet) => (
                  <Button
                    key={wallet.name}
                    variant="outline"
                    className="h-12 flex items-center justify-center gap-2"
                    onClick={() => connectWallet(wallet.provider)}
                    disabled={loading}
                  >
                    <WalletIcon walletName={wallet.provider} size={20} />
                    <span className="font-semibold">{wallet.name}</span>
                  </Button>
                ))}
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <p className="text-sm text-muted-foreground text-center">
                Don't have a wallet? <br />
                <Link href="/docs/installation" className="text-primary hover:underline inline-flex items-center gap-1">Click here to see some options</Link>
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Connected Wallet</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono">{truncateAddress(address)}</p>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyAddress}>
                      {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                      <span className="sr-only">Copy address</span>
                    </Button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Balance</p>
                  <p className="font-semibold">{formatBalance()} BTC</p>
                </div>
              </div>

              <Tabs defaultValue="wallet" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="wallet">Wallet</TabsTrigger>
                  <TabsTrigger value="inscriptions">Inscriptions</TabsTrigger>
                  <TabsTrigger value="brc20">BRC-20</TabsTrigger>
                  <TabsTrigger value="runes">Runes</TabsTrigger>
                </TabsList>

                {/* Wallet Tab */}
                <TabsContent value="wallet" className="space-y-4 pt-4">
                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">Recipient Address</label>
                    <Input
                      type="text"
                      className="w-full p-2 bg-muted border rounded"
                      placeholder="bc1q..."
                      value={btcRecipient}
                      onChange={(e) => setBtcRecipient(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">Amount (BTC)</label>
                    <Input
                      type="number"
                      className="w-full p-2 bg-muted border rounded"
                      placeholder="0.0001"
                      step="0.00000001"
                      min="0"
                      value={btcAmount}
                      onChange={(e) => setBtcAmount(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 gap-1"
                      onClick={handleSendBTC}
                      disabled={!btcRecipient || !btcAmount || loading}
                    >
                      <Send className="h-4 w-4" />
                      Send BTC
                    </Button>
                    <Button variant="outline" className="flex-1 gap-1" onClick={handleSignMessage} disabled={loading}>
                      <Pencil className="h-4 w-4" />
                      Sign Message
                    </Button>
                  </div>
                  {signature && (
                    <div className="bg-muted p-2 rounded text-xs font-mono break-all">
                      <p className="text-muted-foreground mb-1">Signature:</p>
                      {signature}
                    </div>
                  )}
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                </TabsContent>

                {/* Inscriptions Tab */}
                <TabsContent value="inscriptions" className="space-y-4 pt-4">
                  <div className="flex flex-wrap gap-2">
                    {inscriptions.length > 0 ? (
                      inscriptions.slice(0, 4).map((insc) => (
                        <div
                          key={insc.id || insc.inscriptionId}
                          className={cn(
                            "relative w-[60px] h-[60px] border-2",
                            selectedInscriptionIds.includes(insc.inscriptionId || insc.id)
                              ? "border-primary"
                              : "border-transparent",
                          )}
                        >
                          {/* The iframe for preview */}
                          <div className="w-full h-full bg-muted flex items-center justify-center text-xs overflow-hidden">
                            {insc.preview ? (
                              <iframe src={insc.preview} className="w-full h-full pointer-events-none" />
                            ) : (
                              <FileText className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>

                          {/* Transparent overlay to capture clicks */}
                          <div
                            className="absolute inset-0 cursor-pointer z-10"
                            onClick={() => toggleInscriptionSelection(insc.inscriptionId || insc.id)}
                          />

                          {/* Selection indicator */}
                          {selectedInscriptionIds.includes(insc.inscriptionId || insc.id) && (
                            <div className="absolute top-0 right-0 bg-primary text-primary-foreground w-4 h-4 flex items-center justify-center text-[10px] z-20">
                              ✓
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No inscriptions found</p>
                    )}
                  </div>

                  {inscriptions.length > 0 && (
                    <>
                      <Input
                        type="text"
                        className="w-full p-2 bg-muted border rounded"
                        placeholder="Recipient address"
                        value={inscriptionRecipient}
                        onChange={(e) => setInscriptionRecipient(e.target.value)}
                      />
                      <Button
                        className="w-full gap-1"
                        onClick={handleSendInscriptions}
                        disabled={selectedInscriptionIds.length === 0 || !inscriptionRecipient || loading}
                      >
                        <Send className="h-4 w-4" />
                        Send Inscriptions ({selectedInscriptionIds.length})
                      </Button>
                    </>
                  )}

                  <div className="border-t pt-3">
                    <label className="text-sm text-muted-foreground block mb-1">Create New Inscription</label>
                    <Input
                      type="text"
                      className="w-full p-2 bg-muted border rounded mb-2"
                      placeholder="Text to inscribe"
                      value={inscriptionText}
                      onChange={(e) => setInscriptionText(e.target.value)}
                    />
                    <Button className="w-full gap-1" onClick={handleInscribe} disabled={!inscriptionText || loading}>
                      <Upload className="h-4 w-4" />
                      Inscribe Text
                    </Button>
                  </div>
                </TabsContent>

                {/* BRC-20 Tab */}
                <TabsContent value="brc20" className="space-y-4 pt-4">
                  <Select
                    onValueChange={(value) => {
                      const token = brc20Tokens.find((t) => t.ticker === value)
                      setSelectedToken(token)
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select BRC-20 token" />
                    </SelectTrigger>
                    <SelectContent>
                      {brc20Tokens.length > 0 ? (
                        brc20Tokens.map((token, i) => (
                          <SelectItem key={i} value={token.ticker}>
                            {token.ticker} ({Number.parseFloat(token.overall || token.balance).toFixed(2)})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No tokens found
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>

                  <Input
                    type="text"
                    className="w-full p-2 bg-muted border rounded"
                    placeholder="Recipient address"
                    value={tokenRecipient}
                    onChange={(e) => setTokenRecipient(e.target.value)}
                    disabled={!selectedToken}
                  />

                  <Input
                    type="number"
                    className="w-full p-2 bg-muted border rounded"
                    placeholder="Amount"
                    value={tokenAmount}
                    onChange={(e) => setTokenAmount(e.target.value)}
                    disabled={!selectedToken || !tokenRecipient}
                  />

                  <Button
                    className="w-full gap-1"
                    onClick={handleSendToken}
                    disabled={!selectedToken || !tokenRecipient || !tokenAmount || loading}
                  >
                    <Send className="h-4 w-4" />
                    Send {selectedToken?.ticker || "Token"}
                  </Button>
                </TabsContent>

                {/* Runes Tab */}
                <TabsContent value="runes" className="space-y-4 pt-4">
                  <Select
                    onValueChange={(value) => {
                      const rune = runes.find((r) => r.symbol === value)
                      setSelectedRune(rune)
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Rune" />
                    </SelectTrigger>
                    <SelectContent>
                      {runes.length > 0 ? (
                        runes.map((rune, i) => (
                          <SelectItem key={i} value={rune.symbol}>
                            {rune.name} ({rune.balance})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No runes found
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>

                  <Input
                    type="text"
                    className="w-full p-2 bg-muted border rounded"
                    placeholder="Recipient address"
                    value={runeRecipient}
                    onChange={(e) => setRuneRecipient(e.target.value)}
                    disabled={!selectedRune}
                  />

                  <Input
                    type="number"
                    className="w-full p-2 bg-muted border rounded"
                    placeholder="Amount"
                    value={runeAmount}
                    onChange={(e) => setRuneAmount(e.target.value)}
                    disabled={!selectedRune || !runeRecipient}
                  />

                  <Button
                    className="w-full gap-1"
                    onClick={handleSendRune}
                    disabled={!selectedRune || !runeRecipient || !runeAmount || loading}
                  >
                    <Send className="h-4 w-4" />
                    Send {selectedRune?.name || "Rune"}
                  </Button>
                </TabsContent>
              </Tabs>

              <Button variant="outline" className="w-full" onClick={disconnect}>
                Disconnect
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

