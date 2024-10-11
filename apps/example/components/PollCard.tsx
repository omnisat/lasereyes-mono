import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { useLaserEyes } from '@omnisat/lasereyes'
import { Button } from '@/components/ui/button'
import { PollResults } from '@/components/PollResults'

const PollCard = () => {
  const { address } = useLaserEyes()
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pollResults, setPollResults] = useState<any[]>([])

  const wallets = ['WIZ', 'ORANGE WALLET']

  useEffect(() => {
    setSelectedWallet(null)
    setPollResults([])
    setSubmitted(false)
  }, [address])

  const handleSubmit = async () => {
    if (selectedWallet) {
      try {
        const response = await fetch('/api/submit-poll', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ wallet: selectedWallet, address }),
        })

        if (response.ok) {
          const data = await response.json()
          setPollResults(data)
          setSubmitted(true)
        } else {
          const errorData = await response.json()
          setError(errorData.error)
        }
      } catch (error) {
        setError('An unexpected error occurred')
      }
    } else {
      setError('Please select a wallet')
    }
  }

  return (
    <Card className="flex flex-col shrink shadow-xl w-full max-w-[346px] items-center p-6 space-y-4 bg-[#323035] text-[#fff] border-[#3c393f]">
      <CardHeader>
        <CardTitle
          className={'break-words max-w-[200px] text-center text-white'}
        >
          Which wallet should we support next?
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center h-full space-y-2">
        {!submitted && pollResults.length === 0 ? (
          <>
            {wallets.map((wallet) => (
              <div key={wallet}>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="wallet"
                    value={wallet}
                    onChange={() => setSelectedWallet(wallet)}
                  />
                  <span>{wallet}</span>
                </label>
              </div>
            ))}
            <Button
              className={'w-full bg-[#232225]'}
              disabled={submitted || !address || !selectedWallet}
              variant={!address ? 'secondary' : 'default'}
              onClick={handleSubmit}
            >
              {submitted
                ? 'Thank You!'
                : !address
                  ? 'Connect To Vote'
                  : 'Submit'}
            </Button>
            {error && <p className="text-red-500">{error}</p>}
          </>
        ) : (
          <div className={'h-full w-full'}>
            <PollResults pollResults={pollResults} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default PollCard
