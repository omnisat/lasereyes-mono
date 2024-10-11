import useSWR from 'swr'
import { useCallback, useEffect, useState } from 'react'
import { IMempoolUtxo } from '@/types/btc'
import { getMempoolSpaceUrl } from '@/lib/urls'
import {
  MAINNET,
  TESTNET,
  FRACTAL_MAINNET,
  FRACTAL_TESTNET,
  SIGNET,
  TESTNET4,
} from '@omnisat/lasereyes-react'

const useUtxos = (
  address: string,
  network:
    | typeof MAINNET
    | typeof TESTNET
    | typeof TESTNET4
    | typeof SIGNET
    | typeof FRACTAL_MAINNET
    | typeof FRACTAL_TESTNET = MAINNET
) => {
  const mempoolUrl = `${getMempoolSpaceUrl(network)}/api/address/${address}/utxo`
  const [utxos, setUtxos] = useState<IMempoolUtxo[]>([])

  const fetcher = useCallback(
    async (url: string) => {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch UTXOs')
      }
      return response.json()
    },
    [address, network, mempoolUrl, utxos, setUtxos]
  )

  const { data: utxosData, error } = useSWR<IMempoolUtxo[]>(
    address && network && mempoolUrl,
    fetcher
  )

  useEffect(() => {
    setUtxos([])
  }, [network, address])

  useEffect(() => {
    if (utxosData) {
      setUtxos(utxosData)
    }
  }, [utxosData, address])

  useEffect(() => {
    if (error) {
      console.error('Error fetching UTXOs:', error)
    }
  }, [error])

  return {
    utxos: utxos || [],
    loading: !utxos && !error,
    fetch: () => {
      fetcher(mempoolUrl)
    },
  }
}

export default useUtxos
