import { useAccount, useBroadcastPsbt, useNetwork, useSignPsbt } from '@omnisat/lasereyes-react'
import { clsx } from 'clsx'
import { Upload } from 'lucide-react'
import { useState } from 'react'
import { FaBroadcastTower } from 'react-icons/fa'
import { FaSignature } from 'react-icons/fa6'
import ClickToCopy from '@/components/ClickToCopy'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { getMempoolSpaceUrl } from '@/lib/urls'
import { truncateString } from '@/lib/utils'

export default function PsbtSection() {
  const account = useAccount()
  const isConnected = account.status === 'connected'
  const { network } = useNetwork()
  const [unsignedPsbt, setUnsignedPsbt] = useState<string>('')
  const [finalize, setFinalize] = useState(false)
  const [broadcast, setBroadcast] = useState(false)

  const {
    signPsbt,
    data: signPsbtResult,
    error: signPsbtError,
    isLoading: isSigning,
  } = useSignPsbt()

  const {
    broadcastPsbt,
    data: broadcastTxId,
    error: broadcastPsbtError,
    isLoading: isBroadcasting,
  } = useBroadcastPsbt()

  const [localSignError, setLocalSignError] = useState<string | null>(null)
  const [localPushError, setLocalPushError] = useState<string | null>(null)

  const signedPsbt = signPsbtResult?.psbtHex
  const txId = broadcastTxId || signPsbtResult?.txId

  const handleSignUnsignedPsbt = () => {
    setLocalSignError(null)
    if (!unsignedPsbt) {
      setLocalSignError('No unsigned PSBT')
      return
    }
    signPsbt({
      psbt: unsignedPsbt,
      options: { finalize, broadcast },
    })
  }

  const handlePush = () => {
    setLocalPushError(null)
    if (!signedPsbt) {
      setLocalPushError('No signed PSBT')
      return
    }
    broadcastPsbt({ psbt: signedPsbt })
  }

  const signErrorMessage = localSignError || signPsbtError?.message
  const pushErrorMessage = localPushError || broadcastPsbtError?.message

  return (
    <div className="flex flex-col items-center w-full max-w-xl gap-2">
      {/* PSBT input */}
      <div className="flex flex-col items-center w-full">
        <span className="font-black text-orange-400">unsigned Psbt</span>
        <Input
          type="text"
          className="bg-transparent text-lg text-center border-[#3c393f]"
          placeholder="Paste a PSBT hex to sign"
          value={unsignedPsbt}
          onChange={e => setUnsignedPsbt(e.target.value)}
        />
        {signedPsbt && (
          <span className="text-xs text-gray-400 mt-1">
            signed: {truncateString(signedPsbt, 32)} <ClickToCopy value={signedPsbt} />
          </span>
        )}
      </div>

      {/* PSBT actions */}
      <div className="flex flex-col gap-2 w-full mt-2">
        <span className="w-full flex flex-col md:flex-row px-2 py-1 items-center justify-center gap-2">
          <Button
            className="w-full gap-2 bg-[#232225] disabled:text-[#737275]"
            disabled={!isConnected || !unsignedPsbt || isSigning}
            variant={!isConnected ? 'secondary' : 'default'}
            size="lg"
            onClick={handleSignUnsignedPsbt}
          >
            <FaSignature size={18} />
            {isSigning ? 'signing...' : `sign${broadcast ? ' & Send' : ''} Psbt`}
          </Button>
          <Button
            className={clsx(
              'shrink bg-[#232225] gap-2 disabled:text-gray-500',
              finalize ? 'text-white border-gray-500' : 'bg-[#232225]'
            )}
            disabled={!isConnected || !unsignedPsbt}
            variant={finalize ? 'outline' : 'default'}
            size="lg"
            onClick={() => {
              setFinalize(!finalize)
              setBroadcast(false)
            }}
          >
            finalize
          </Button>
          <Button
            className={clsx(
              'gap-2 shrink disabled:text-gray-500',
              broadcast ? 'text-orange-400' : 'bg-[#232225]'
            )}
            size="lg"
            disabled={!isConnected || !finalize || !unsignedPsbt}
            variant="ghost"
            onClick={() => setBroadcast(!broadcast)}
          >
            <FaBroadcastTower size={16} />
            broadcast
          </Button>
        </span>

        {signErrorMessage && (
          <span className="text-xs text-red-500 text-center font-normal">{signErrorMessage}</span>
        )}

        <Button
          className="w-full gap-2 bg-[#232225] disabled:text-[#737275]"
          disabled={!isConnected || !signedPsbt || isBroadcasting}
          variant={!isConnected ? 'secondary' : 'default'}
          onClick={handlePush}
        >
          <Upload size={16} />
          {isBroadcasting ? 'pushing...' : 'push Psbt'}
        </Button>

        {pushErrorMessage && (
          <span className="text-xs text-red-500 text-center font-normal">{pushErrorMessage}</span>
        )}

        {txId && (
          <span className="text-xs text-center font-normal">
            txid:{' '}
            <a
              target="_blank"
              rel="noreferrer"
              href={`${getMempoolSpaceUrl(network)}/tx/${txId}`}
              className="underline text-blue-600"
            >
              {txId}
            </a>
          </span>
        )}
      </div>
    </div>
  )
}
