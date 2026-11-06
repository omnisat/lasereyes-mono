import SendBitcoin from './SendBitcoin'
import SignMessage from './SignMessage'
import SwitchNetworkButton from './SwitchNetworkButton'

export default function BitcoinActions() {
  return (
    <div className="flex flex-col items-center w-full gap-2">
      <div className="text-md text-orange-400">bitcoin</div>
      <div className="flex flex-col md:flex-row text-xl gap-2 w-full max-w-xl">
        <SwitchNetworkButton />
        <SendBitcoin />
        <SignMessage />
      </div>
    </div>
  )
}

