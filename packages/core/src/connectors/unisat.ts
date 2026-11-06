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
import { injected } from './injected'

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
    getProvider: w => {
      const raw = (w as { unisat?: unknown }).unisat
      return raw ? new UnisatAdapter(raw) : null
    },
    // Unisat exposes `sendBitcoin` and `getBalance` natively. Route both
    // through the wallet's one-shot RPCs instead of the composed paths.
    nativeRpc: { sendBtc: true, getAddressBalance: true },
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
    getProvider: w => {
      const raw = (w as { binancew3w?: { bitcoin?: unknown } }).binancew3w?.bitcoin
      return raw ? new UnisatAdapter(raw) : null
    },
    nativeRpc: { sendBtc: true, getAddressBalance: true },
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
    getProvider: w => {
      const raw = (w as { wizz?: unknown }).wizz
      return raw ? new UnisatAdapter(raw) : null
    },
    nativeRpc: { sendBtc: true, getAddressBalance: true },
  })
}

/**
 * Build a Unisat-style connector for any wallet that mirrors Unisat's
 * raw window API. Pass an `extract` function that returns the raw
 * wallet object off `window`; the helper wraps it in {@link UnisatAdapter}.
 */
export function unisatLike(target: {
  id: string
  name: string
  icon?: string
  rdns?: string
  extract: (window: Window & typeof globalThis) => unknown | null | undefined
  nativeRpc?: Parameters<typeof injected>[0]['nativeRpc']
}): CreateConnectorFn {
  return injected({
    id: target.id,
    name: target.name,
    icon: target.icon,
    rdns: target.rdns,
    getProvider: w => {
      const raw = target.extract(w)
      return raw ? new UnisatAdapter(raw) : null
    },
    nativeRpc: target.nativeRpc,
  })
}
