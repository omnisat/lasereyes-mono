import type React from 'react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import useSWR from 'swr'
import type { MempoolUtxo } from '@kevinoyl/lasereyes'
import { useLaserEyes } from '@kevinoyl/lasereyes'

type UtxoContextType = {
  utxos: MempoolUtxo[]
  loading: boolean
  fetchUtxos: () => void
}

const UtxoContext = createContext<UtxoContextType | undefined>(undefined)

export const UtxoProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const { paymentAddress, network, getUtxos, connected } = useLaserEyes(
    ({ paymentAddress, network, getUtxos, connected }) => ({
      paymentAddress,
      network,
      getUtxos,
      connected,
    })
  )

  const [utxos, setUtxos] = useState<MempoolUtxo[]>([])

  const fetcher = useCallback(async () => {
    if (!connected) {
      return []
    }
    try {
      const response = await getUtxos(paymentAddress)
      return response
    } catch (e) {
      console.error('Error fetching UTXOs:', e)
      return []
    }
  }, [connected, getUtxos, paymentAddress])

  const { data: utxosData, error } = useSWR<MempoolUtxo[]>(
    connected && paymentAddress && network,
    fetcher
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: need to reset utxos when network changes
  useEffect(() => {
    setUtxos([])
  }, [network, paymentAddress])

  useEffect(() => {
    if (utxosData) {
      setUtxos(utxosData)
    }
  }, [utxosData])

  useEffect(() => {
    if (error) {
      console.error('Error fetching UTXOs:', error)
    }
  }, [error])

  const fetchUtxos = useCallback(() => {
    fetcher()
  }, [fetcher])

  return (
    <UtxoContext.Provider
      value={{ utxos, loading: !utxos && !error, fetchUtxos }}
    >
      {children}
    </UtxoContext.Provider>
  )
}

export const useUtxos = () => {
  const context = useContext(UtxoContext)
  if (!context) {
    throw new Error('useUtxos must be used within a UtxoProvider')
  }
  return context
}
