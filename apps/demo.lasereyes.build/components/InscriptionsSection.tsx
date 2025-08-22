import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { getMempoolSpaceUrl } from '@/lib/urls'
import {
  type MAINNET,
  type TESTNET,
  useLaserEyes,
  type Inscription,
} from '@kevinoyl/lasereyes'

const InscriptionsSection = () => {
  const {
    provider,
    inscribe,
    address,
    network,
    getInscriptions,
    sendInscriptions,
    connected,
  } = useLaserEyes()
  const [inscriptions, setInscriptions] = useState<Inscription[]>([])
  const [inscriptionText, setInscriptionText] = useState(
    'Inscribed 100% clientside with Laser Eyes'
  )
  const [selectedInscriptionIds, setSelectedInscriptionIds] = useState<
    string[]
  >([])
  const [recipientAddress, setRecipientAddress] = useState('')

  // Fetch inscriptions when address changes
  useEffect(() => {
    if (provider && connected && network) {
      getInscriptions().then((data) => {
        console.log(data)
        setInscriptions(data)
      })
    }
  }, [provider, getInscriptions, connected, network])

  useEffect(() => {
    if (!address) {
      setInscriptions([])
    }
  }, [address])

  const inscribeWithWallet = async () => {
    try {
      const inscriptionTxId = await inscribe(
        Buffer.from(inscriptionText).toString('base64'),
        'text/plain'
      )
      toast.success(
        <span className={'flex flex-col gap-1 items-center justify-center'}>
          <span className={'font-black'}>View on mempool.space</span>
          <a
            target="_blank"
            href={`${getMempoolSpaceUrl(network as typeof MAINNET | typeof TESTNET)}/tx/${inscriptionTxId}`}
            className={'underline text-blue-600 text-xs'}
            rel="noreferrer"
          >
            {inscriptionTxId}
          </a>
        </span>
      )
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    }
  }

  const toggleInscriptionSelection = (inscriptionId: string) => {
    setSelectedInscriptionIds((prevSelected) => {
      if (prevSelected.includes(inscriptionId)) {
        return prevSelected.filter((id) => id !== inscriptionId)
      }
      return [...prevSelected, inscriptionId]
    })
  }

  const sendSelectedInscriptions = async () => {
    if (!recipientAddress.trim()) {
      toast.error('Please enter a recipient address')
      return
    }

    if (selectedInscriptionIds.length === 0) {
      toast.error('Please select at least one inscription to send')
      return
    }

    try {
      const txId = await sendInscriptions(
        selectedInscriptionIds,
        recipientAddress
      )

      // Clear selections after successful send
      setSelectedInscriptionIds([])
      setRecipientAddress('')

      toast.success(
        <span className={'flex flex-col gap-1 items-center justify-center'}>
          <span className={'font-black'}>Inscriptions sent!</span>
          <a
            target="_blank"
            href={`${getMempoolSpaceUrl(network as typeof MAINNET | typeof TESTNET)}/tx/${txId}`}
            className={'underline text-blue-600 text-xs'}
            rel="noreferrer"
          >
            {txId}
          </a>
        </span>
      )
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    }
  }

  return (
    <div className={'flex flex-col gap-2'}>
      <div className="text-md text-orange-400">inscriptions</div>
      <div className="flex flex-col gap-2 items-center justify-center">
        <div className="flex flex-wrap gap-1">
          {inscriptions?.slice(0, 4).map((insc) => (
            <div
              key={insc.id}
              className={cn(
                'relative w-20 h-20 cursor-pointer border-2',
                selectedInscriptionIds.includes(insc.inscriptionId)
                  ? 'border-orange-400'
                  : 'border-transparent'
              )}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  toggleInscriptionSelection(insc.inscriptionId)
                }
              }}
              onClick={() => toggleInscriptionSelection(insc.inscriptionId)}
            >
              <iframe
                src={insc.preview}
                className="w-full h-full overflow-hidden overflow-y-hidden"
                title={insc.location}
              />
              {/* Transparent overlay to capture clicks */}
              <div
                className="absolute inset-0 z-10"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleInscriptionSelection(insc.inscriptionId)
                }}
                onKeyUp={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    toggleInscriptionSelection(insc.inscriptionId)
                  }
                }}
              />
              {selectedInscriptionIds.includes(insc.inscriptionId) && (
                <div className="absolute top-0 right-0 bg-orange-400 text-white w-5 h-5 flex items-center justify-center rounded-bl-md z-20">
                  ✓
                </div>
              )}
            </div>
          ))}
        </div>

        <Input
          className={cn(
            'w-full h-full bg-[#232225] disabled:text-[#737275] border border-gray-500 text-center'
          )}
          placeholder={'Enter recipient address...'}
          value={recipientAddress}
          disabled={!provider}
          onChange={(e) => setRecipientAddress(e.target.value)}
        />

        <Button
          disabled={!provider || selectedInscriptionIds.length === 0}
          className={'w-full bg-[#232225] disabled:text-[#737275]'}
          onClick={sendSelectedInscriptions}
        >
          Send Inscriptions ({selectedInscriptionIds.length})
        </Button>

        <div className="border-t border-gray-700 w-full my-2 pt-2">
          <Input
            className={cn(
              'w-full h-full bg-[#232225] disabled:text-[#737275] min-w-[200px] border border-gray-500 text-center'
            )}
            placeholder={'Inscribe some text...'}
            value={inscriptionText}
            disabled={!provider}
            onChange={(e) => setInscriptionText(e.target.value)}
          />
          <Button
            className={'w-full mt-2 bg-[#232225] disabled:text-[#737275]'}
            disabled={!provider}
            variant={!provider ? 'secondary' : 'default'}
            onClick={() => (!provider ? null : inscribeWithWallet())}
          >
            inscribe
          </Button>
        </div>
      </div>
    </div>
  )
}

export default InscriptionsSection
