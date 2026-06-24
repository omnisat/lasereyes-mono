import { combineBackends, MAINNET, TESTNET } from '@omnisat/lasereyes-client'
import { mempool } from '@omnisat/lasereyes-client/backends/mempool'
import { sandshrew } from '@omnisat/lasereyes-client/backends/sandshrew'
import { createLaserEyesConfig } from '@omnisat/lasereyes-core'
import {
  leather,
  okx,
  opNet,
  orange,
  oyl,
  phantom,
  unisat,
  wizz,
  xverse,
} from '@omnisat/lasereyes-core/connectors'

/**
 * The LaserEyes config — built once at module scope so its identity is stable.
 * Registered connectors always surface; `loadAllWallets()` (called in the
 * provider) lets installed wallets announce themselves for discovery.
 */
export const config = createLaserEyesConfig({
  chains: [MAINNET, TESTNET],
  connectors: [
    unisat(),
    xverse(),
    leather(),
    okx(),
    oyl(),
    orange(),
    phantom(),
    opNet(),
    wizz(),
  ],
  backends: {
    mainnet: combineBackends(
      sandshrew({ apiKey: '348ae3256c48c15cc99dcb056d2f78df' }),
      mempool()
    ),
    testnet: mempool(),
  },
})
