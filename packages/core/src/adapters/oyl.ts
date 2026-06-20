/**
 * OYL wallet adapter.
 *
 * @remarks
 * OYL injects `window.oyl`, a library-style provider with explicit
 * `getAddresses`, `signPsbt`, `signMessage`, `pushPsbt`, `getNetwork`, and
 * `switchNetwork` methods. It returns separate native-segwit (payment) and
 * taproot (ordinals) addresses, and — uniquely among the baseline wallets —
 * exposes `pushPsbt` (broadcast) separately from `signPsbt`'s `broadcast`
 * flag, so the connector routes `broadcastPsbt` to it natively.
 *
 * OYL has no single-prompt `sendBitcoin`; BTC sends go through the composed
 * PSBT path (build → `signPsbt` → broadcast), so this adapter intentionally
 * does not implement `bitcoin_sendBitcoin`.
 *
 * Ported from baseline `0397a17:packages/core/src/client/providers/oyl.ts`.
 *
 * @module adapters/oyl
 */

import type { NetworkId } from '@omnisat/lasereyes-client'
import { getAddressType } from '@omnisat/lasereyes-client/utils'
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

/** OYL injects its provider at `window.oyl`. */
type OylWindow = Window & { oyl?: unknown }

interface OylAccount {
  address: string
  publicKey: string
}

/** Networks OYL serves. Drives the derived capability matrix. */
const OYL_NETWORKS: NetworkId[] = ['mainnet', 'testnet', 'testnet4', 'signet', 'regtest', 'oylnet']

/** Map a standard {@link NetworkId} to OYL's network string. */
function toOylNetwork(networkId: NetworkId): string {
  const map: Partial<Record<NetworkId, string>> = {
    mainnet: 'mainnet',
    testnet: 'testnet',
    testnet4: 'testnet4',
    signet: 'signet',
    regtest: 'regtest',
    oylnet: 'oylnet',
    'fractal-mainnet': 'mainnet',
    'fractal-testnet': 'testnet',
  }
  return map[networkId] ?? 'mainnet'
}

/** Normalize an OYL network string back to a standard {@link NetworkId}. */
function normalizeOylNetwork(network: unknown, current: NetworkId): NetworkId {
  if (typeof network !== 'string') return current
  return (OYL_NETWORKS as string[]).includes(network) ? (network as NetworkId) : current
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
 * Fetch addresses and shape them as a {@link WalletAccountConfig}. Backs
 * both `bitcoin_requestAccounts` and `bitcoin_getAccounts` — OYL has no
 * prompt-free variant.
 */
async function getAddresses(ctx: AdapterContext): Promise<WalletAccountConfig> {
  const result = await ctx.rawProvider.getAddresses()
  const nativeSegwit: OylAccount | undefined = result?.nativeSegwit
  const taproot: OylAccount | undefined = result?.taproot
  if (!nativeSegwit?.address || !taproot?.address) {
    throw ctx.createError(4001, 'No accounts found')
  }

  const infos: AddressInfo[] = []
  const publicKeys: Partial<Record<AddressPurpose, string>> = {}

  const paymentType = getAddressType(nativeSegwit.address)
  if (paymentType !== null) {
    infos.push({ address: nativeSegwit.address, purpose: 'payment', type: paymentType })
    publicKeys.payment = nativeSegwit.publicKey
  }

  const ordinalsType = getAddressType(taproot.address)
  if (ordinalsType !== null) {
    infos.push({ address: taproot.address, purpose: 'ordinals', type: ordinalsType })
    publicKeys.ordinals = taproot.publicKey
    publicKeys.taproot = taproot.publicKey
  }

  return { addresses: infos, publicKeys: publicKeys as Record<AddressPurpose, string> }
}

/**
 * Sign a PSBT via OYL's `signPsbt`.
 *
 * @remarks
 * OYL returns the signed PSBT as hex (and, when `broadcast` is set, a
 * `txid`). Broadcasting is the backend's job in the composed `sendBtc`
 * action, so we pass `broadcast` through but normally only sign + finalize.
 */
async function signPsbt(params: SignPsbtParams, ctx: AdapterContext): Promise<SignedPsbt> {
  const { psbt, finalize = false, broadcast = false } = params
  if (!psbt) throw ctx.createError(-32602, 'Missing required parameter: psbt')

  const psbtHexIn = isBase64(psbt)
    ? hex.encode(Transaction.fromPSBT(base64.decode(psbt)).toPSBT())
    : psbt

  const response = await ctx.rawProvider.signPsbt({ psbt: psbtHexIn, finalize, broadcast })
  if (!response?.psbt) throw ctx.createError(-32603, 'No response from OYL')

  const tx = Transaction.fromPSBT(hex.decode(response.psbt))

  let txHex: string | undefined
  if (finalize && !response.txid) {
    try {
      txHex = hex.encode(tx.extract())
    } catch {
      // Partial / multi-sig PSBT — not fully finalized; leave undefined.
    }
  }

  return {
    psbtHex: response.psbt,
    psbtBase64: base64.encode(tx.toPSBT()),
    txId: response.txid,
    txHex,
  }
}

/**
 * Detect OYL and announce it for discovery.
 *
 * @returns The adapter if OYL is installed, null otherwise.
 */
export function loadOylWalletAdapter(): BitcoinProviderAdapter | null {
  if (typeof window === 'undefined') return null
  const { oyl } = window as OylWindow
  if (!oyl) return null

  const adapter = createOylAdapter(oyl)
  announceWallet({
    uuid: crypto.randomUUID(),
    name: 'OYL Wallet',
    rdns: 'app.oyl',
    provider: adapter,
  })
  return adapter
}

/**
 * OYL adapter factory.
 *
 * @remarks
 * Normalizes OYL's library-style API to the Bitcoin Provider Standard. OYL
 * provides separate payment (native segwit) and ordinals (taproot)
 * addresses and supports both BIP-322 and ECDSA message signing.
 */
export const createOylAdapter = defineAdapter({
  walletId: 'oyl',
  walletName: 'OYL Wallet',
  networks: OYL_NETWORKS,
  handlers: {
    bitcoin_requestAccounts: (_, ctx) => getAddresses(ctx),
    bitcoin_getAccounts: (_, ctx) => getAddresses(ctx),

    bitcoin_getNetwork: async (_, ctx) => {
      const network = await ctx.rawProvider.getNetwork()
      const normalized = normalizeOylNetwork(network, ctx.getNetwork())
      ctx.setNetwork(normalized)
      return normalized
    },

    bitcoin_switchNetwork: async ({ networkId }, ctx) => {
      await ctx.rawProvider.switchNetwork(toOylNetwork(networkId))
      ctx.setNetwork(networkId)
      return networkId
    },

    bitcoin_signPsbt: signPsbt,

    bitcoin_pushPsbt: async ({ psbt }, ctx) => {
      const response = await ctx.rawProvider.pushPsbt({ psbt })
      const txid = response?.txid
      if (!txid) throw ctx.createError(-32603, 'Error broadcasting PSBT')
      return txid
    },

    bitcoin_signMessage: async (params: SignMessageParams, ctx) => {
      const { message, address, protocol } = params
      if (!message || typeof message !== 'string') {
        throw ctx.createError(-32602, 'Missing or invalid parameter: message')
      }
      const response = await ctx.rawProvider.signMessage({ address, message, protocol })
      return response?.signature ?? ''
    },
  },
})
