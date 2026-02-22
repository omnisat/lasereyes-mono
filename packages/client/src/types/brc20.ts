/** A BRC-20 token balance held by an address. */
export interface Brc20Balance {
  /** The BRC-20 token ticker symbol. */
  ticker: string
  /** The overall balance (transferable + available) as a decimal string. */
  overall: string
  /** The balance currently in transferable inscriptions as a decimal string. */
  transferable: string
  /** The available (non-transferable) balance as a decimal string. */
  available: string
}

/**
 * Detailed metadata about a BRC-20 token.
 */
export interface Brc20Info {
  /** The token data fields. */
  data: {
    /** The BRC-20 token ticker symbol. */
    ticker: string
    /** Hex-encoded representation of the ticker. */
    ticker_hex: string
    /** The inscription ID of the deploy inscription that created this token. */
    deploy_inscription: string
    /** Total number of unique addresses holding this token. */
    holders: number
    /** The total minted supply as a decimal string. */
    minted_supply: string
    /** The token's deployment terms. */
    terms: {
      /** Maximum total supply as a decimal string. */
      max: string
      /** Maximum amount per mint as a decimal string. */
      limit: string
      /** Number of decimal places for the token. */
      dec: number
      /** Whether the token allows self-minting by the deployer. */
      self_mint: boolean
    }
  }
  /** Information about when this data was last indexed. */
  last_updated: {
    /** The block hash at the time of last indexing. */
    block_hash: string
    /** The block height at the time of last indexing. */
    block_height: number
  }
}
