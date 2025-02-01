import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import useSWR from 'swr'
import { IMempoolUtxo } from '@/types/btc'
import { getMempoolSpaceUrl } from '@/lib/urls'
import { useLaserEyes, NetworkType } from '@omnisat/lasereyes'

type UtxoContextType = {
  utxos: IMempoolUtxo[]
  loading: boolean
  fetchUtxos: () => void
}

const UtxoContext = createContext<UtxoContextType | undefined>(undefined)

export const UtxoProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const { paymentAddress, network } = useLaserEyes((x) => ({
    paymentAddress: x.paymentAddress,
    network: x.network,
  }))
  const mempoolUrl = `${getMempoolSpaceUrl(network)}/api/address/${paymentAddress}/utxo`
  const [utxos, setUtxos] = useState<IMempoolUtxo[]>([])

  const fetcher = useCallback(async (url: string) => {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch UTXOs')
      }
      return response.json()
    } catch (e) {}
  }, [])

  const { data: utxosData, error } = useSWR<IMempoolUtxo[]>(
    paymentAddress && network && mempoolUrl,
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
    fetcher(mempoolUrl)
  }, [fetcher, mempoolUrl])

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
