/**
 * Xverse wallet adapter.
 *
 * @remarks
 * Talks to `window.XverseProviders.BitcoinProvider` directly via its
 * `request(method, params)` surface — the same sats-connect v3 RPC
 * interface, minus the external `sats-connect` dependency (and its
 * ~600 kB `@sats-connect/core` + `jsontokens` + `elliptic` chain). The
 * loader hands the adapter the `BitcoinProvider` as its raw provider, so
 * handlers call `ctx.rawProvider.request(...)`.
 *
 * Xverse provides separate payment and ordinals addresses.
 *
 * @module adapters/xverse
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

/** Xverse Wallet icon (base64 encoded SVG). */
export const XVERSE_ICON =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iIzExMTExMSIvPgo8cGF0aCBkPSJNMTAgMTBMMTYgMTZMMjIgMTBNMjIgMjJMMTYgMTZMMTAgMjIiIHN0cm9rZT0iI0VFN0EzMCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+Cg=='

/** Xverse's sats-connect-style RPC user-rejection code. */
const XVERSE_USER_REJECTION = -32000

/** Xverse network identifiers (sats-connect strings). */
const XverseNetwork = {
  MAINNET: 'Mainnet',
  TESTNET: 'Testnet',
  TESTNET4: 'Testnet4',
  SIGNET: 'Signet',
  FRACTAL_MAINNET: 'FractalMainnet',
  FRACTAL_TESTNET: 'FractalTestnet',
} as const

/** Normalize an Xverse network name to a standard {@link NetworkId}. */
function normalizeXverseNetwork(xverseNetwork: string): NetworkId {
  const map: Record<string, NetworkId> = {
    [XverseNetwork.MAINNET]: 'mainnet',
    [XverseNetwork.TESTNET]: 'testnet',
    [XverseNetwork.TESTNET4]: 'testnet4',
    [XverseNetwork.SIGNET]: 'signet',
    [XverseNetwork.FRACTAL_MAINNET]: 'fractal-mainnet',
    [XverseNetwork.FRACTAL_TESTNET]: 'fractal-testnet',
  }
  const normalized = xverseNetwork.toLowerCase()
  for (const [key, value] of Object.entries(map)) {
    if (key.toLowerCase() === normalized) return value
  }
  return 'mainnet'
}

/** Convert a standard {@link NetworkId} to an Xverse network string. */
function toXverseNetwork(networkId: NetworkId): string {
  const map: Partial<Record<NetworkId, string>> = {
    mainnet: XverseNetwork.MAINNET,
    testnet: XverseNetwork.TESTNET,
    testnet4: XverseNetwork.TESTNET4,
    signet: XverseNetwork.SIGNET,
    'fractal-mainnet': XverseNetwork.MAINNET,
    'fractal-testnet': XverseNetwork.TESTNET,
  }
  return map[networkId] ?? XverseNetwork.MAINNET
}

/**
 * Shape an Xverse account reply into a {@link WalletAccountConfig}.
 *
 * @remarks
 * Each entry is `{ address, purpose, publicKey, addressType }`. We map
 * `purpose` to the standard {@link AddressPurpose}, capture each pubkey,
 * and drop the rest (Stacks addresses, unrecognized types).
 */
function buildAccountData(addresses: any[]): WalletAccountConfig {
  const infos: AddressInfo[] = []
  const publicKeys: Partial<Record<AddressPurpose, string>> = {}

  for (const addr of addresses) {
    let purpose: AddressPurpose
    if (addr.purpose === 'payment') purpose = 'payment'
    else if (addr.purpose === 'ordinals') purpose = 'ordinals'
    else continue

    const addrType = getAddressType(addr.address)
    if (!addrType) continue
    infos.push({ address: addr.address, purpose, type: addrType })
    if (typeof addr.publicKey === 'string') publicKeys[purpose] = addr.publicKey
  }

  if (publicKeys.ordinals) publicKeys.taproot = publicKeys.ordinals

  return { addresses: infos, publicKeys: publicKeys as Record<AddressPurpose, string> }
}

/** Whether a string is base64-encoded. */
function isBase64(str: string): boolean {
  try {
    return btoa(atob(str)) === str
  } catch {
    return false
  }
}

/** Connect (or read the existing account) and shape it. */
async function requestAccounts(ctx: AdapterContext): Promise<WalletAccountConfig> {
  try {
    const existing = await ctx.rawProvider.request('wallet_getAccount', null)
    if (existing.status === 'success') return buildAccountData(existing.result.addresses)
  } catch {
    // Not connected yet — fall through to wallet_connect.
  }

  const response = await ctx.rawProvider.request('wallet_connect', {
    addresses: ['payment', 'ordinals'],
    message: 'Connecting with LaserEyes',
  })
  if (response.status === 'success') return buildAccountData(response.result.addresses)
  if (response.error?.code === XVERSE_USER_REJECTION) {
    throw ctx.createError(4001, 'User rejected account access')
  }
  throw ctx.createError(-32603, `Error connecting to Xverse: ${response.error?.message}`)
}

/** Sign a PSBT via Xverse's `signPsbt` RPC. */
async function signPsbt(params: SignPsbtParams, ctx: AdapterContext): Promise<SignedPsbt> {
  const { psbt, finalize = false, broadcast = false, inputsToSign } = params
  if (!psbt) throw ctx.createError(-32602, 'Missing required parameter: psbt')

  const psbtBase64 = isBase64(psbt)
    ? psbt
    : base64.encode(Transaction.fromPSBT(hex.decode(psbt)).toPSBT())

  const signInputs: Record<string, number[]> = {}
  if (inputsToSign) {
    for (const input of inputsToSign) {
      const address = input.address
      if (!address) continue
      if (!signInputs[address]) signInputs[address] = []
      signInputs[address].push(input.index)
    }
  }

  const response = await ctx.rawProvider.request('signPsbt', {
    psbt: psbtBase64,
    broadcast: !!broadcast,
    signInputs: Object.keys(signInputs).length > 0 ? signInputs : undefined,
  })

  if (response.status === 'error') {
    if (response.error?.code === XVERSE_USER_REJECTION) {
      throw ctx.createError(4001, 'User rejected the request')
    }
    throw ctx.createError(-32603, `Error signing PSBT: ${response.error?.message}`)
  }

  const signedPsbtBase64 = response.result.psbt
  const signedPsbt = Transaction.fromPSBT(base64.decode(signedPsbtBase64))
  const signedPsbtHex = hex.encode(signedPsbt.toPSBT())

  let txHex: string | undefined
  if (finalize && !response.result.txid) {
    signedPsbt.finalize()
    txHex = hex.encode(signedPsbt.extract())
  }

  return {
    psbtHex: signedPsbtHex,
    psbtBase64: signedPsbtBase64,
    txId: response.result.txid,
    txHex,
  }
}

/**
 * Detect Xverse and announce it for discovery.
 *
 * @returns The adapter if Xverse is installed, null otherwise.
 */
export function loadXverseWalletAdapter(): BitcoinProviderAdapter | null {
  if (typeof window === 'undefined') return null
  const provider = (window as any).XverseProviders?.BitcoinProvider
  if (!provider) return null

  const adapter = createXverseAdapter(provider)
  announceWallet({
    uuid: crypto.randomUUID(),
    name: 'Xverse Wallet',
    icon: XVERSE_ICON,
    rdns: 'app.xverse.wallet',
    provider: adapter,
  })
  return adapter
}

/**
 * Xverse adapter factory.
 *
 * @remarks
 * Normalizes Xverse's sats-connect-style RPC (served by
 * `XverseProviders.BitcoinProvider.request`) to the Bitcoin Provider
 * Standard, with separate payment and ordinals addresses.
 */
export const createXverseAdapter = defineAdapter({
  walletId: 'xverse',
  walletName: 'Xverse Wallet',
  networks: ['mainnet', 'testnet', 'testnet4', 'signet', 'fractal-mainnet', 'fractal-testnet'],
  handlers: {
    bitcoin_requestAccounts: (_, ctx) => requestAccounts(ctx),

    bitcoin_getAccounts: async (_, ctx) => {
      const response = await ctx.rawProvider.request('wallet_getAccount', null)
      if (response.status === 'success') return buildAccountData(response.result.addresses)
      throw ctx.createError(-32603, `Error getting accounts: ${response.error?.message}`)
    },

    bitcoin_getNetwork: async (_, ctx) => {
      const response = await ctx.rawProvider.request('wallet_getNetwork', null)
      if (response.status === 'success') {
        return normalizeXverseNetwork(response.result.bitcoin.name)
      }
      throw ctx.createError(-32603, 'Error getting network')
    },

    bitcoin_switchNetwork: async ({ networkId }, ctx) => {
      const response = await ctx.rawProvider.request('wallet_changeNetwork', {
        name: toXverseNetwork(networkId),
      })
      if (response.status === 'success') {
        ctx.setNetwork(networkId)
        return networkId
      }
      throw ctx.createError(-32603, `Error switching network: ${response.error?.message}`)
    },

    bitcoin_signPsbt: signPsbt,

    bitcoin_sendBitcoin: async ({ to, amount }, ctx) => {
      if (!to || typeof to !== 'string') {
        throw ctx.createError(-32602, 'Missing or invalid parameter: to')
      }
      if (typeof amount !== 'number' || amount <= 0) {
        throw ctx.createError(-32602, 'Invalid parameter: amount must be positive number')
      }
      const response = await ctx.rawProvider.request('sendTransfer', {
        recipients: [{ address: to, amount }],
      })
      if (response.status === 'success') return response.result.txid
      if (response.error?.code === XVERSE_USER_REJECTION) {
        throw ctx.createError(4001, 'User rejected the request')
      }
      throw ctx.createError(-32603, `Error sending BTC: ${response.error?.message}`)
    },

    bitcoin_signMessage: async (params: SignMessageParams, ctx) => {
      const { message, address, protocol = 'ecdsa' } = params
      if (!message || typeof message !== 'string') {
        throw ctx.createError(-32602, 'Missing or invalid parameter: message')
      }
      const response = await ctx.rawProvider.request('signMessage', {
        address,
        message,
        protocol: protocol === 'bip322' ? 'BIP322' : 'ECDSA',
      })
      if (response.status === 'success') return response.result.signature as string
      if (response.error?.code === XVERSE_USER_REJECTION) {
        throw ctx.createError(4001, 'User rejected the request')
      }
      throw ctx.createError(-32603, `Error signing message: ${response.error?.message}`)
    },
  },
})
