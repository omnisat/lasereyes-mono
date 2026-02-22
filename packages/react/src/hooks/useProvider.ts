import type { ProviderType, WalletProvider } from '@omnisat/lasereyes-core'
import { useLaserEyes } from '../providers/hooks'

/**
 * Returns the {@link WalletProvider} instance for the currently connected wallet.
 *
 * @remarks
 * Provides direct access to the low-level wallet provider adapter. Returns
 * `undefined` when no wallet is connected. Useful for advanced use cases
 * that need to interact with wallet-specific APIs not exposed through the
 * standard LaserEyes interface.
 *
 * @returns The connected wallet's provider instance, or `undefined` if disconnected
 *
 * @example
 * ```tsx
 * const provider = useConnectedProvider()
 * if (provider) {
 *   // Access wallet-specific functionality
 *   console.log('Connected to:', provider.name)
 * }
 * ```
 */
export function useConnectedProvider(): WalletProvider | undefined {
  const { client, provider } = useLaserEyes(({ client, provider }) => ({
    client,
    provider,
  }))
  if (!provider) return undefined

  return client?.$providerMap[provider as ProviderType]
}
