
export type MaestroBrc20ByAddressResponse = {
  data: {
    [key: string]: {
      total: string
      available: string
    }
  }
  last_updated: {
    block_hash: string
    block_height: number
  }
}


export type MaestroGetAddressBalanceResponse = {
  data: string
  last_updated: {
    block_hash: string
    block_height: number
  }
}

export type MaestroGetAddressInscriptions = {
  data: Array<{
    inscription_id: string
    satoshis: string
    utxo_sat_offset: number
    utxo_txid: string
    utxo_vout: number
    utxo_block_height: number
    utxo_confirmations: number
  }>
  last_updated: {
    block_hash: string
    block_height: number
  }
  next_cursor: string
}

