/**
 * Leather wallet adapter.
 *
 * @remarks
 * Leather injects `window.LeatherProvider`, a JSON-RPC-style provider
 * whose methods are reached via `request(method, params)`. It returns
 * separate taproot (ordinals) and native-segwit (payment) addresses and
 * does not report its own network — the network is driver-supplied, so
 * the adapter tracks it in {@link AdapterContext} (defaulting to mainnet,
 * updated on `bitcoin_switchNetwork`, and inferred from the connected
 * address).
 *
 * Ported from baseline `0397a17:packages/core/src/client/providers/leather.ts`.
 *
 * @module adapters/leather
 */

import type { NetworkId } from '@omnisat/lasereyes-client'
import { AddressType, getAddressType } from '@omnisat/lasereyes-client/utils'
import type {
  AddressInfo,
  AddressPurpose,
  SignedPsbt,
  WalletAccountConfig,
} from '@omnisat/lasereyes-client/wallet'
import { base64, hex } from '@scure/base'
import { Transaction } from '@scure/btc-signer'
import { announceWallet } from '../detection/announcements'
import type { SignMessageParams, SignPsbtParams } from '../types/rpc-schema'
import type { BitcoinProviderAdapter } from './base'
import { type AdapterContext, defineAdapter } from './define-adapter'

declare global {
  interface Window {
    LeatherProvider?: unknown
  }
}

/** Leather's address `type` strings. */
const LEATHER_P2TR = 'p2tr'
const LEATHER_P2WPKH = 'p2wpkh'

/** Leather JSON-RPC user-rejection code (`@leather.io/rpc`). */
const LEATHER_USER_REJECTION = 4001

interface LeatherAddress {
  address: string
  publicKey?: string
  symbol?: string
  type?: string
}

/** Map a standard {@link NetworkId} to Leather's network string. */
function toLeatherNetwork(networkId: NetworkId): string {
  const map: Partial<Record<NetworkId, string>> = {
    mainnet: 'mainnet',
    testnet: 'testnet',
    testnet4: 'testnet4',
    signet: 'signet',
    regtest: 'regtest',
    'fractal-mainnet': 'mainnet',
    'fractal-testnet': 'testnet',
  }
  return map[networkId] ?? 'mainnet'
}

/** Best-effort network inference from an address prefix. */
function inferNetwork(address: string, current: NetworkId): NetworkId {
  if (address.startsWith('bc1') || address.startsWith('1') || address.startsWith('3')) {
    return 'mainnet'
  }
  if (address.startsWith('bcrt1')) return 'regtest'
  if (address.startsWith('tb1') || address.startsWith('m') || address.startsWith('n')) {
    return current === 'mainnet' ? 'testnet' : current
  }
  return current
}

/** Whether a string is base64-encoded. */
function isBase64(str: string): boolean {
  try {
    return btoa(atob(str)) === str
  } catch {
    return false
  }
}

/**
 * Fetch addresses for the current network and shape them as a
 * {@link WalletAccountConfig}. Backs both `bitcoin_requestAccounts` and
 * `bitcoin_getAccounts` — Leather has no prompt-free variant.
 */
async function getAddresses(ctx: AdapterContext): Promise<WalletAccountConfig> {
  const response = await ctx.rawProvider.request('getAddresses', {
    network: toLeatherNetwork(ctx.getNetwork()),
  })
  const addresses: LeatherAddress[] = response?.result?.addresses
  if (!addresses?.length) {
    throw ctx.createError(4001, 'No accounts found')
  }

  const taproot = addresses.find(a => a.symbol !== 'STX' && a.type === LEATHER_P2TR)
  const segwit = addresses.find(a => a.symbol !== 'STX' && a.type === LEATHER_P2WPKH)
  if (!taproot?.publicKey || !segwit?.publicKey) {
    throw ctx.createError(-32603, 'No accounts found')
  }

  const infos: AddressInfo[] = []
  const publicKeys: Partial<Record<AddressPurpose, string>> = {}

  const paymentType = getAddressType(segwit.address)
  if (paymentType !== null) {
    infos.push({ address: segwit.address, purpose: 'payment', type: paymentType })
    publicKeys.payment = segwit.publicKey
  }

  const ordinalsType = getAddressType(taproot.address)
  if (ordinalsType !== null) {
    infos.push({ address: taproot.address, purpose: 'ordinals', type: ordinalsType })
    publicKeys.ordinals = taproot.publicKey
    publicKeys.taproot = taproot.publicKey
  }

  ctx.setNetwork(inferNetwork(segwit.address, ctx.getNetwork()))

  return { addresses: infos, publicKeys: publicKeys as Record<AddressPurpose, string> }
}

/**
 * Sign a PSBT via Leather's `signPsbt` RPC.
 *
 * @remarks
 * Leather signs without broadcasting (we pin `broadcast: false`);
 * broadcasting is the backend's job in the composed `broadcastPsbt`
 * action. Optional finalization extracts the network-serialized tx.
 */
async function signPsbt(params: SignPsbtParams, ctx: AdapterContext): Promise<SignedPsbt> {
  const { psbt, finalize = false, inputsToSign } = params
  if (!psbt) throw ctx.createError(-32602, 'Missing required parameter: psbt')

  const psbtHexIn = isBase64(psbt)
    ? hex.encode(Transaction.fromPSBT(base64.decode(psbt)).toPSBT())
    : psbt

  const response = await ctx.rawProvider.request('signPsbt', {
    hex: psbtHexIn,
    broadcast: false,
    network: toLeatherNetwork(ctx.getNetwork()),
    signAtIndex: inputsToSign?.map(i => i.index),
  })
  if (!response?.result?.hex) throw ctx.createError(-32603, 'No response from Leather')

  const signedHex: string = response.result.hex
  const tx = Transaction.fromPSBT(hex.decode(signedHex))

  if (finalize) {
    tx.finalize()
    let txHex: string | undefined
    try {
      txHex = hex.encode(tx.extract())
    } catch {
      // Partial / multi-sig PSBT — not fully finalized; leave undefined.
    }
    return {
      psbtHex: hex.encode(tx.toPSBT()),
      psbtBase64: base64.encode(tx.toPSBT()),
      txId: undefined,
      txHex,
    }
  }

  return { psbtHex: signedHex, psbtBase64: base64.encode(tx.toPSBT()), txId: undefined }
}

/**
 * Detect Leather and announce it for discovery.
 *
 * @returns The adapter if Leather is installed, null otherwise.
 */
export function loadLeatherWalletAdapter(): BitcoinProviderAdapter | null {
  if (typeof window === 'undefined') return null
  if (!window.LeatherProvider) return null

  const adapter = createLeatherAdapter(window.LeatherProvider)
  announceWallet({
    uuid: crypto.randomUUID(),
    name: 'Leather Wallet',
    rdns: 'io.leather',
    provider: adapter,
  })
  return adapter
}

/**
 * Leather adapter factory.
 *
 * @remarks
 * Normalizes Leather's RPC API to the Bitcoin Provider Standard. Leather
 * provides separate payment (native segwit) and ordinals (taproot)
 * addresses and does not support ECDSA message signing.
 */
export const createLeatherAdapter = defineAdapter({
  walletId: 'leather',
  walletName: 'Leather Wallet',
  networks: ['mainnet', 'testnet', 'testnet4', 'signet'],
  handlers: {
    bitcoin_requestAccounts: (_, ctx) => getAddresses(ctx),
    bitcoin_getAccounts: (_, ctx) => getAddresses(ctx),

    bitcoin_getNetwork: (_, ctx) => ctx.getNetwork(),

    bitcoin_switchNetwork: async ({ networkId }, ctx) => {
      const response = await ctx.rawProvider.request('getAddresses', {
        network: toLeatherNetwork(networkId),
      })
      if (!response?.result?.addresses?.length) {
        throw ctx.createError(-32603, 'Failed to get new network details')
      }
      ctx.setNetwork(networkId)
      return networkId
    },

    bitcoin_signPsbt: signPsbt,

    bitcoin_sendBitcoin: async ({ to, amount }, ctx) => {
      if (!to || typeof to !== 'string') {
        throw ctx.createError(-32602, 'Missing or invalid parameter: to')
      }
      if (typeof amount !== 'number' || amount <= 0) {
        throw ctx.createError(-32602, 'Invalid parameter: amount must be positive number')
      }
      try {
        const response = await ctx.rawProvider.request('sendTransfer', {
          recipients: [{ address: to, amount: String(amount) }],
          network: toLeatherNetwork(ctx.getNetwork()),
        })
        const txid = response?.result?.txid
        if (txid) return txid
        throw ctx.createError(-32603, 'Error sending BTC')
      } catch (e: any) {
        if (e?.error?.code === LEATHER_USER_REJECTION) {
          throw ctx.createError(4001, 'User rejected the request')
        }
        throw ctx.createError(-32603, `Error sending BTC: ${e?.error?.message ?? e?.message ?? ''}`)
      }
    },

    bitcoin_signMessage: async (params: SignMessageParams, ctx) => {
      const { message, address, protocol } = params
      if (!message || typeof message !== 'string') {
        throw ctx.createError(-32602, 'Missing or invalid parameter: message')
      }
      if (protocol === 'ecdsa') {
        throw ctx.createError(-32601, "Leather doesn't support ECDSA message signing")
      }
      const paymentType =
        typeof address === 'string' && getAddressType(address) === AddressType.P2TR
          ? LEATHER_P2TR
          : LEATHER_P2WPKH
      const response = await ctx.rawProvider.request('signMessage', { message, paymentType })
      return response?.result?.signature ?? ''
    },
  },
})
