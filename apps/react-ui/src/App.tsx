import React from 'react'
import './App.css'
import { LaserEyesProvider, MAINNET } from '@omnisat/lasereyes'
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
