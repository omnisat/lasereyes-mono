import { useCallback } from 'react'
import { sendBitcoin } from '@omnisat/lasereyes-core'
import { useLaserEyesCore } from '../providers/lasereyes-provider'

/**
 * Returns a function to send Bitcoin via the connected wallet.
 *
 * @remarks
 * The returned function is a stable reference — it will not change between
 * renders unless the core instance changes.
 *
 * Must be used within a {@link LaserEyesProvider} with an active wallet connection.
 *
 * @returns A function `(to: string, amount: number) => Promise<string>` that sends
 *   `amount` satoshis to `to` and resolves to the transaction ID.
 *
 * @throws {Error} If no wallet is connected when the function is called.
 *
 * @example
 * ```tsx
 * const send = useSendBitcoin()
 *
 * const handleSend = async () => {
 *   const txId = await send('bc1q...', 10000)
 *   console.log('Transaction ID:', txId)
 * }
 * ```
 */
export function useSendBitcoin() {
  const core = useLaserEyesCore()
  return useCallback((to: string, amount: number) => sendBitcoin(core, to, amount), [core])
}
