/**
 * Helper utilities for wallet detection.
 *
 * @module detection/helpers
 */

import { loadLeatherWalletAdapter } from '../adapters/leather'
import { loadOkxWalletAdapter } from '../adapters/okx'
import { loadOrangeWalletAdapter } from '../adapters/orange'
import { loadOylWalletAdapter } from '../adapters/oyl'
import { loadPhantomWalletAdapter } from '../adapters/phantom'
import {
  loadBinanceWalletAdapter,
  loadKeplrWalletAdapter,
  loadOpNetWalletAdapter,
  loadTokeoWalletAdapter,
  loadUnisatWalletAdapter,
  loadWizzWalletAdapter,
} from '../adapters/unisat'
import { loadXverseWalletAdapter } from '../adapters/xverse'

/**
 * Convenience: load every built-in wallet adapter.
 *
 * @remarks
 * Each loader checks for the wallet's injected provider and, if found,
 * announces it via the EIP-6963-style discovery channel
 * ({@link announceWallet}). Wallets not installed silently no-op.
 *
 * This pulls in every adapter — for production apps with tree-shaking,
 * import only the loaders you need.
 *
 * @example
 * ```ts
 * import { createLaserEyesConfig, initialize, loadAllWallets } from '@omnisat/lasereyes-core'
 * import { MAINNET, mempool } from '@omnisat/lasereyes-client'
 *
 * const config = createLaserEyesConfig({
 *   chains: [MAINNET],
 *   backends: { mainnet: mempool() },
 * })
 * loadAllWallets()
 * await initialize(config)
 * ```
 *
 * @example
 * ```ts
 * // Smaller bundle: load only specific wallets.
 * import { createLaserEyesConfig, initialize } from '@omnisat/lasereyes-core'
 * import { MAINNET, mempool } from '@omnisat/lasereyes-client'
 * import { loadUnisatWalletAdapter } from '@omnisat/lasereyes-core/adapters/unisat'
 *
 * const config = createLaserEyesConfig({
 *   chains: [MAINNET],
 *   backends: { mainnet: mempool() },
 * })
 * loadUnisatWalletAdapter()
 * await initialize(config)
 * ```
 */
export function loadAllWallets(): void {
  loadUnisatWalletAdapter()
  loadBinanceWalletAdapter()
  loadWizzWalletAdapter()
  loadXverseWalletAdapter()
  loadLeatherWalletAdapter()
  loadOkxWalletAdapter()
  loadOylWalletAdapter()
  loadPhantomWalletAdapter()
  loadOrangeWalletAdapter()
  loadOpNetWalletAdapter()
  loadTokeoWalletAdapter()
  loadKeplrWalletAdapter()
}
