import { useAccount } from '@omnisat/lasereyes-react'
import { clsx } from 'clsx'
import Field from './Field'

export default function AccountInfo() {
  const account = useAccount()
  const address = account.address
  const paymentAddress = account.paymentAddress
  const publicKey = account.publicKey
  const paymentPublicKey = account.paymentPublicKey
  const providerName = account.connector?.name
  const providerIcon = account.connector?.icon

  return (
    <div className="flex flex-col gap-2 text-center items-center break-all w-full">
      {/* Provider */}
      <div className="flex flex-col items-center">
        <span className="font-black text-orange-400">Provider</span>
        <span
          className={clsx(
            'text-lg flex flex-row gap-2 items-center justify-center',
            providerName ? 'text-white' : 'text-gray-500'
          )}
        >
          {providerIcon && <img src={providerIcon} alt="" className="h-6 w-6" />}
          {providerName ?? '--'}
        </span>
      </div>

      {/* Addresses */}
      <div className="flex flex-col md:flex-row items-center gap-6 justify-center">
        <Field label="address (taproot)" value={address} />
        <Field label="payment address" value={paymentAddress} />
      </div>

      {/* Public keys */}
      <div className="flex flex-col md:flex-row gap-6">
        <Field label="public key" value={publicKey} />
        <Field label="payment public key" value={paymentPublicKey} />
      </div>
    </div>
  )
}

