import { LaserEyesClient } from './client'
import { createConfig, createStores } from './client/utils'

export { LaserEyesClient, createStores, createConfig }
export * from './client/modules'
export * from './client/providers'
export * from './client/types'
export * from './constants'
export * from './lib/data-sources/manager'
export * from './types'

// Resolve re-export ambiguity: network constants (strings) take precedence over
// the Network object exports in types/network (same names, different shapes).
export {
  FRACTAL_MAINNET,
  FRACTAL_TESTNET,
  MAINNET,
  OYLNET,
  REGTEST,
  SIGNET,
  TESTNET,
  TESTNET4,
} from './constants'
// Resolve re-export ambiguity: prefer legacy client SignMessageOptions (toSignAddress) so that
// existing wallet providers continue to compile. The new provider type is accessed via
// direct import from './types/provider' internally.
export type { SignMessageOptions } from './client/types'

// Core state manager (new architecture)
export { createLaserEyesCore, LaserEyesCore } from './core'
export type { LaserEyesCoreConfig, NetworkConfig } from './core'

// Actions (new architecture)
export * from './actions'

// Detection helpers
export { loadAllWallets } from './detection/helpers'

// Connectors
export * from './connectors'

// Adapters (for advanced usage)
export * from './adapters'

// Detection
export * from './detection'
