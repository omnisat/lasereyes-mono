export interface AlkaneToken {
  id: {
    block: string
    tx: string
  }
  data: string
  name: string
  symbol: string
  totalSupply: number
  cap: number
  minted: number
  mintActive: boolean
  percentageMinted: number
  mintAmount: number
}

export interface AlkaneSimulateRequest {
  alkanes: any[]
  transaction: string
  block: string
  height: string
  txindex: number
  target: {
    block: string
    tx: string
  }
  inputs: string[]
  pointer: number
  refundPointer: number
  vout: number
}