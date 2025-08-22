import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { toast } from 'sonner'
import { getMempoolSpaceUrl } from '@/lib/urls'
import { type MAINNET, type RuneSendArgs, type TESTNET, useLaserEyes, type OrdRuneBalance } from '@kevinoyl/lasereyes'

const RunesSection = () => {
  const { provider, address, send, network, getMetaBalances, connected } = useLaserEyes()
  const [runes, setRunes] = useState<OrdRuneBalance[]>([])

  const [selectedRune, setSelectedRune] = useState<OrdRuneBalance>()
  const [runeToAddress, setRuneToAddress] = useState(address || '')
  const [runeAmount, setRuneAmount] = useState('')

  useEffect(() => {
    if (address && connected && network) {
      getMetaBalances('runes').then((x) => setRunes(x as OrdRuneBalance[]))
    }
  }, [address, getMetaBalances, connected, network])

  const sendRune = async () => {
    try {
      if (!selectedRune) throw new Error('No rune selected')
      if (!address) throw new Error('No address available')
      if (!runeToAddress) throw new Error('No destination address provided')
      if (!runeAmount) throw new Error('No amount specified')

      const txid = await send('runes', {
        fromAddress: address,
        toAddress: runeToAddress,
        amount: Number(runeAmount),
        runeId: selectedRune.name,
      } as RuneSendArgs)

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
      <div className="text-md text-orange-400">runes</div>
      <Select
        onValueChange={(value) => {
          const rune = runes?.find((r) => r.symbol === value)
          setSelectedRune(rune)
        }}
        disabled={!provider || runes.length === 0}
      >
        <SelectTrigger
          disabled={!provider}
          className={cn(
            'w-full bg-[#232225] border-none justify-center flex flex-row gap-4 items-center disabled:text-[#737275] text-sm text-center',
            'min-w-[200px]'
          )}
        >
          <SelectValue placeholder={runes.length === 0 ? "No runes found" : "Select rune to send"} />
        </SelectTrigger>
        <SelectContent>
          {runes?.map((rune) => (
            <SelectItem key={rune.symbol} value={rune.symbol}>
              {rune.name} ({rune.balance})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        disabled={!provider || runes.length === 0}
        className={cn(
          'w-full bg-[#232225] border-none disabled:text-[#737275] text-center'
        )}
        placeholder="To Address"
        value={runeToAddress}
        onChange={(e) => setRuneToAddress(e.target.value)}
      />
      <Input
        disabled={
          !provider ||
          !selectedRune ||
          !runeToAddress
        }
        type="number"
        className={cn(
          'w-full bg-[#232225] border-none disabled:text-[#737275] text-center'
        )}
        placeholder="Amount"
        value={runeAmount}
        onChange={(e) => setRuneAmount(e.target.value)}
      />
      <Button
        disabled={
          !provider ||
          !selectedRune ||
          !runeToAddress ||
          !runeAmount
        }
        className={'w-full bg-[#232225] disabled:text-[#737275]'}
        onClick={sendRune}
      >
        Send Rune
      </Button>
    </div>
  )
}

export default RunesSection
