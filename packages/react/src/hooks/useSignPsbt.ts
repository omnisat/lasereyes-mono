import { useCallback } from 'react'
import { signPsbt } from '@omnisat/lasereyes-core'
import type { SignPsbtOptions } from '@omnisat/lasereyes-core'
import { useLaserEyesCore } from '../providers/lasereyes-provider'

/**
 * Returns a function to sign a PSBT via the connected wallet.
 *
 * @remarks
 * The returned function is a stable reference — it will not change between
 * renders unless the core instance changes.
 *
 * Must be used within a {@link LaserEyesProvider} with an active wallet connection.
 *
 * @returns A function `(psbt: string, options?: SignPsbtOptions) => Promise<SignedPsbt>`
 *
 * @throws {Error} If no wallet is connected when the function is called.
 *
 * @example
 * ```tsx
 * const sign = useSignPsbt()
 *
 * const handleSign = async () => {
 *   const result = await sign(psbtHex, { finalize: true })
 *   console.log('Signed PSBT:', result.psbtHex)
 * }
 * ```
 */
export function useSignPsbt() {
  const core = useLaserEyesCore()
  return useCallback(
    (psbt: string, options?: SignPsbtOptions) => signPsbt(core, psbt, options),
    [core]
  )
}
