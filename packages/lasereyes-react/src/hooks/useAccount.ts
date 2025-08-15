import { useLaserEyes } from "../providers/hooks"

type UseAccountReturnType =
  | {
      addresses: string[]
      payment: string
      ordinals: string
      publicKey: string
    }
  | undefined

export function useAccount(): UseAccountReturnType {
  const { address, paymentAddress, accounts, publicKey } = useLaserEyes(
    ({ address, paymentAddress, accounts, publicKey }) => ({
      address,
      paymentAddress,
      accounts,
      publicKey,
    }),
  )

  return !address
    ? undefined
    : {
        addresses: accounts,
        payment: paymentAddress,
        ordinals: address,
        publicKey,
      }
}
