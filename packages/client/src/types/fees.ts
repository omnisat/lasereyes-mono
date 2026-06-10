/** Recommended fee rates for Bitcoin transactions. */
export interface FeeEstimate {
  /** The fast (priority) fee rate in sat/vB for quick confirmation. */
  fastFee: number
  /** The minimum fee rate in sat/vB for eventual confirmation. */
  minFee: number
}
