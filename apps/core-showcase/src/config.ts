/**
 * lasereyes-core setup — the once-at-startup wiring a real app does.
 *
 * Build the config, register the wallet adapters the app cares about, then
 * start announcement-based discovery + auto-reconnect. Everything else in the
 * showcase consumes the `config` exported here.
 *
 * Mainnet + testnet only. If the wallet's current network is anything else,
 * the actions throw `NetworkNotConfiguredError` — handled in `showcase.ts`.
 */

import { MAINNET, TESTNET } from '@omnisat/lasereyes-client'
import { mempool } from '@omnisat/lasereyes-client/backends/mempool'
import { createLaserEyesConfig } from '@omnisat/lasereyes-core'
import { initialize } from '@omnisat/lasereyes-core/actions'
import { loadUnisatWalletAdapter } from '@omnisat/lasereyes-core/adapters/unisat'
import { loadXverseWalletAdapter } from '@omnisat/lasereyes-core/adapters/xverse'
import { leather } from '@omnisat/lasereyes-core/connectors/leather'
import { okx } from '@omnisat/lasereyes-core/connectors/okx'
import { unisat } from '@omnisat/lasereyes-core/connectors/unisat'

export const config = createLaserEyesConfig({
  chains: [MAINNET, TESTNET],
  // The fully-ported wallets are registered explicitly so they always surface
  // in `state.$connectors` — each button stays disabled until its extension is
  // installed (`isReady() === false`). Xverse is intentionally left out so we
  // can exercise the announcement/discovery flow: its adapter is loaded below,
  // it announces itself, and discovery synthesizes a connector for it into
  // `state.$connectors` — no explicit registration needed.
  connectors: [unisat(), leather(), okx()],
  backends: {
    mainnet: mempool(),
    testnet: mempool(),
  },
})

// Load both adapters. Unisat backs the explicitly-registered connector;
// Xverse has no explicit connector, so loading its adapter is the *only*
// reason it appears — purely via the wallet announcement flow.
loadUnisatWalletAdapter()
loadXverseWalletAdapter()
initialize(config)
