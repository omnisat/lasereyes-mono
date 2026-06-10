/**
 * Root of the React showcase. Wraps everything in `<LaserEyesProvider>` (the
 * one piece of LaserEyes-specific setup a real app does at the top) and lays
 * the panels out on the same grid as the Alpine showcase.
 *
 * The hooks are spread across three panels so every one of the 17 exported
 * hooks gets used the way an app would actually reach for it:
 *
 *  - ConnectionPanel → useStatus, useConnectors, useConnect, useConnector,
 *    useDisconnect, useAccount, useNetwork, useConfig
 *  - ReadsPanel      → useBalance, useUtxos, useFeeRates, useTransaction
 *  - WritesPanel     → useSendBitcoin, useSignMessage, useSignPsbt,
 *    useBroadcastPsbt, useBroadcastTransaction (+ useConfig/useAccount/useUtxos/
 *    useFeeRates to assemble a PSBT)
 */

import { LaserEyesProvider } from '@omnisat/lasereyes-react'
import { ConnectionPanel } from './ConnectionPanel'
import { config } from './config'
import { ReadsPanel } from './ReadsPanel'
import { WritesPanel } from './WritesPanel'

export function App() {
  return (
    <LaserEyesProvider config={config}>
      <div className="layout">
        <div className="header">
          <h1>LaserEyes React — Showcase</h1>
          <div className="kv">
            Every <code>@omnisat/lasereyes-react</code> hook, driven the way an app would use them.
            The provider owns <code>initialize</code>/<code>dispose</code>; hooks read the shared
            query cache and the connection store. · <a href="/">← vanilla-core (Alpine) showcase</a>
          </div>
        </div>

        <ConnectionPanel />
        <ReadsPanel />
        <WritesPanel />
      </div>
    </LaserEyesProvider>
  )
}
