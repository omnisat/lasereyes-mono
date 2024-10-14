import React from 'react'
import './App.css'
import { MAINNET } from '@omnisat/lasereyes-core'
import { LaserEyesProvider } from '@omnisat/lasereyes-react'
import UnisatCard from './unisat-card'

function App() {
  return (
    <LaserEyesProvider config={{ network: MAINNET }}>
      <div className="App">
        <UnisatCard />
      </div>
    </LaserEyesProvider>
  )
}

export default App
