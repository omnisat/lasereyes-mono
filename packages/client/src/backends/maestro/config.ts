/**
 * Maestro vendor configuration.
 *
 * @module backends/maestro/config
 */

/**
 * Configuration for the maestro backend.
 *
 * @remarks
 * Maestro requires an API key. Mainnet and testnet keys are typically
 * separate; pass `testnetApiKey` if you need to use a different key for
 * testnet networks.
 */
export interface MaestroConfig {
  /** API key for mainnet (also used as fallback for testnet if `testnetApiKey` is unset). */
  apiKey: string
  /** Optional separate API key for testnet networks. */
  testnetApiKey?: string
  /** Per-network overrides for custom URLs and keys. */
  networks?: {
    [key: string]: {
      apiUrl: string
      apiKey: string
    }
  }
}
