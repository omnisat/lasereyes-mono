import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import useSWR from 'swr'
import { MempoolUtxo } from '@omnisat/lasereyes'
import { useLaserEyes } from '@omnisat/lasereyes'

type UtxoContextType = {
  utxos: MempoolUtxo[]
  loading: boolean
  fetchUtxos: () => void
}

const UtxoContext = createContext<UtxoContextType | undefined>(undefined)

export const UtxoProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const { paymentAddress, network, getUtxos } = useLaserEyes((x) => ({
    paymentAddress: x.paymentAddress,
    network: x.network,
    getUtxos: x.getUtxos,
  }))

  const [utxos, setUtxos] = useState<MempoolUtxo[]>([])

  const fetcher = useCallback(
    async () => {
      try {
        const response = await getUtxos(paymentAddress)
        return response
      } catch (e) {
        console.error('Error fetching UTXOs:', e)
        return []
      }
    },
    [getUtxos, paymentAddress]
  )

  const { data: utxosData, error } = useSWR<MempoolUtxo[]>(
    paymentAddress && network,
    fetcher
  )

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
