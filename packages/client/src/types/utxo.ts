export interface UTXO {
  txid: string
  vout: number
  status: {
    confirmed: boolean
    block_height: number
    block_hash: string
    block_time: number
  }
  value: number
}

export interface FormattedUTXO {
  txHash: string
  txOutputIndex: number
  btcValue: number
  scriptPubKey: string
  address: string
  confirmations?: number
  hasRunes: boolean
  runes: FormattedRune[]
  hasAlkanes: boolean
  alkanes: FormattedAlkane[]
  hasInscriptions: boolean
  inscriptions: FormattedInscription[]
}

export interface FormattedRune {
  runeId: string
  amount: number
}

export interface FormattedAlkane {
  id: string
  amount: number
  name: string
  symbol: string
}

export interface FormattedInscription {
  inscriptionId: string
}
