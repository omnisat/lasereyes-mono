import { useCallback } from 'react'
import { signMessage } from '@omnisat/lasereyes-core'
import type { SignMessageOptions } from '@omnisat/lasereyes-core'
import { useLaserEyesCore } from '../providers/lasereyes-provider'

/**
 * Returns a function to sign a message via the connected wallet.
 *
 * @remarks
 * The returned function is a stable reference — it will not change between
 * renders unless the core instance changes.
 *
 * Must be used within a {@link LaserEyesProvider} with an active wallet connection.
 *
 * @returns A function `(message: string, options?: SignMessageOptions) => Promise<string>`
 *
 * @throws {Error} If no wallet is connected when the function is called.
 *
 * @example
 * ```tsx
 * const sign = useSignMessage()
 *
 * const handleSign = async () => {
 *   const signature = await sign('Hello, Bitcoin!', { protocol: 'bip322' })
 *   console.log('Signature:', signature)
 * }
 * ```
 */
export function useSignMessage() {
  const core = useLaserEyesCore()
  return useCallback(
    (message: string, options?: SignMessageOptions) => signMessage(core, message, options),
    [core]
  )
}
