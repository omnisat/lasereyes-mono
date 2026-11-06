import { LaserEyesLogo, useAccount } from '@omnisat/lasereyes-react'
import AccountInfo from './AccountInfo'
import Balance from './Balance'
import BitcoinActions from './BitcoinActions'
import Header from './Header'
import NetworkSwitcher from './NetworkSwitcher'
import PsbtSection from './PsbtSection'
import SupportedWallets from './SupportedWallets'

type colorsType = 'orange' | 'pink' | 'blue' | 'darkBlue' | 'yellow' | 'green'

const App = () => {
  const account = useAccount()
  const address = account.address

  return (
    <div className="flex flex-col gap-4 w-full mt-12 mb-24 max-w-[1200px] px-4 md:px-12 font-windows">
      {/* Header */}
      <Header />

      {/* Supported wallets */}
      <SupportedWallets />

      {/* Main container */}
      <div className="border border-[#3c393f] w-full text-xl">
        <div className="flex justify-end p-2">
          <NetworkSwitcher />
        </div>

        <div className="flex flex-col gap-4 text-center items-center break-all p-2">
          {/* Account info: Provider, addresses, public keys */}
          <AccountInfo />

          {/* Balance */}
          <Balance />

          {/* Bitcoin actions: switch network, send Btc, sign message */}
          <BitcoinActions />

          {/* PSBT actions: unsigned input, sign, push */}
          <PsbtSection />
        </div>

        <div className="flex flex-row items-center gap-4">
          <LaserEyesLogo
            className="m-4"
            width={48}
            color={address ? ('green' as colorsType) : ('orange' as colorsType)}
          />
          <div className="grow" />
        </div>
      </div>
    </div>
  )
}

export default App
