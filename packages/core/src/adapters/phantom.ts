/**
 * Phantom wallet adapter (Bitcoin support).
 *
 * @remarks
 * Phantom injects `window.phantom.bitcoin` and is mainnet-only. It returns
 * separate payment and ordinals addresses, signs messages over raw bytes,
 * and signs PSBTs via `signPSBT(bytes, { inputsToSign })` where
 * `inputsToSign` groups input indexes by their owning address. We derive
 * those groups by decoding each input's `witnessUtxo` script, so the
 * composed `sendBtc` path (which passes no `inputsToSign`) works.
 *
 * Phantom has no native `sendBitcoin` RPC — sending composes a PSBT and
 * routes through `signPsbt`, so this adapter declares no
 * `bitcoin_sendBitcoin` handler.
 *
 * Ported from baseline `0397a17:packages/core/src/client/providers/phantom.ts`.
 *
 * @module adapters/phantom
 */

import { getAddressType, getBitcoinNetwork } from '@omnisat/lasereyes-client/utils'
import type {
  AddressInfo,
  AddressPurpose,
  SignedPsbt,
  WalletAccountConfig,
} from '@omnisat/lasereyes-client/wallet'
import { base64, hex } from '@scure/base'
import { Address, OutScript, Transaction } from '@scure/btc-signer'
import { announceWallet } from '../detection/announcements'
import type { SignPsbtParams } from '../types/rpc-schema'
import type { BitcoinProviderAdapter } from './base'
import { type AdapterContext, defineAdapter } from './define-adapter'

/** Phantom injects its provider at `window.phantom`. */
type PhantomWindow = Window & { phantom?: { bitcoin?: unknown } }

interface PhantomAccount {
  address: string
  addressType?: string
  publicKey?: string
  purpose?: string
}

/** Whether a string is base64-encoded. */
function isBase64(str: string): boolean {
  try {
    return btoa(atob(str)) === str
  } catch {
    return false
  }
}

/** Shape Phantom's account list into a {@link WalletAccountConfig}. */
function buildAccountData(accounts: PhantomAccount[]): WalletAccountConfig {
  const infos: AddressInfo[] = []
  const publicKeys: Partial<Record<AddressPurpose, string>> = {}

  for (const account of accounts) {
    let purpose: AddressPurpose
    if (account.purpose === 'payment') purpose = 'payment'
    else if (account.purpose === 'ordinals') purpose = 'ordinals'
    else continue

    const type = getAddressType(account.address)
    if (type === null) continue
    infos.push({ address: account.address, purpose, type })
    if (typeof account.publicKey === 'string') publicKeys[purpose] = account.publicKey
  }

  if (publicKeys.ordinals) publicKeys.taproot = publicKeys.ordinals

  return { addresses: infos, publicKeys: publicKeys as Record<AddressPurpose, string> }
}

/** Fetch the connected accounts. */
async function requestAccounts(ctx: AdapterContext): Promise<PhantomAccount[]> {
  const accounts: PhantomAccount[] = await ctx.rawProvider.requestAccounts()
  if (!accounts?.length) throw ctx.createError(4001, 'No accounts found')
  return accounts
}

/**
 * Sign a PSBT via Phantom's `signPSBT`.
 *
 * @remarks
 * Phantom needs each input index assigned to its owning address. We map
 * index → address by decoding the input's `witnessUtxo` script (honoring
 * any explicit `inputsToSign`), then group. Broadcasting is the backend's
 * job in the composed `broadcastPsbt` action, so we only sign + finalize.
 */
async function signPsbt(params: SignPsbtParams, ctx: AdapterContext): Promise<SignedPsbt> {
  const { psbt, finalize = false, inputsToSign } = params
  if (!psbt) throw ctx.createError(-32602, 'Missing required parameter: psbt')

  const psbtBytes = isBase64(psbt) ? base64.decode(psbt) : hex.decode(psbt)
  const tx = Transaction.fromPSBT(psbtBytes)
  const net = getBitcoinNetwork(ctx.getNetwork())

  const addressForIndex = (index: number): string | undefined => {
    const explicit = inputsToSign?.find(i => i.index === index)?.address
    if (explicit) return explicit
    try {
      const script = tx.getInput(index).witnessUtxo?.script
      return script ? Address(net).encode(OutScript.decode(script)) : undefined
    } catch {
      return undefined
    }
  }

  const indexes = inputsToSign?.length
    ? inputsToSign.map(i => i.index)
    : Array.from({ length: tx.inputsLength }, (_, i) => i)

  const grouped = new Map<string, number[]>()
  for (const index of indexes) {
    const address = addressForIndex(index)
    if (!address) continue
    grouped.set(address, [...(grouped.get(address) ?? []), index])
  }

  const phantomInputs = [...grouped].map(([address, signingIndexes]) => ({
    address,
    signingIndexes,
  }))

  const signedBytes: Uint8Array = await ctx.rawProvider.signPSBT(psbtBytes, {
    inputsToSign: phantomInputs,
  })
  const signed = Transaction.fromPSBT(signedBytes)

  let txHex: string | undefined
  if (finalize) {
    for (const { signingIndexes } of phantomInputs) {
      for (const index of signingIndexes) {
        try {
          signed.finalizeIdx(index)
        } catch {
          // Input not fully signed (partial / multi-sig) — leave as-is.
        }
      }
    }
    try {
      txHex = hex.encode(signed.extract())
    } catch {
      // Not every input finalized; no extractable tx.
    }
  }

  return {
    psbtHex: hex.encode(signed.toPSBT()),
    psbtBase64: base64.encode(signed.toPSBT()),
    txId: undefined,
    txHex,
  }
}

/**
 * Detect Phantom and announce it for discovery.
 *
 * @returns The adapter if Phantom is installed, null otherwise.
 */
export function loadPhantomWalletAdapter(): BitcoinProviderAdapter | null {
  if (typeof window === 'undefined') return null
  const raw = (window as PhantomWindow).phantom?.bitcoin
  if (!raw) return null

  const adapter = createPhantomAdapter(raw)
  announceWallet({
    uuid: crypto.randomUUID(),
    name: 'Phantom Wallet',
    rdns: 'app.phantom',
    provider: adapter,
  })
  return adapter
}

/**
 * Phantom adapter factory.
 *
 * @remarks
 * Normalizes Phantom's Bitcoin API to the Bitcoin Provider Standard.
 * Mainnet-only; does not support ECDSA message signing or a native send
 * (sends compose a PSBT and route through `signPsbt`).
 */
export const createPhantomAdapter = defineAdapter({
  walletId: 'phantom',
  walletName: 'Phantom Wallet',
  networks: ['mainnet'],
  handlers: {
    bitcoin_requestAccounts: (_, ctx) => requestAccounts(ctx).then(buildAccountData),
    bitcoin_getAccounts: (_, ctx) => requestAccounts(ctx).then(buildAccountData),

    bitcoin_getNetwork: (_, ctx) => ctx.getNetwork(),

    bitcoin_signPsbt: signPsbt,

    bitcoin_signMessage: async ({ message, address, protocol }, ctx) => {
      if (!message || typeof message !== 'string') {
        throw ctx.createError(-32602, 'Missing or invalid parameter: message')
      }
      if (protocol === 'ecdsa') {
        throw ctx.createError(-32601, 'ECDSA signing is not supported by Phantom')
      }

      let signAddress = address
      if (!signAddress) {
        const accounts = await requestAccounts(ctx)
        signAddress = accounts.find(a => a.purpose === 'payment')?.address
      }
      if (!signAddress) throw ctx.createError(-32602, 'No address to sign message')

      const bytes = new TextEncoder().encode(message)
      const response = await ctx.rawProvider.signMessage(signAddress, bytes)
      return btoa(String.fromCharCode(...response.signature))
    },
  },
})
