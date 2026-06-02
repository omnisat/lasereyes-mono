import { combineBackends } from '@omnisat/lasereyes-client'
import { mempool } from '@omnisat/lasereyes-client/backends/mempool'
import { sandshrew } from '@omnisat/lasereyes-client/backends/sandshrew'
import { createLaserEyesConfig, mainnet, testnet } from '@omnisat/lasereyes-core'

const config = createLaserEyesConfig({
  chains: [mainnet, testnet],
  backends: {
    // sandshrew primary (full protocol coverage), mempool fallback for base
    // BTC reads. The network is injected from the map key — no need to repeat
    // it on each backend.
    mainnet: combineBackends(sandshrew(), mempool()),
    testnet: mempool(),
  },
})

// `config.backends.mainnet` is a single, fully-resolved ChainBackend.
export { config }
