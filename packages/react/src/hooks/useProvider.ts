import type { ProviderType, WalletProvider } from "@kevinoyl/lasereyes-core"
import { useLaserEyes } from "../providers/hooks"

export function useConnectedProvider(): WalletProvider | undefined {
  const { client, provider } = useLaserEyes(({ client, provider }) => ({
    client,
    provider,
  }))
  if (!provider) return undefined

  return client?.$providerMap[provider as ProviderType]
}
