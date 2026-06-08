import {
  type ChainBackendFactory,
  createLaserEyesConfig,
  type LaserEyesConfig,
  MAINNET,
  type WalletAccount,
} from '@omnisat/lasereyes-core'
import type { ReactNode } from 'react'
import { LaserEyesProvider } from './providers/lasereyes-provider'

/** Backend factory stub — never used (tests mock the query layer or don't fetch). */
const stubBackend = (() => ({})) as unknown as ChainBackendFactory

/** The payment address used by {@link connectAccount}. */
export const PAYMENT = 'bc1qpaymentaddress'

/** A minimal mainnet config (auto-reconnect off so initialize is inert in tests). */
export function makeConfig(): LaserEyesConfig {
  return createLaserEyesConfig({
    chains: [MAINNET],
    backends: { mainnet: stubBackend },
    autoReconnect: false,
  })
}

/**
 * Force the config into a connected state. The public `$connection` is read-only
 * by type; the runtime store is a writable MapStore, so we cast to set it (the
 * same move the core action layer makes internally).
 */
export function connectAccount(config: LaserEyesConfig, address = PAYMENT): void {
  const account = {
    addresses: [{ address, purpose: 'payment', type: 3 }],
    publicKeys: { payment: `02${'0'.repeat(64)}` },
    getAddress: () => address,
    getPublicKey: () => `02${'0'.repeat(64)}`,
  } as unknown as WalletAccount
  ;(config.state.$connection as unknown as { set: (v: unknown) => void }).set({
    status: 'connected',
    account,
    networkId: 'mainnet',
    connector: { id: 'unisat', name: 'Unisat' },
  })
}

/** A `renderHook` wrapper that mounts the provider with `config`. */
export function wrapper(config: LaserEyesConfig) {
  return ({ children }: { children: ReactNode }) => (
    <LaserEyesProvider config={config}>{children}</LaserEyesProvider>
  )
}
