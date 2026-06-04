/**
 * Entry point — register the Alpine component and start Alpine.
 *
 * Importing `./showcase` pulls in `./config`, whose top-level
 * `initialize(config)` runs the discovery + auto-reconnect side effect before
 * Alpine mounts. The flow this exercises:
 *
 *   createLaserEyesConfig → connect(config) → getWalletClient(config)
 *     → Connector.getClient override → getAction dispatch → wallet RPC
 */

import { getWalletClient } from '@omnisat/lasereyes-core'
import Alpine from 'alpinejs'
import { config } from './config'
import { showcase } from './showcase'

declare global {
  interface Window {
    Alpine: typeof Alpine
    laserEyes: { config: typeof config; getWalletClient: () => unknown }
  }
}

// Devtools convenience — poke the keystone live:
//   const wc = await laserEyes.getWalletClient()
//   wc.config.account?.getAddress()
window.laserEyes = { config, getWalletClient: () => getWalletClient(config) }

Alpine.data('showcase', showcase)
window.Alpine = Alpine
Alpine.start()
