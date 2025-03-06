
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
