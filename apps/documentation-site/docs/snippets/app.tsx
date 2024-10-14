// MUST be rendered client-side
import { LaserEyesProvider } from '@omnisat/lasereyes'
import ConnectWallet from '@/components/ConnectWallet'

function App() {
    return (
        <LaserEyesProvider config={{
            network: 'mainnet'
        }}>
            <ConnectWallet />
        </LaserEyesProvider>
    )
}
