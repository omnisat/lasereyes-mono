/**
 * Helper utilities for wallet detection.
 *
 * @module detection/helpers
 */

import { loadLeatherWalletAdapter } from '../adapters/leather'
import { loadMagicEdenWalletAdapter } from '../adapters/magic-eden'
import { loadOkxWalletAdapter } from '../adapters/okx'
import { loadOrangeWalletAdapter } from '../adapters/orange'
import { loadOylWalletAdapter } from '../adapters/oyl'
import { loadPhantomWalletAdapter } from '../adapters/phantom'
import { loadSparrowWalletAdapter } from '../adapters/sparrow'
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
 * import { createLaserEyesCore, loadAllWallets } from '@omnisat/lasereyes-core'
 *
 * const core = createLaserEyesCore()
 * loadAllWallets()
 * await core.initialize()
 * ```
 *
 * @example
 * ```ts
 * // Smaller bundle: load only specific wallets.
 * import { createLaserEyesCore } from '@omnisat/lasereyes-core'
 * import { loadUnisatWalletAdapter } from '@omnisat/lasereyes-core/adapters/unisat'
 *
 * const core = createLaserEyesCore()
 * loadUnisatWalletAdapter()
 * await core.initialize()
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
  loadMagicEdenWalletAdapter()
  loadPhantomWalletAdapter()
  loadOrangeWalletAdapter()
  loadOpNetWalletAdapter()
  loadSparrowWalletAdapter()
  loadTokeoWalletAdapter()
  loadKeplrWalletAdapter()
}
