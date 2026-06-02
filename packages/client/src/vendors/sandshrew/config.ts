/**
 * Sandshrew vendor configuration.
 *
 * @module vendors/sandshrew/config
 */

/**
 * Configuration for the sandshrew backend.
 *
 * @remarks
 * Provide an `apiKey` for the default Sandshrew endpoints, or override per
 * network via the `networks` map for custom URLs/keys.
 */
export interface SandshrewConfig {
  /** API key for default Sandshrew endpoints. */
  apiKey?: string
  /** Per-network overrides for custom URLs and keys. */
  networks?: {
    [key: string]: {
      apiUrl: string
      apiKey: string
    }
  }
}
