/**
 * Unisat (and Unisat-compatible) connectors.
 *
 * @remarks
 * Unisat, Binance, and Wizz expose the same window-injected API. They
 * all share {@link UnisatAdapter} and differ only in detection key.
 *
 * @module connectors/unisat
 */

import { UNISAT_ICON, UnisatAdapter } from '../adapters/unisat'
import type { CreateConnectorFn } from '../types/connector'
import { type InjectedConnectorTarget, injected } from './injected'

/**
 * Unisat connector factory.
 *
 * @example
 * ```ts
 * import { unisat } from '@omnisat/lasereyes-core'
 * createLaserEyesConfig({ connectors: [unisat()] })
 * ```
 */
export function unisat(): CreateConnectorFn {
  return injected({
    id: 'unisat',
    name: 'Unisat Wallet',
    icon: UNISAT_ICON,
    rdns: 'io.unisat.wallet',
    getProvider: w => (w as { unisat?: unknown }).unisat,
    adapter: UnisatAdapter,
    // Unisat exposes `sendBitcoin` and `getBalance` natively. Route both
    // through the wallet's one-shot RPCs instead of the composed paths.
    nativeRpc: { sendBtc: true, getBalance: true },
  })
}

/**
 * Binance Web3 Wallet connector — uses the Unisat-compatible API surface.
 */
export function binance(): CreateConnectorFn {
  return injected({
    id: 'binance',
    name: 'Binance Wallet',
    rdns: 'com.binance.wallet',
    getProvider: w => (w as { binancew3w?: { bitcoin?: unknown } }).binancew3w?.bitcoin,
    adapter: UnisatAdapter,
    nativeRpc: { sendBtc: true, getBalance: true },
  })
}

/**
 * Wizz Wallet connector — Unisat-compatible.
 */
export function wizz(): CreateConnectorFn {
  return injected({
    id: 'wizz',
    name: 'Wizz Wallet',
    rdns: 'com.wizz.wallet',
    getProvider: w => (w as { wizz?: unknown }).wizz,
    adapter: UnisatAdapter,
    nativeRpc: { sendBtc: true, getBalance: true },
  })
}

/**
 * Build a Unisat-style connector for any wallet that mirrors Unisat's API.
 *
 * @param target - Override identification, detection, or icon.
 */
export function unisatLike(target: Omit<InjectedConnectorTarget, 'adapter'>): CreateConnectorFn {
  return injected({ ...target, adapter: UnisatAdapter })
}
