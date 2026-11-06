import { useNetwork } from '@omnisat/lasereyes-react'
import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

export default function NetworkSwitcher() {
  const { network, chains, switchNetwork } = useNetwork()
  const [error, setError] = useState<string | null>(null)

  const handleSwitch = (desired: string) => {
    setError(null)
    void switchNetwork(desired).catch(err => {
      if (err instanceof Error) setError(err.message)
      else setError('Failed to switch network')
    })
  }

  return (
    <div className="flex flex-col items-end">
      <Select onValueChange={handleSwitch} value={network}>
        <SelectTrigger>
          <SelectValue placeholder="Select a network" />
        </SelectTrigger>
        <SelectContent>
          {chains.map(chain => (
            <SelectItem key={chain.id} value={chain.id} className="h-8">
              {chain.id}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <span className="text-red-500 text-xs mt-1 text-right max-w-xs">{error}</span>
      )}
    </div>
  )
}
