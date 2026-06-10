/**
 * Tests for `core/query` — the `@nanostores/query` caching layer over the
 * Phase 9 actions.
 *
 * @remarks
 * The action layer itself is mocked (its own seam is covered by
 * `actions/*.test.ts`). These tests pin the **query layer's contract**:
 *
 * - a read store (`getXxxQuery`) fetches through its action and caches/dedupes;
 * - a write mutation (`xxxMutation`) calls its action, returns the result,
 *   and **revalidates only the touched addresses' reads** — so a subscribed
 *   read store refetches after a send, but an unrelated address does not;
 * - `signMessage` (no chain effect) revalidates nothing;
 * - `signPsbt` revalidates only when the result was broadcast (`txId` present).
 *
 * Revalidate (not invalidate) means the read store keeps its prior `data` while
 * the background refetch runs — asserted via call-count, not a loading flash.
 */

import {
  type ChainNetwork,
  createChainBackend,
  MAINNET,
  type NetworkId,
} from '@omnisat/lasereyes-client'
import type { WalletAccount } from '@omnisat/lasereyes-client/wallet'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../actions', () => ({
  getAddressBalance: vi.fn(),
  getAddressUtxos: vi.fn(),
  getRecommendedFees: vi.fn(),
  getTransaction: vi.fn(),
  sendBtc: vi.fn(),
  signPsbt: vi.fn(),
  signMessage: vi.fn(),
  broadcastPsbt: vi.fn(),
  broadcastTransaction: vi.fn(),
}))

import * as actions from '../actions'
import { createLaserEyesConfig } from '../config'
import { getAddressBalanceQuery } from '../query/balance'
import { broadcastPsbtMutation } from '../query/broadcast-psbt'
import { broadcastTransactionMutation } from '../query/broadcast-transaction'
import { createQueryContext } from '../query/context'
import { sendBtcMutation } from '../query/send-btc'
import { signMessageMutation } from '../query/sign-message'
import { signPsbtMutation } from '../query/sign-psbt'
import { getTransactionQuery } from '../query/transaction'
import { mutateConnection } from '../state'

const PAYMENT = 'bc1qpaymentaddress'
const OTHER = 'bc1qsomeotheraddress'

function makeConnectedConfig() {
  const backend = (network: NetworkId | ChainNetwork) => createChainBackend({ network })
  const config = createLaserEyesConfig({
    chains: [MAINNET],
    backends: { mainnet: backend },
  })

  const account = {
    addresses: [{ address: PAYMENT, purpose: 'payment', type: 3 }],
    publicKeys: { payment: `02${'0'.repeat(64)}` },
    getAddress: () => PAYMENT,
    getPublicKey: () => `02${'0'.repeat(64)}`,
  } as unknown as WalletAccount

  mutateConnection(config.state, {
    status: 'connected',
    account,
    networkId: 'mainnet',
    connector: {} as never,
  })

  return config
}

/** Mount a store (triggers the lazy fetch) and return the unsubscribe fn. */
function mount(store: { subscribe: (cb: () => void) => () => void }) {
  return store.subscribe(() => {})
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(actions.getAddressBalance).mockResolvedValue('1000')
  vi.mocked(actions.getTransaction).mockResolvedValue({ txId: 'tx-1' } as never)
  vi.mocked(actions.sendBtc).mockResolvedValue('txid-abc')
  vi.mocked(actions.signMessage).mockResolvedValue('signature')
  vi.mocked(actions.broadcastPsbt).mockResolvedValue('txid-psbt')
  vi.mocked(actions.broadcastTransaction).mockResolvedValue('txid-raw')
})

describe('getAddressBalanceQuery (read)', () => {
  it('fetches through getAddressBalance and exposes the result', async () => {
    const config = makeConnectedConfig()
    const ctx = createQueryContext({ dedupeTime: 0, cache: new Map() })
    const $balance = getAddressBalanceQuery(config, PAYMENT, ctx)
    const unsub = mount($balance)

    await vi.waitFor(() => expect($balance.get().data).toBe('1000'))
    expect(actions.getAddressBalance).toHaveBeenCalledWith(config, PAYMENT)
    unsub()
  })

  it('stays idle (no fetch) for an empty address', async () => {
    const config = makeConnectedConfig()
    const ctx = createQueryContext({ dedupeTime: 0, cache: new Map() })
    const $balance = getAddressBalanceQuery(config, '', ctx)
    const unsub = mount($balance)

    await new Promise(r => setTimeout(r, 10))
    expect(actions.getAddressBalance).not.toHaveBeenCalled()
    unsub()
  })
})

describe('getAddressBalanceQuery — per-call options (chainId / enabled)', () => {
  it('chainId override forwards { chainId } and caches under its own key', async () => {
    const config = makeConnectedConfig() // active chain: mainnet
    const ctx = createQueryContext({ dedupeTime: 0, cache: new Map() })

    // Same address, two chains → two distinct cache slots, two fetches.
    const $active = getAddressBalanceQuery(config, PAYMENT, ctx)
    const $t4 = getAddressBalanceQuery(config, PAYMENT, ctx, { chainId: 'testnet4' })
    const u1 = mount($active)
    const u2 = mount($t4)

    await vi.waitFor(() => expect(actions.getAddressBalance).toHaveBeenCalledTimes(2))
    expect(actions.getAddressBalance).toHaveBeenCalledWith(config, PAYMENT) // active chain
    expect(actions.getAddressBalance).toHaveBeenCalledWith(config, PAYMENT, {
      chainId: 'testnet4',
    })
    u1()
    u2()
  })

  it('enabled: false keeps the store idle (no fetch)', async () => {
    const config = makeConnectedConfig()
    const ctx = createQueryContext({ dedupeTime: 0, cache: new Map() })
    const $balance = getAddressBalanceQuery(config, PAYMENT, ctx, { enabled: false })
    const unsub = mount($balance)

    await new Promise(r => setTimeout(r, 10))
    expect(actions.getAddressBalance).not.toHaveBeenCalled()
    unsub()
  })
})

describe('sendBtcMutation (write)', () => {
  it('calls sendBtc and returns the txid', async () => {
    const config = makeConnectedConfig()
    const ctx = createQueryContext({ dedupeTime: 0, cache: new Map() })
    const $send = sendBtcMutation(config, ctx)

    const txId = await $send.mutate({ to: OTHER, amount: 10_000 })

    expect(txId).toBe('txid-abc')
    expect(actions.sendBtc).toHaveBeenCalledWith(config, OTHER, 10_000, undefined)
  })

  it('revalidates the payment address read after a send', async () => {
    const config = makeConnectedConfig()
    const ctx = createQueryContext({ dedupeTime: 0, cache: new Map() })

    // Mount the payment-address balance — one fetch.
    const $balance = getAddressBalanceQuery(config, PAYMENT, ctx)
    const unsub = mount($balance)
    await vi.waitFor(() => expect(actions.getAddressBalance).toHaveBeenCalledTimes(1))

    // Send revalidates the payment address → background refetch.
    const $send = sendBtcMutation(config, ctx)
    await $send.mutate({ to: OTHER, amount: 10_000 })

    await vi.waitFor(() => expect(actions.getAddressBalance).toHaveBeenCalledTimes(2))
    unsub()
  })

  it('does NOT revalidate an unrelated address', async () => {
    const config = makeConnectedConfig()
    const ctx = createQueryContext({ dedupeTime: 0, cache: new Map() })

    // Mount a balance for an address neither spent nor paid.
    const $balance = getAddressBalanceQuery(config, 'bc1quninvolved', ctx)
    const unsub = mount($balance)
    await vi.waitFor(() => expect(actions.getAddressBalance).toHaveBeenCalledTimes(1))

    const $send = sendBtcMutation(config, ctx)
    await $send.mutate({ to: OTHER, amount: 10_000 })

    await new Promise(r => setTimeout(r, 10))
    expect(actions.getAddressBalance).toHaveBeenCalledTimes(1)
    unsub()
  })
})

describe('signMessageMutation (write, no chain effect)', () => {
  it('returns the signature and revalidates nothing', async () => {
    const config = makeConnectedConfig()
    const ctx = createQueryContext({ dedupeTime: 0, cache: new Map() })

    const $balance = getAddressBalanceQuery(config, PAYMENT, ctx)
    const unsub = mount($balance)
    await vi.waitFor(() => expect(actions.getAddressBalance).toHaveBeenCalledTimes(1))

    const $sign = signMessageMutation(config, ctx)
    const sig = await $sign.mutate({ message: 'hello' })

    expect(sig).toBe('signature')
    await new Promise(r => setTimeout(r, 10))
    expect(actions.getAddressBalance).toHaveBeenCalledTimes(1)
    unsub()
  })
})

describe('signPsbtMutation (write, conditional on broadcast)', () => {
  it('revalidates only when the result carries a txId', async () => {
    const config = makeConnectedConfig()
    const ctx = createQueryContext({ dedupeTime: 0, cache: new Map() })

    const $balance = getAddressBalanceQuery(config, PAYMENT, ctx)
    const unsub = mount($balance)
    await vi.waitFor(() => expect(actions.getAddressBalance).toHaveBeenCalledTimes(1))

    // Sign-only (no txId) → no refetch. (Fresh store per mutate so nanoquery's
    // default `throttleCalls` doesn't drop the second call.)
    vi.mocked(actions.signPsbt).mockResolvedValueOnce({ psbtHex: 'aa', psbtBase64: 'qq' })
    await signPsbtMutation(config, ctx).mutate({ psbt: 'aa' })
    await new Promise(r => setTimeout(r, 10))
    expect(actions.getAddressBalance).toHaveBeenCalledTimes(1)

    // Broadcast (txId present) → refetch.
    vi.mocked(actions.signPsbt).mockResolvedValueOnce({
      psbtHex: 'aa',
      psbtBase64: 'qq',
      txId: 'tx1',
    })
    await signPsbtMutation(config, ctx).mutate({ psbt: 'aa', options: { broadcast: true } })
    await vi.waitFor(() => expect(actions.getAddressBalance).toHaveBeenCalledTimes(2))
    unsub()
  })
})

describe('getTransactionQuery (read)', () => {
  it('fetches through getTransaction and exposes the result', async () => {
    const config = makeConnectedConfig()
    const ctx = createQueryContext({ dedupeTime: 0, cache: new Map() })
    const $tx = getTransactionQuery(config, 'tx-1', ctx)
    const unsub = mount($tx)

    await vi.waitFor(() => expect($tx.get().data).toEqual({ txId: 'tx-1' }))
    expect(actions.getTransaction).toHaveBeenCalledWith(config, 'tx-1')
    unsub()
  })

  it('stays idle (no fetch) for an empty txId', async () => {
    const config = makeConnectedConfig()
    const ctx = createQueryContext({ dedupeTime: 0, cache: new Map() })
    const unsub = mount(getTransactionQuery(config, '', ctx))

    await new Promise(r => setTimeout(r, 10))
    expect(actions.getTransaction).not.toHaveBeenCalled()
    unsub()
  })
})

describe('broadcastPsbtMutation (write)', () => {
  it('calls broadcastPsbt, returns the txid, and revalidates the account', async () => {
    const config = makeConnectedConfig()
    const ctx = createQueryContext({ dedupeTime: 0, cache: new Map() })

    const $balance = getAddressBalanceQuery(config, PAYMENT, ctx)
    const unsub = mount($balance)
    await vi.waitFor(() => expect(actions.getAddressBalance).toHaveBeenCalledTimes(1))

    const txId = await broadcastPsbtMutation(config, ctx).mutate({ psbt: 'aa' })

    expect(txId).toBe('txid-psbt')
    expect(actions.broadcastPsbt).toHaveBeenCalledWith(config, 'aa')
    await vi.waitFor(() => expect(actions.getAddressBalance).toHaveBeenCalledTimes(2))
    unsub()
  })
})

describe('broadcastTransactionMutation (write)', () => {
  it('calls broadcastTransaction, returns the txid, and revalidates the account', async () => {
    const config = makeConnectedConfig()
    const ctx = createQueryContext({ dedupeTime: 0, cache: new Map() })

    const $balance = getAddressBalanceQuery(config, PAYMENT, ctx)
    const unsub = mount($balance)
    await vi.waitFor(() => expect(actions.getAddressBalance).toHaveBeenCalledTimes(1))

    const txId = await broadcastTransactionMutation(config, ctx).mutate({ rawTx: 'deadbeef' })

    expect(txId).toBe('txid-raw')
    expect(actions.broadcastTransaction).toHaveBeenCalledWith(config, 'deadbeef', undefined)
    await vi.waitFor(() => expect(actions.getAddressBalance).toHaveBeenCalledTimes(2))
    unsub()
  })
})
