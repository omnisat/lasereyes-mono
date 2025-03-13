
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
  data: MaestroAddressInscription[]
  last_updated: {
    block_hash: string
    block_height: number
  }
  next_cursor: string
}

export type MaestroAddressInscription = {
  inscription_id: string
  satoshis: string
  utxo_sat_offset: number
  utxo_txid: string
  utxo_vout: number
  utxo_block_height: number
  utxo_confirmations: number
}

export type MaestroInscriptionInfoResponse = {
  data: {
    collection_symbol: string
    content_body_preview: string
    content_length: string
    content_type: string
    created_at: string
    inscription_id: string
    inscription_number: string
  }
  last_updated: {
    block_hash: string
    block_height: number
  }
}


export type MaestroGetInscriptionInfoResponse = {
  data: {
    inscription_id: string
    inscription_number: any
    created_at: number
    content_type: string
    content_body_preview: any
    content_length: number
    collection_symbol: any
  }
  last_updated: {
    block_hash: string
    block_height: number
  }
}

export type MaestroGetBrc20InfoResponse = {
  data: {
    ticker: string
    ticker_hex: string
    deploy_inscription: string
    holders: number
    minted_supply: string
    terms: {
      max: string
      limit: string
      dec: number
      self_mint: boolean
    }
  }
  last_updated: {
    block_hash: string
    block_height: number
  }
}


export type MaestroGetRuneInfoResponse = {
  data: {
    id: string
    etching_cenotaph: boolean
    etching_tx: string
    etching_height: number
    name: string
    spaced_name: string
    symbol: string
    divisibility: number
    premine: string
    terms: {
      mint_txs_cap: any
      amount_per_mint: any
      start_height: any
      end_height: any
      start_offset: any
      end_offset: any
    }
    max_supply: string
    circulating_supply: string
    mints: number
    unique_holders: number
  }
  last_updated: {
    block_hash: string
    block_height: number
  }
}


export type MaestroGetTransactionInfoResponse = {
  data: {
    input_addresses: any
    output_addresses: any
    txid: string
    hash: string
    version: number
    size: number
    vsize: number
    weight: number
    locktime: number
    vin: Array<{
      script_type: string
      address: string
      value: number
      coinbase: string
      txid: string
      vout: number
      scriptSig: {
        asm: string
        hex: string
      }
      txinwitness: Array<string>
      sequence: number
    }>
    vout: Array<{
      script_type: string
      address: string
      value: number
      n: number
      scriptPubKey: {
        asm: string
        desc: string
        hex: string
        address: string
        type: string
      }
    }>
    hex: string
    blockhash: string
    blockheight: number
    blocktime: number
    confirmations: number
    time: number
    total_input_volume: number
    total_output_volume: number
    total_fees: number
  }
  last_updated: {
    block_height: number
    block_hash: string
  }
}


export type MaestroGetFeeRatesResponse = {
  data: Array<{
    block_height: number
    sats_per_vb: {
      min: number
      median: number
      max: number
    }
  }>
  indexer_info: {
    chain_tip: {
      block_hash: string
      block_height: number
    }
    mempool_timestamp: string
    estimated_blocks: Array<{
      block_height: number
      sats_per_vb: {
        min: number
        median: number
        max: number
      }
    }>
  }
}
