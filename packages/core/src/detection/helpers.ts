/**
 * Helper utilities for wallet detection.
 *
 * @module detection/helpers
 */

import { loadUnisatWalletAdapter } from '../adapters/unisat'
import { loadXverseWalletAdapter } from '../adapters/xverse'

/**
 * Convenience function to load all built-in wallet adapters.
 *
 * @remarks
 * Call this before initializing core if you want to support all wallets.
 * Each loader checks if wallet exists and announces if found.
 *
 * This function imports all built-in adapters, which may increase bundle size.
 * For production apps with tree-shaking, consider importing only the adapters
 * you need explicitly.
 *
 * @example
 * ```ts
 * import { createLaserEyesCore, loadAllWallets } from '@omnisat/lasereyes-core'
 *
 * const core = createLaserEyesCore()
 *
 * // Load all built-in wallets (optional convenience)
 * loadAllWallets()
 *
 * await core.initialize()
 * ```
 *
 * @example
 * ```ts
 * // Alternative: Load only specific wallets for smaller bundle
 * import { createLaserEyesCore } from '@omnisat/lasereyes-core'
 * import { loadUnisatWalletAdapter } from '@omnisat/lasereyes-core/adapters/unisat'
 *
 * const core = createLaserEyesCore()
 * loadUnisatWalletAdapter() // Only Unisat
 * await core.initialize()
 * ```
 */
export function loadAllWallets(): void {
  loadUnisatWalletAdapter()
  loadXverseWalletAdapter()
  // Add more wallet loaders here as they are implemented
}
