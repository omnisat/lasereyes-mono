import { useLaserEyes } from '@omnisat/lasereyes'
import { FormattedUTXO } from '../../../packages/lasereyes-core/dist/types/utxo'
import { useEffect, useState } from 'react'

export default function UTXOViewer() {
  const [utxos, setUTXOs] = useState<FormattedUTXO[] | null>(null)
  const { client, address } = useLaserEyes()

  useEffect(() => {
    const fetchUTXO = async () => {
      const utxos = await client?.dataSourceManager.getFormattedUTXOS(address)
      if (!utxos) return
      setUTXOs(utxos)
    }
    if (!client || !address) return
    fetchUTXO()
  }, [client, address])

  return (
    <div>
      <h1>UTXO Viewer</h1>
      {address && <p>Address: {address}</p>}
      {!utxos?.length && <p>No UTXOs found</p>}
      {utxos?.map((utxo) => (
        <UTXOCard key={`${utxo.txHash}-${utxo.txOutputIndex}`} utxo={utxo} />
      ))}
    </div>
  )
}

const UTXOCard = ({ utxo }: { utxo: FormattedUTXO }) => {
  return (
    <div>
      <h2>
        {utxo.txHash}:{utxo.txOutputIndex}
      </h2>
      <p>General Info</p>
      <p>{utxo.btcValue} Sats</p>
      <p>Alkanes count</p>
      <p>{utxo.alkanes.length}</p>
      <p>Inscriptions count</p>
      <p>{utxo.inscriptions.length}</p>
      <p>Runes count</p>
      <p>{utxo.runes.length}</p>
    </div>
  )
}
