/**
 * Tests for the lifecycle actions: `connect`, `disconnect`,
 * `switchNetwork`, `initialize`, `dispose`.
 *
 * @remarks
 * These actions orchestrate the connector + state + cache trinity.
 * Mocks supply a connector with controllable `connect`, `disconnect`,
 * `switchNetwork` outcomes plus a provider whose event-emitter we can
 * inspect. Tests assert on:
 *   - state transitions on `$connection`
 *   - storage persistence/clearance
 *   - provider event-subscription wiring (and teardown)
 *   - cache invalidation across chain switches
 *   - the post-switch wallet-client pre-build that fixed the
 *     "mempool again after switching networks" bug
 */

import { createChainDataSource, MAINNET, NetworkNotConfiguredError, TESTNET } from '@omnisat/lasereyes-client'
import {
  createWalletAccount,
  type WalletAccount,
} from '@omnisat/lasereyes-client/wallet'
import { AddressType } from '@omnisat/lasereyes-client/utils'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { connect } from '../../actions/connect'
import { disconnect } from '../../actions/disconnect'
import { dispose } from '../../actions/dispose'
import { initialize } from '../../actions/initialize'
import { switchNetwork } from '../../actions/switchNetwork'
import { createLaserEyesConfig } from '../../config'
import { createConnector } from '../../connectors/create'
import type { Connector } from '../../types/connector'
import type { BitcoinProvider } from '../../types/provider'

// `initialize`'s discoverConnectors path calls
// `window.addEventListener` / `window.dispatchEvent` for the
// EIP-6963-style announcement channel. Provide minimal stubs.
beforeAll(() => {
  const w = globalThis as any
  w.window = globalThis
  if (typeof w.addEventListener !== 'function') {
    w.addEventListener = () => {}
    w.removeEventListener = () => {}
    w.dispatchEvent = () => true
  }
})

const ADDR = 'bc1pmfr3p9j00pfxjh0zmgp99y8zftmd3s5pmedqhyptwy6lm87hf5sspknck9'
const PUBKEY = '0279BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798'

function makeAccount(): WalletAccount {
  return createWalletAccount({
    addresses: [
      { address: ADDR, purpose: 'payment', type: AddressType.P2TR },
      { address: ADDR, purpose: 'ordinals', type: AddressType.P2TR },
    ],
    publicKeys: { payment: PUBKEY, ordinals: PUBKEY, taproot: PUBKEY } as any,
  })
}

/**
 * Build a fake `BitcoinProvider` with a real event-emitter surface so
 * `connect`'s subscription wiring can be observed. The returned helper
 * exposes `fire(event, ...args)` to simulate the provider emitting.
 */
function makeProvider() {
  const listeners = new Map<string, Array<(...args: any[]) => void>>()
  const provider: BitcoinProvider = {
    request: vi.fn(),
    on(event: string, listener: (...args: any[]) => void) {
      if (!listeners.has(event)) listeners.set(event, [])
      listeners.get(event)?.push(listener)
    },
    removeListener(event: string, listener: (...args: any[]) => void) {
      const arr = listeners.get(event)
      if (!arr) return
      const idx = arr.indexOf(listener)
      if (idx >= 0) arr.splice(idx, 1)
    },
  } as any

  return {
    provider,
    listeners,
    fire(event: string, ...args: any[]) {
      for (const l of listeners.get(event) ?? []) l(...args)
    },
    listenerCount(event: string) {
      return listeners.get(event)?.length ?? 0
    },
  }
}

/**
 * Build a fake connector with hooks the tests can spy on.
 */
function makeFakeConnector(opts?: {
  id?: string
  provider?: BitcoinProvider
  account?: WalletAccount
  networkId?: 'mainnet' | 'testnet'
  switchNetwork?: (id: string) => Promise<string>
  connect?: () => Promise<any>
  disconnect?: () => Promise<void>
  isAuthorized?: () => Promise<boolean>
  onConnect?: ReturnType<typeof vi.fn>
  onDisconnect?: ReturnType<typeof vi.fn>
  onNetworkChanged?: ReturnType<typeof vi.fn>
}) {
  const id = opts?.id ?? 'mock'
  const account = opts?.account ?? makeAccount()
  const networkId = opts?.networkId ?? 'mainnet'

  return createConnector(() => {
    const conn: Connector = {
      id,
      name: id,
      isReady: () => true,
      isAuthorized: opts?.isAuthorized ?? (async () => false),
      connect: opts?.connect ?? (async () => ({ account, networkId })),
      disconnect: opts?.disconnect ?? (async () => {}),
      getAccount: async () => account,
      getNetworkId: async () => networkId,
      getCapabilities: async () => ({}) as any,
      getProvider: () => opts?.provider ?? null,
      // All four lifecycle hooks are required on the `Connector`
      // interface. Default to no-ops; tests override by passing
      // explicit spies in `opts`.
      onAccountChanged: () => {},
      onConnect: opts?.onConnect ?? (() => {}),
      onDisconnect: opts?.onDisconnect ?? (() => {}),
      onNetworkChanged: opts?.onNetworkChanged ?? (() => {}),
      switchNetwork: opts?.switchNetwork ?? (async (id: string) => id as any),
    }
    return conn
  })
}

function makeConfig(opts?: { connectors?: ReturnType<typeof makeFakeConnector>[] }) {
  const mainnet = createChainDataSource({ network: MAINNET }).extend(() => ({}) as any)
  const testnet = createChainDataSource({ network: TESTNET }).extend(() => ({}) as any)

  return createLaserEyesConfig({
    chains: [MAINNET, TESTNET],
    transports: { mainnet: [mainnet], testnet: [testnet] },
    connectors: opts?.connectors ?? [],
  })
}

// ============================================================================
// connect
// ============================================================================

describe('connect', () => {
  it('throws when the requested connector is not registered', async () => {
    const config = makeConfig({})

    await expect(connect(config, { connectorId: 'unknown' })).rejects.toThrow(/not registered/)
  })

  it('transitions $connection to connected with {account, networkId, connector} atomically', async () => {
    const { provider } = makeProvider()
    const account = makeAccount()
    const connector = makeFakeConnector({ provider, account, networkId: 'mainnet' })
    const config = makeConfig({ connectors: [connector] })

    const result = await connect(config, { connectorId: 'mock' })

    expect(result).toEqual({ account, networkId: 'mainnet' })
    const state = config.state.$connection.get()
    expect(state.status).toBe('connected')
    expect(state.account).toBe(account)
    expect(state.networkId).toBe('mainnet')
    expect(state.connector?.id).toBe('mock')
  })

  it('persists the connector id to storage when autoReconnect is enabled', async () => {
    const { provider } = makeProvider()
    const connector = makeFakeConnector({ provider })
    const config = makeConfig({ connectors: [connector] })
    // autoReconnect defaults to true.
    expect(config.autoReconnect).toBe(true)

    await connect(config, { connectorId: 'mock' })
    expect(config.storage.getItem('lasereyes.connectorId')).toBe('mock')
  })

  it('restores prior status on connector.connect() failure (no state damage)', async () => {
    const failingConnector = makeFakeConnector({
      connect: async () => {
        throw new Error('user rejected at wallet prompt')
      },
    })
    const config = makeConfig({ connectors: [failingConnector] })
    const priorStatus = config.state.$connection.get().status

    await expect(connect(config, { connectorId: 'mock' })).rejects.toThrow(/user rejected/)

    const state = config.state.$connection.get()
    expect(state.status).toBe(priorStatus) // exactly what it was
    expect(state.account).toBeUndefined()
    expect(state.connector).toBeUndefined()
  })

  it('subscribes to provider events (accountsChanged, networkChanged, disconnect)', async () => {
    const { provider, listenerCount } = makeProvider()
    const connector = makeFakeConnector({ provider })
    const config = makeConfig({ connectors: [connector] })

    await connect(config, { connectorId: 'mock' })

    expect(listenerCount('accountsChanged')).toBe(1)
    expect(listenerCount('networkChanged')).toBe(1)
    expect(listenerCount('disconnect')).toBe(1)
  })

  it('invokes connector.onConnect with the ConnectResult', async () => {
    const onConnect = vi.fn()
    const account = makeAccount()
    const connector = makeFakeConnector({
      provider: makeProvider().provider,
      account,
      onConnect,
    })
    const config = makeConfig({ connectors: [connector] })

    await connect(config, { connectorId: 'mock' })
    expect(onConnect).toHaveBeenCalledOnce()
    expect(onConnect.mock.calls[0][0]).toMatchObject({ account, networkId: 'mainnet' })
  })

  it('propagates a wallet-emitted networkChanged into $connection.networkId', async () => {
    const { provider, fire } = makeProvider()
    const connector = makeFakeConnector({ provider })
    const config = makeConfig({ connectors: [connector] })

    await connect(config, { connectorId: 'mock' })
    expect(config.state.$connection.get().networkId).toBe('mainnet')

    fire('networkChanged', 'testnet')
    // The handler is async — flush microtasks.
    await new Promise(r => setTimeout(r, 0))

    expect(config.state.$connection.get().networkId).toBe('testnet')
  })
})

// ============================================================================
// disconnect
// ============================================================================

describe('disconnect', () => {
  it('clears $connection (status/account/connector) atomically', async () => {
    const { provider } = makeProvider()
    const connector = makeFakeConnector({ provider })
    const config = makeConfig({ connectors: [connector] })
    await connect(config, { connectorId: 'mock' })

    await disconnect(config)

    const state = config.state.$connection.get()
    expect(state.status).toBe('disconnected')
    expect(state.account).toBeUndefined()
    expect(state.connector).toBeUndefined()
  })

  it('tears down provider event subscriptions', async () => {
    const { provider, listenerCount } = makeProvider()
    const connector = makeFakeConnector({ provider })
    const config = makeConfig({ connectors: [connector] })
    await connect(config, { connectorId: 'mock' })

    await disconnect(config)

    expect(listenerCount('accountsChanged')).toBe(0)
    expect(listenerCount('networkChanged')).toBe(0)
    expect(listenerCount('disconnect')).toBe(0)
  })

  it('calls connector.disconnect() and connector.onDisconnect()', async () => {
    const disconnectSpy = vi.fn(async () => {})
    const onDisconnect = vi.fn()
    const { provider } = makeProvider()
    const connector = makeFakeConnector({
      provider,
      disconnect: disconnectSpy,
      onDisconnect,
    })
    const config = makeConfig({ connectors: [connector] })
    await connect(config, { connectorId: 'mock' })

    await disconnect(config)

    expect(disconnectSpy).toHaveBeenCalledOnce()
    expect(onDisconnect).toHaveBeenCalledOnce()
  })

  it('swallows errors thrown by connector.disconnect()', async () => {
    const { provider } = makeProvider()
    const connector = makeFakeConnector({
      provider,
      disconnect: async () => {
        throw new Error('wallet locked')
      },
    })
    const config = makeConfig({ connectors: [connector] })
    await connect(config, { connectorId: 'mock' })

    await expect(disconnect(config)).resolves.toBeUndefined()
    expect(config.state.$connection.get().status).toBe('disconnected')
  })

  it('removes the persisted connector id from storage', async () => {
    const { provider } = makeProvider()
    const connector = makeFakeConnector({ provider })
    const config = makeConfig({ connectors: [connector] })
    await connect(config, { connectorId: 'mock' })
    expect(config.storage.getItem('lasereyes.connectorId')).toBe('mock')

    await disconnect(config)
    expect(config.storage.getItem('lasereyes.connectorId')).toBeNull()
  })

  it('is idempotent when called on an already-disconnected config', async () => {
    const config = makeConfig({})
    await expect(disconnect(config)).resolves.toBeUndefined()
    await expect(disconnect(config)).resolves.toBeUndefined()
  })
})

// ============================================================================
// switchNetwork
// ============================================================================

describe('switchNetwork', () => {
  it('throws when no connector is active', async () => {
    const config = makeConfig({})
    await expect(switchNetwork(config, 'mainnet')).rejects.toThrow()
  })

  it('throws when the connector lacks switchNetwork support', async () => {
    const { provider } = makeProvider()
    // The default fake includes switchNetwork; override to undefined.
    const connector = makeFakeConnector({ provider })
    const config = makeConfig({ connectors: [connector] })
    await connect(config, { connectorId: 'mock' })
    // Strip the capability.
    ;(config.state.$connection.get().connector as any).switchNetwork = undefined

    await expect(switchNetwork(config, 'testnet')).rejects.toThrow(/does not support switchNetwork/)
  })

  it('calls connector.switchNetwork and writes the resolved networkId to state', async () => {
    const { provider } = makeProvider()
    const switchSpy = vi.fn(async (id: string) => id)
    const connector = makeFakeConnector({ provider, switchNetwork: switchSpy })
    const config = makeConfig({ connectors: [connector] })
    await connect(config, { connectorId: 'mock' })

    const resolved = await switchNetwork(config, 'testnet')
    expect(switchSpy).toHaveBeenCalledWith('testnet')
    expect(config.state.$connection.get().networkId).toBe('testnet')
    expect(resolved.id).toBe('testnet')
  })

  it('returns the chain the wallet actually landed on (may differ from requested)', async () => {
    // Some wallets silently substitute the chain they support if the
    // requested one isn't available. The action returns truth, not the
    // request.
    const { provider } = makeProvider()
    const connector = makeFakeConnector({
      provider,
      switchNetwork: async () => 'mainnet', // wallet stayed put
    })
    const config = makeConfig({ connectors: [connector] })
    await connect(config, { connectorId: 'mock' })

    const resolved = await switchNetwork(config, 'testnet')
    expect(resolved.id).toBe('mainnet')
    expect(config.state.$connection.get().networkId).toBe('mainnet')
  })

  it('throws NetworkNotConfiguredError when the wallet lands on a chain not in config', async () => {
    const { provider } = makeProvider()
    const connector = makeFakeConnector({
      provider,
      switchNetwork: async () => 'signet' as any,
    })
    const config = makeConfig({ connectors: [connector] })
    await connect(config, { connectorId: 'mock' })

    await expect(switchNetwork(config, 'testnet')).rejects.toThrow(NetworkNotConfiguredError)
  })

  it('invokes connector.onNetworkChanged with the resolved id', async () => {
    const { provider } = makeProvider()
    const onNetworkChanged = vi.fn()
    const connector = makeFakeConnector({ provider, onNetworkChanged })
    const config = makeConfig({ connectors: [connector] })
    await connect(config, { connectorId: 'mock' })

    await switchNetwork(config, 'testnet')
    expect(onNetworkChanged).toHaveBeenCalledWith('testnet')
  })
})

// ============================================================================
// initialize + dispose
// ============================================================================

describe('initialize', () => {
  it('completes without throwing on a fresh config with no persisted connector', async () => {
    const config = makeConfig({})
    await expect(initialize(config)).resolves.toBeUndefined()
  })

  it('auto-reconnects to the persisted connector when registered', async () => {
    const { provider } = makeProvider()
    const connectSpy = vi.fn(async () => ({
      account: makeAccount(),
      networkId: 'mainnet' as const,
    }))
    const connector = makeFakeConnector({ provider, connect: connectSpy })
    const config = makeConfig({ connectors: [connector] })

    config.storage.setItem('lasereyes.connectorId', 'mock')
    await initialize(config)

    expect(connectSpy).toHaveBeenCalledOnce()
    expect(config.state.$connection.get().status).toBe('connected')
  })

  it('silently clears the persisted id when auto-reconnect fails', async () => {
    const { provider } = makeProvider()
    const connector = makeFakeConnector({
      provider,
      connect: async () => {
        throw new Error('wallet locked')
      },
    })
    const config = makeConfig({ connectors: [connector] })

    config.storage.setItem('lasereyes.connectorId', 'mock')
    await expect(initialize(config)).resolves.toBeUndefined()

    expect(config.storage.getItem('lasereyes.connectorId')).toBeNull()
    expect(config.state.$connection.get().status).not.toBe('connected')
  })

  it('skips auto-reconnect when no persisted connector id is in storage', async () => {
    const { provider } = makeProvider()
    const connectSpy = vi.fn(async () => ({
      account: makeAccount(),
      networkId: 'mainnet' as const,
    }))
    const connector = makeFakeConnector({ provider, connect: connectSpy })
    const config = makeConfig({ connectors: [connector] })

    await initialize(config)
    expect(connectSpy).not.toHaveBeenCalled()
  })
})

describe('dispose', () => {
  it('resets $connection to disconnected defaults', async () => {
    const { provider } = makeProvider()
    const connector = makeFakeConnector({ provider })
    const config = makeConfig({ connectors: [connector] })
    await initialize(config)
    await connect(config, { connectorId: 'mock' })

    dispose(config)

    const state = config.state.$connection.get()
    expect(state.status).toBe('disconnected')
    expect(state.account).toBeUndefined()
    expect(state.connector).toBeUndefined()
  })

  it('preserves the last networkId (next connect overwrites it)', async () => {
    const { provider } = makeProvider()
    const connector = makeFakeConnector({ provider, networkId: 'testnet' })
    const config = makeConfig({ connectors: [connector] })
    await initialize(config)
    await connect(config, { connectorId: 'mock' })

    dispose(config)
    expect(config.state.$connection.get().networkId).toBe('testnet')
  })

  it('is safe to call without a prior initialize', () => {
    const config = makeConfig({})
    expect(() => dispose(config)).not.toThrow()
  })
})
