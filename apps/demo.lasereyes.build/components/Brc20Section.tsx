import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { toast } from 'sonner'
import { getMempoolSpaceUrl } from '@/lib/urls'
import { type MAINNET, type TESTNET, useLaserEyes, type Brc20Balance, type SendArgs } from '@omnisat/lasereyes'

const BRC20Section = () => {
  const { provider, address, send, network, getMetaBalances, connected } = useLaserEyes()
  const [brc20s, setBrc20s] = useState<Brc20Balance[]>([])
  const [selectedBrc20, setSelectedBrc20] = useState<Brc20Balance | undefined>(undefined)
  const [brc20ToAddress, setBrc20ToAddress] = useState('')
  const [brc20Amount, setBrc20Amount] = useState('')


  useEffect(() => {
    if (address && connected && network) {
      getMetaBalances('brc20').then(setBrc20s)
    }
  }, [address, getMetaBalances, connected, network])

  const sendBrc20 = async () => {
    try {
      if (!selectedBrc20) throw new Error('No BRC-20 token selected')
      if (!address) throw new Error('No address available')
      if (!brc20ToAddress) throw new Error('No destination address provided')
      if (!brc20Amount) throw new Error('No amount specified')

      const txid = await send('brc20', {
        fromAddress: address,
        toAddress: brc20ToAddress,
        amount: Number(brc20Amount),
        ticker: selectedBrc20.ticker,
      } as SendArgs)

      toast.success(
        <span className={'flex flex-col gap-1 items-center justify-center'}>
          <span className={'font-black'}>View on mempool.space</span>
          <a
            target='_blank'
            href={`${getMempoolSpaceUrl(
              network as typeof MAINNET | typeof TESTNET
            )}/tx/${txid}`}
            className={'underline text-blue-600 text-xs'} rel="noreferrer"
          >
            {txid}
          </a>
        </span>
      )
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="text-md text-orange-400">brc-20</div>
      <Select
        onValueChange={(value) => {
          const brc20 = brc20s?.find((r: Brc20Balance) => r.ticker === value)
          setSelectedBrc20(brc20)
        }}
        disabled={!provider || brc20s.length === 0}
      >
        <SelectTrigger
          disabled={!provider}
          className={cn(
            'w-full bg-[#232225] border-none items-center justify-center flex flex-row gap-4 disabled:text-[#737275] text-sm text-center',
            'min-w-[200px]'
          )}
        >
          <SelectValue placeholder="Select a BRC-20" />
        </SelectTrigger>
        <SelectContent>
          {brc20s?.map((token) => (
            <SelectItem key={token.ticker} value={token.ticker}>
              {token.ticker} ({Number.parseFloat(token.overall)})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        disabled={!provider || brc20s.length === 0}
        className={cn(
          'w-full bg-[#232225] border-none disabled:text-[#737275] text-center'
        )}
        placeholder="To Address"
        value={brc20ToAddress}
        onChange={(e) => setBrc20ToAddress(e.target.value)}
      />
      <Input
        disabled={
          !provider ||
          !selectedBrc20 ||
          !brc20ToAddress
        }
        type="number"
        className={cn(
          'w-full bg-[#232225] border-none disabled:text-[#737275] text-center'
        )}
        placeholder="Amount"
        value={brc20Amount}
        onChange={(e) => setBrc20Amount(e.target.value)}
      />
      <Button
        disabled={
          !provider ||
          !selectedBrc20 ||
          !brc20ToAddress ||
          !brc20Amount
        }
        className={'w-full bg-[#232225] disabled:text-[#737275]'}
        onClick={sendBrc20}
      >
        Send BRC-20
      </Button>
    </div>
  )
}

export default BRC20Section
