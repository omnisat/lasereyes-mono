/**
 * lasereyes setup for the React path — the once-at-startup wiring.
 *
 * Same config as the vanilla-core showcase (`../config.ts`), with two
 * deliberate differences worth calling out as the React-binding contract:
 *
 *  1. We do NOT call `initialize(config)` here. `<LaserEyesProvider>` owns the
 *     `initialize` / `dispose` lifecycle (it runs them in an effect keyed on the
 *     config). Calling it here too would double-initialize.
 *
 *  2. We `declare module '@omnisat/lasereyes-react'` to register this config's
 *     type. That's the wagmi-style opt-in: once declared, the context-driven
 *     hooks narrow `network` / `chainId` to `'mainnet' | 'testnet'` without us
 *     passing `{ config }` to every call.
 *
 * Build the config once, at module scope, so its identity is stable across
 * renders (the provider keys its effect on it).
 */

import { MAINNET, TESTNET } from '@omnisat/lasereyes-client'
import { mempool } from '@omnisat/lasereyes-client/backends/mempool'
import { createLaserEyesConfig } from '@omnisat/lasereyes-core'
import { loadUnisatWalletAdapter } from '@omnisat/lasereyes-core/adapters/unisat'
import { loadXverseWalletAdapter } from '@omnisat/lasereyes-core/adapters/xverse'
import { leather } from '@omnisat/lasereyes-core/connectors/leather'
import { okx } from '@omnisat/lasereyes-core/connectors/okx'
import { unisat } from '@omnisat/lasereyes-core/connectors/unisat'

export const config = createLaserEyesConfig({
  chains: [MAINNET, TESTNET],
  // The fully-ported wallets are registered explicitly so they always appear
  // in `useConnectors()` — their button stays disabled (`isReady() === false`)
  // until the extension is installed. Unisat/Leather/OKX all carry `nativeRpc`
  // overrides (the "nativeRpc override" pill in the UI). Xverse is deliberately
  // *not* listed here so it can demonstrate the announcement/discovery path
  // (its adapter loads below).
  connectors: [unisat(), leather(), okx()],
  backends: {
    mainnet: mempool(),
    testnet: mempool(),
  },
})

// Load the adapters so they can announce themselves to discovery. Unisat backs
// its explicit connector; Xverse has no explicit connector, so loading its
// adapter is the *only* reason it surfaces — purely via the announcement flow.
// (The provider calls `initialize(config)`, which wires discovery + auto-reconnect.)
loadUnisatWalletAdapter()
loadXverseWalletAdapter()

// Opt into typed config for every context-driven hook in this app.
declare module '@omnisat/lasereyes-react' {
  interface Register {
    config: typeof config
  }
}
