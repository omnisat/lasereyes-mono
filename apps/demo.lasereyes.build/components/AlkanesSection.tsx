import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from '@/components/ui/input'
import { cn, parseFixed } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { toast } from 'sonner'
import { getMempoolSpaceUrl } from '@/lib/urls'
import {
  type AlkaneBalance,
  ALKANES,
  type MAINNET,
  OYLNET,
  type TESTNET,
  useLaserEyes,
} from '@kevinoyl/lasereyes'

// Helper function to format alkane balance with 8 decimal places (like Bitcoin)
const formatAlkaneBalance = (balance: bigint): string => {
  const ALKANE_DECIMALS = 8
  const divisor = BigInt(10 ** ALKANE_DECIMALS)
  const integerPart = balance / divisor
  const fractionalPart = balance % divisor

  if (fractionalPart === BigInt(0)) {
    return integerPart.toString()
  }

  const fractionalStr = fractionalPart.toString().padStart(ALKANE_DECIMALS, '0')
  const trimmedFractional = fractionalStr.replace(/0+$/, '')

  return trimmedFractional
    ? `${integerPart}.${trimmedFractional}`
    : integerPart.toString()
}

const AlkanesSection = () => {
  const { provider, address, send, network, getMetaBalances, connected } =
    useLaserEyes()
  const [alkanes, setAlkanes] = useState<AlkaneBalance[]>([])
  const [selectedAlkane, setSelectedAlkane] = useState<
    AlkaneBalance | undefined
  >(undefined)
  const [alkaneToAddress, setAlkaneToAddress] = useState('')
  const [alkaneAmount, setAlkaneAmount] = useState('')

  useEffect(() => {
    if (address && network && connected) {
      // We'll need to modify the getMetaBalances function to support 'alkanes' protocol
      getMetaBalances(ALKANES)
        .then((x) => {
          console.log('alkanes', x)
          return x as AlkaneBalance[]
        })
        .then(setAlkanes)
    }
  }, [address, getMetaBalances, network, connected])

  const sendAlkane = async () => {
    try {
      if (!selectedAlkane) throw new Error('No Alkane selected')
      if (!address) throw new Error('No address available')
      if (!alkaneToAddress) throw new Error('No destination address provided')
      if (!alkaneAmount) throw new Error('No amount specified')

      // We'll need to modify the send function to support 'alkanes' protocol
      const txid = await send(ALKANES, {
        fromAddress: address,
        toAddress: alkaneToAddress,
        amount: parseFixed(alkaneAmount, 8),
        id: selectedAlkane.id,
        network: network as typeof MAINNET | typeof TESTNET | typeof OYLNET,
      })

      toast.success(
        <span className={'flex flex-col gap-1 items-center justify-center'}>
          <span className={'font-black'}>View on mempool.space</span>
          <a
            target="_blank"
            href={`${getMempoolSpaceUrl(
              network as typeof MAINNET | typeof TESTNET
            )}/tx/${txid}`}
            className={'underline text-blue-600 text-xs'}
            rel="noreferrer"
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
      <div className="text-md text-orange-400">alkanes</div>
      <Select
        onValueChange={(value) => {
          const alkane = alkanes?.find((a: AlkaneBalance) => a.id === value)
          setSelectedAlkane(alkane)
        }}
        disabled={!provider || alkanes.length === 0}
      >
        <SelectTrigger
          disabled={!provider}
          onClick={(e) => {
            console.log('clicked')
            e.preventDefault()
          }}
          className={cn(
            'w-full bg-[#232225] border-none justify-center flex flex-row gap-4 items-center disabled:text-[#737275] text-sm text-center',
            'min-w-[200px]'
          )}
        >
          <SelectValue placeholder="Select an Alkane" />
        </SelectTrigger>
        <SelectContent className="h-fit">
          {alkanes?.map((alkane) => (
            <SelectItem key={alkane.id} value={alkane.id}>
              {alkane.name} #{alkane.id} ({formatAlkaneBalance(alkane.balance)})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        disabled={!provider || alkanes.length === 0}
        className={cn(
          'w-full bg-[#232225] border-none disabled:text-[#737275] text-center'
        )}
        placeholder="To Address"
        value={alkaneToAddress}
        onChange={(e) => setAlkaneToAddress(e.target.value)}
      />
      <Input
        disabled={!provider || !selectedAlkane || !alkaneToAddress}
        type="number"
        className={cn(
          'w-full bg-[#232225] border-none disabled:text-[#737275] text-center'
        )}
        placeholder="Amount"
        value={alkaneAmount}
        onChange={(e) => setAlkaneAmount(e.target.value)}
      />
      <Button
        disabled={
          !provider || !selectedAlkane || !alkaneToAddress || !alkaneAmount
        }
        className={'w-full bg-[#232225] disabled:text-[#737275]'}
        onClick={sendAlkane}
      >
        Send Alkane
      </Button>
    </div>
  )
}

export default AlkanesSection
