export interface Brc20Balance {
  ticker: string
  overall: string
  transferable: string
  available: string
}

export interface Brc20Info {
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
