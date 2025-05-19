import './App.css'
import { LaserEyesProvider, MAINNET, SIGNET } from '@omnisat/lasereyes'
import UnisatCard from './unisat-card'
import UTXOViewer from './utxo-viewer'

function App() {
  return (
    <LaserEyesProvider config={{ network: SIGNET }}>
      <div className="App">
        <UnisatCard />
        <UTXOViewer />
      </div>
    </LaserEyesProvider>
  )
}

export default App
