/**
 * OKX wallet adapter.
 *
 * @remarks
 * OKX injects `window.okxwallet` with two Unisat-compatible sub-providers
 * — `bitcoin` (mainnet) and `bitcoinTestnet` (testnet family). The
 * adapter receives the `okxwallet` root as its raw provider and selects
 * the right sub-provider from the tracked network. OKX exposes a single
 * address that serves as both payment and ordinals.
 *
 * Ported from baseline `0397a17:packages/core/src/client/providers/okx.ts`.
 *
 * @module adapters/okx
 */

import type { Inscription, NetworkId } from '@omnisat/lasereyes-client'
import { AddressType, getAddressType } from '@omnisat/lasereyes-client/utils'
import type { SignedPsbt, WalletAccountConfig } from '@omnisat/lasereyes-client/wallet'
import { base64, hex } from '@scure/base'
import { Transaction } from '@scure/btc-signer'
import { announceWallet } from '../detection/announcements'
import type { SignPsbtParams } from '../types/rpc-schema'
import type { BitcoinProviderAdapter } from './base'
import { type AdapterContext, defineAdapter } from './define-adapter'

/** OKX injects its provider at `window.okxwallet`. */
type OkxWindow = Window & {
  okxwallet?: { bitcoin?: unknown; bitcoinTestnet?: unknown }
}

/** Networks served by OKX's `bitcoinTestnet` sub-provider. */
const OKX_TESTNET_NETWORKS = new Set<NetworkId>([
  'testnet',
  'testnet4',
  'signet',
  'fractal-testnet',
])

/** Select the Unisat-compatible sub-provider for the current network. */
function lib(ctx: AdapterContext): any {
  const root = ctx.rawProvider
  return OKX_TESTNET_NETWORKS.has(ctx.getNetwork()) ? root?.bitcoinTestnet : root?.bitcoin
}

/** Infer network from an address prefix, falling back to the tracked one. */
function inferNetwork(address: string, current: NetworkId): NetworkId {
  if (address.startsWith('bc1') || address.startsWith('1') || address.startsWith('3')) {
    return 'mainnet'
  }
  if (OKX_TESTNET_NETWORKS.has(current)) return current
  if (address.startsWith('tb1') || address.startsWith('m') || address.startsWith('n')) {
    return 'testnet'
  }
  return current
}

/** Shape OKX's single address as both payment and ordinals. */
function buildAccountData(address: string, publicKey: string): WalletAccountConfig {
  const type = getAddressType(address) ?? AddressType.P2TR
  return {
    addresses: [
      { address, purpose: 'payment', type },
      { address, purpose: 'ordinals', type },
    ],
    publicKeys: { payment: publicKey, ordinals: publicKey, taproot: publicKey },
  }
}

/** Normalize an OKX (Unisat-flavored) inscription to the standard shape. */
function normalizeInscription(insc: any): Inscription {
  return {
    id: insc.inscriptionId,
    inscriptionId: insc.inscriptionId,
    number: insc.inscriptionNumber,
    address: insc.address,
    contentType: insc.contentType,
    preview: insc.preview,
    content: insc.content,
    outputValue: insc.outputValue,
    location: insc.location,
    output: insc.output ?? insc.location?.split(':').slice(0, 2).join(':') ?? '',
    genesisTransaction: insc.genesisTransaction,
    height: insc.genesisHeight ?? 0,
  }
}

/**
 * Connect and shape the single OKX address as both payment and ordinals.
 * Backs `bitcoin_requestAccounts` and `bitcoin_getAccounts`.
 */
async function connect(ctx: AdapterContext): Promise<WalletAccountConfig> {
  const provider = lib(ctx)
  if (!provider) throw ctx.createError(-32603, `OKX ${ctx.getNetwork()} provider unavailable`)

  const account = await provider.connect()
  if (!account?.address) throw ctx.createError(4001, 'No accounts found')

  ctx.setNetwork(inferNetwork(account.address, ctx.getNetwork()))
  return buildAccountData(account.address, account.publicKey)
}

/**
 * Sign a PSBT via OKX's Unisat-flavored `signPsbt`.
 *
 * @remarks
 * Broadcasting is the backend's job in the composed `broadcastPsbt`
 * action, so we only sign + optionally finalize.
 */
async function signPsbt(params: SignPsbtParams, ctx: AdapterContext): Promise<SignedPsbt> {
  const { psbt, finalize = false, inputsToSign } = params
  if (!psbt) throw ctx.createError(-32602, 'Missing required parameter: psbt')

  const options: any = { autoFinalized: finalize }
  if (inputsToSign) options.toSignInputs = inputsToSign

  const signedHex: string = await lib(ctx).signPsbt(psbt, options)
  const tx = Transaction.fromPSBT(hex.decode(signedHex))

  let txHex: string | undefined
  if (finalize) {
    try {
      txHex = hex.encode(tx.extract())
    } catch {
      // Not fully finalized (partial / multi-sig) — leave undefined.
    }
  }

  return { psbtHex: signedHex, psbtBase64: base64.encode(tx.toPSBT()), txId: undefined, txHex }
}

/**
 * Detect OKX and announce it for discovery.
 *
 * @returns The adapter if OKX is installed, null otherwise.
 */
export function loadOkxWalletAdapter(): BitcoinProviderAdapter | null {
  if (typeof window === 'undefined') return null
  const root = (window as OkxWindow).okxwallet
  if (!root?.bitcoin) return null

  const adapter = createOkxAdapter(root)
  announceWallet({
    uuid: crypto.randomUUID(),
    name: 'OKX Wallet',
    rdns: 'com.okx.wallet',
    provider: adapter,
  })
  return adapter
}

/**
 * OKX adapter factory.
 *
 * @remarks
 * Normalizes OKX's Unisat-flavored API to the Bitcoin Provider Standard.
 * Constructed with the `okxwallet` root so it can pick `bitcoin` vs
 * `bitcoinTestnet` per the tracked network.
 */
export const createOkxAdapter = defineAdapter({
  walletId: 'okx',
  walletName: 'OKX Wallet',
  networks: ['mainnet', 'testnet', 'testnet4', 'signet', 'fractal-mainnet', 'fractal-testnet'],
  handlers: {
    bitcoin_requestAccounts: (_, ctx) => connect(ctx),
    bitcoin_getAccounts: (_, ctx) => connect(ctx),

    bitcoin_getNetwork: (_, ctx) => ctx.getNetwork(),

    bitcoin_switchNetwork: ({ networkId }, ctx) => {
      ctx.setNetwork(networkId)
      if (!lib(ctx)) throw ctx.createError(-32603, `OKX ${networkId} provider unavailable`)
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
      const txId = await lib(ctx).sendBitcoin(to, amount)
      if (!txId) throw ctx.createError(-32603, 'Transaction failed')
      return txId
    },

    bitcoin_signMessage: async ({ message, protocol }, ctx) => {
      if (!message || typeof message !== 'string') {
        throw ctx.createError(-32602, 'Missing or invalid parameter: message')
      }
      const okxProtocol = protocol === 'bip322' ? 'bip322-simple' : protocol
      return await lib(ctx).signMessage(message, okxProtocol)
    },

    bitcoin_getInscriptions: async ({ offset = 0, limit = 10 }, ctx) => {
      const response = await lib(ctx).getInscriptions(offset, limit)
      return response.list.map((insc: any) => normalizeInscription(insc))
    },
  },
})
