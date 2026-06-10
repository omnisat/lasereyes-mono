'use client'

import { useStore } from '@nanostores/react'
import type {
  AddressInfo,
  AddressPurpose,
  Connector,
  LaserEyesConfig,
  WalletAccount,
} from '@omnisat/lasereyes-core'
import { useConfig } from '../providers/context'
import type { ConfigNetworkId, ConfigParameter, ResolvedRegister } from '../types'

function addressFor(
  account: WalletAccount | undefined,
  purpose: AddressPurpose
): string | undefined {
  return account?.addresses.find(a => a.purpose === purpose)?.address
}

function publicKeyFor(
  account: WalletAccount | undefined,
  purpose: AddressPurpose
): string | undefined {
  return account?.publicKeys?.[purpose]
}

/** Conveniences present on every branch (their values vary by status). */
interface AccountCommon<config extends LaserEyesConfig> {
  /** Active network id — the configured chains' id union. */
  networkId: ConfigNetworkId<config>
  /** All addresses the account controls (empty when disconnected). */
  addresses: AddressInfo[]
  /** Ordinals/taproot address, if the wallet exposes one. */
  ordinalsAddress: string | undefined
  /** Ordinals public key, if the wallet exposes one. */
  ordinalsPublicKey: string | undefined
}

/**
 * Discriminated account view returned by {@link useAccount}.
 *
 * @remarks
 * Discriminated on `status`. The `connected` branch **guarantees** non-null
 * `account` / `connector` **and** a non-null primary (payment) address +
 * public key — so `account.paymentAddress` needs no `?? '—'` after a
 * `status === 'connected'` check. Ordinals/taproot fields stay
 * `string | undefined` (not every wallet exposes them).
 */
export type UseAccountResult<config extends LaserEyesConfig = ResolvedRegister['config']> =
  AccountCommon<config> &
    (
      | {
          status: 'connected'
          isConnected: true
          isConnecting: false
          isReconnecting: false
          isDisconnected: false
          /** The connected wallet account. */
          account: WalletAccount
          /** The active connector. */
          connector: Connector
          /** Payment address (alias of `paymentAddress`). */
          address: string
          /** Payment address. */
          paymentAddress: string
          /** Payment public key (alias of `paymentPublicKey`). */
          publicKey: string
          /** Payment public key. */
          paymentPublicKey: string
        }
      | {
          status: 'disconnected' | 'connecting' | 'reconnecting'
          isConnected: false
          isConnecting: boolean
          isReconnecting: boolean
          isDisconnected: boolean
          account: WalletAccount | undefined
          connector: Connector | undefined
          address: string | undefined
          paymentAddress: string | undefined
          publicKey: string | undefined
          paymentPublicKey: string | undefined
        }
    )

/**
 * Subscribe to the connected account and connection status.
 *
 * @remarks
 * Re-renders only when `config.state.$connection` changes. The result is a
 * `status`-discriminated union: in the `connected` branch `account` and
 * `connector` are non-null. Address/public-key fields are derived conveniences;
 * the raw {@link WalletAccount} is on `account`.
 *
 * @param parameters - Optional `{ config }` override.
 *
 * @example
 * ```tsx
 * const account = useAccount()
 * if (account.status === 'connected') {
 *   account.account.getPublicKey() // no null-check needed
 * }
 * ```
 */
export function useAccount<config extends LaserEyesConfig = ResolvedRegister['config']>(
  parameters: ConfigParameter<config> = {}
): UseAccountResult<config> {
  const config = useConfig(parameters)
  const conn = useStore(config.state.$connection)
  const account = conn.account

  const common: AccountCommon<config> = {
    networkId: conn.networkId as ConfigNetworkId<config>,
    addresses: account?.addresses ?? [],
    ordinalsAddress: addressFor(account, 'ordinals') ?? addressFor(account, 'taproot'),
    ordinalsPublicKey: publicKeyFor(account, 'ordinals') ?? publicKeyFor(account, 'taproot'),
  }

  if (conn.status === 'connected') {
    // `WalletAccount.getAddress()` / `getPublicKey()` return a guaranteed
    // `string` for the primary (payment) role — so the connected branch can
    // promise these non-null without a cast.
    const paymentAddress = conn.account.getAddress('payment')
    const paymentPublicKey = conn.account.getPublicKey('payment')
    return {
      ...common,
      status: 'connected',
      isConnected: true,
      isConnecting: false,
      isReconnecting: false,
      isDisconnected: false,
      account: conn.account,
      connector: conn.connector,
      address: paymentAddress,
      paymentAddress,
      publicKey: paymentPublicKey,
      paymentPublicKey,
    }
  }

  const paymentAddress = addressFor(account, 'payment')
  const paymentPublicKey = publicKeyFor(account, 'payment')
  return {
    ...common,
    status: conn.status,
    isConnected: false,
    isConnecting: conn.status === 'connecting',
    isReconnecting: conn.status === 'reconnecting',
    isDisconnected: conn.status === 'disconnected',
    account: conn.account,
    connector: conn.connector,
    address: paymentAddress,
    paymentAddress,
    publicKey: paymentPublicKey,
    paymentPublicKey,
  }
}
