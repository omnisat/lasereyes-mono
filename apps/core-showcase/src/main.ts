/**
 * Core showcase — wires `@omnisat/lasereyes-core` to a minimal UI.
 *
 * The page demonstrates the Phase 10 keystone composition end-to-end:
 *
 *   createLaserEyesConfig({ chains, connectors, transports })
 *     ↓
 *   connect(config, { connectorId })           // lifecycle
 *     ↓
 *   getWalletClient(config)                    // keystone
 *     ↓ defers to connector.getClient (set by `injected({nativeRpc})`)
 *     ↓
 *   getAction(client, sendBtc, 'sendBtc')      // picks override if present
 *     ↓
 *   provider.request('bitcoin_sendBitcoin', …) // one-shot wallet RPC
 *
 * Open devtools console for the full call trace.
 */

import { MAINNET, TESTNET, UnsupportedNetworkError } from '@omnisat/lasereyes-client'
import { createDataSource as createMempoolDataSource } from '@omnisat/lasereyes-client/vendors/mempool'
import {
  broadcastTransaction,
  connect,
  createLaserEyesConfig,
  disconnect,
  getBalance,
  getWalletClient,
  initialize,
  loadAllWallets,
  sendBitcoin,
  signMessage,
  signPsbt,
  switchNetwork,
  unisat,
  xverse,
} from '@omnisat/lasereyes-core'

// ============================================================================
// 1. Build the LaserEyes config
//
// Mainnet + testnet only. If the wallet's current network is anything else,
// the keystone throws `UnsupportedNetworkError` — the UI catches that and
// directs the user to the Switch network buttons.
// ============================================================================

const config = createLaserEyesConfig({
  chains: [MAINNET, TESTNET],
  connectors: [unisat(), xverse()],
  transports: {
    mainnet: [createMempoolDataSource({ network: MAINNET })],
    testnet: [createMempoolDataSource({ network: TESTNET })],
  },
})

const supportedNetworkIds = config.chains.map(c => c.id)

// Kick off announcement-based discovery + auto-reconnect (no-op on fresh load).
loadAllWallets()
initialize(config)

// ============================================================================
// 2. UI plumbing
// ============================================================================

const $ = <T extends HTMLElement = HTMLElement>(id: string) => {
  const el = document.getElementById(id)
  if (!el) throw new Error(`element #${id} missing`)
  return el as T
}

const logEl = $('log') as HTMLPreElement
const log = (level: 'info' | 'ok' | 'warn' | 'err', ...parts: unknown[]) => {
  const ts = new Date().toLocaleTimeString()
  const cls = level === 'info' ? '' : level
  const line = parts.map(p => (typeof p === 'string' ? p : JSON.stringify(p, null, 2))).join(' ')
  logEl.innerHTML += `<span class="ts">${ts}</span> ${cls ? `<span class="${cls}">` : ''}${line}${
    cls ? '</span>' : ''
  }\n`
  logEl.scrollTop = logEl.scrollHeight
  // Mirror to console for the deeper trace.
  // biome-ignore lint/suspicious/noConsole: showcase trace
  console.log(`[${level}]`, ...parts)
}

const setStatus = (text: string, live = false) => {
  const el = $('status')
  el.textContent = text
  el.classList.toggle('live', live)
  el.classList.toggle('idle', !live)
}

const setAccountFields = () => {
  const account = config.state.$account.get()
  const networkId = config.state.$networkId.get()
  const connector = config.state.$connector.get()
  $('address').textContent = account?.getAddress() ?? '—'
  const supported = supportedNetworkIds.includes(networkId as never)
  $('network').textContent = networkId ? `${networkId}${supported ? '' : ' (unsupported)'}` : '—'
  $('active-connector').textContent = connector?.id ?? '—'
  // The override is the visible bit of Phase 10 — surface it.
  $('has-override').textContent = connector?.getClient ? 'yes (nativeRpc)' : 'no (composed default)'
  renderSwitchNetwork(networkId)
}

const renderSwitchNetwork = (active: string | undefined) => {
  const host = $('switch-network')
  host.innerHTML = ''
  if (!config.state.$connector.get()) return
  for (const c of config.chains) {
    const btn = document.createElement('button')
    btn.textContent = c.id
    btn.disabled = c.id === active
    btn.onclick = async () => {
      log('info', `→ switchNetwork(config, '${c.id}')`)
      try {
        const result = await switchNetwork(config, c.id)
        log('ok', `← wallet now on '${result.id}'`)
      } catch (e) {
        log('err', `✗ switchNetwork failed:`, (e as Error).message)
      }
    }
    host.appendChild(btn)
  }
}

// ============================================================================
// 3. Render available connectors
// ============================================================================

const connectorsEl = $('connectors')
const renderConnectors = () => {
  const all = Object.values(config.state.$connectors.get())
  connectorsEl.innerHTML = ''
  if (all.length === 0) {
    connectorsEl.innerHTML = '<span class="kv">No wallets announced.</span>'
    return
  }
  for (const c of all) {
    const btn = document.createElement('button')
    btn.textContent = c.name
    btn.disabled = !c.isReady()
    btn.onclick = async () => {
      log('info', `→ connect(config, { connectorId: '${c.id}' })`)
      try {
        const result = await connect(config, { connectorId: c.id })
        log('ok', `← connected on '${result.networkId}': ${result.account.getAddress()}`)
        // UI fields update via the reactive subscriptions on $account /
        // $networkId / $status — no imperative refresh needed here.
      } catch (e) {
        log('err', `✗ connect failed:`, (e as Error).message)
      }
    }
    connectorsEl.appendChild(btn)
  }
}

// Re-render when announcements arrive (EIP-6963-style discovery).
config.state.$connectors.subscribe(renderConnectors)
renderConnectors()

// ============================================================================
// 3b. Reactive subscriptions
//
// When the wallet emits accountsChanged or networkChanged after the user
// switches accounts/networks in the wallet UI, core's connect()-time event
// subscriptions push the changes into these atoms. We mirror those changes
// to the UI here.
// ============================================================================

config.state.$account.subscribe(next => {
  log('info', `state.$account → ${next ? next.getAddress() : 'undefined'}`)
  setAccountFields()
})

config.state.$networkId.subscribe(next => {
  log('info', `state.$networkId → '${next}'`)
  const supported = supportedNetworkIds.includes(next as never)
  if (!supported) {
    log(
      'warn',
      `wallet on '${next}' which is not in config.chains [${supportedNetworkIds.join(', ')}] — actions will throw UnsupportedNetworkError`
    )
  }
  setAccountFields()
})

config.state.$status.subscribe(next => {
  setStatus(next, next === 'connected')
  if (next === 'disconnected') {
    enableWriteButtons(false)
    ;($('disconnect') as HTMLButtonElement).disabled = true
  } else if (next === 'connected') {
    enableWriteButtons(true)
    ;($('disconnect') as HTMLButtonElement).disabled = false
  }
})

// ============================================================================
// 4. Action handlers
// ============================================================================

const enableWriteButtons = (on: boolean) => {
  for (const id of ['get-balance', 'send', 'sign-message', 'sign-psbt']) {
    ;($(id) as HTMLButtonElement).disabled = !on
  }
}

$('disconnect').onclick = async () => {
  log('info', '→ disconnect(config)')
  await disconnect(config)
  log('ok', '← disconnected')
  // UI updates flow from the $status subscription.
}

$('get-balance').onclick = async () => {
  const account = config.state.$account.get()
  if (!account) return
  const address = account.getAddress()
  log('info', `→ getBalance(config, '${address}')`)
  try {
    const sats = await getBalance(config, address)
    log('ok', `← balance: ${sats} sats`)
    $('balance').textContent = sats
  } catch (e) {
    log('err', `✗ getBalance failed:`, (e as Error).message)
  }
}

$('send').onclick = async () => {
  const to = ($('send-to') as HTMLInputElement).value.trim()
  const amount = Number(($('send-amount') as HTMLInputElement).value)
  if (!to || !amount) {
    log('warn', 'fill in `to` and `amount`')
    return
  }
  log('info', `→ sendBitcoin(config, '${to}', ${amount})`)
  log(
    'info',
    `  ├─ getWalletClient(config) → connector.getClient(${
      config.state.$connector.get()?.getClient ? 'override applied' : 'no override; bare client'
    })`
  )
  log('info', `  └─ getAction(client, sendBtc, 'sendBtc') → dispatching…`)
  try {
    const txId = await sendBitcoin(config, to, amount)
    log('ok', `← txId: ${txId}`)
  } catch (e) {
    if (e instanceof UnsupportedNetworkError) {
      log('err', `✗ ${e.message}`)
      log('info', `  → use the "Switch network" buttons to move the wallet to a supported chain.`)
    } else {
      log('err', `✗ sendBitcoin failed:`, (e as Error).message)
    }
  }
}

$('sign-message').onclick = async () => {
  const message = ($('msg') as HTMLInputElement).value
  if (!message) {
    log('warn', 'enter a message')
    return
  }
  log('info', `→ signMessage(config, '${message}')`)
  try {
    const sig = await signMessage(config, message)
    log('ok', `← signature: ${sig}`)
  } catch (e) {
    if (e instanceof UnsupportedNetworkError) {
      log('err', `✗ ${e.message}`)
    } else {
      log('err', `✗ signMessage failed:`, (e as Error).message)
    }
  }
}

$('sign-psbt').onclick = async () => {
  const psbt = ($('psbt') as HTMLTextAreaElement).value.trim()
  if (!psbt) {
    log('warn', 'paste a PSBT hex')
    return
  }
  log('info', `→ signPsbt(config, …, { finalize: true })`)
  try {
    const signed = await signPsbt(config, psbt, { finalize: true })
    log('ok', `← signed:`, signed)
    if (signed.txHex) {
      log('info', `→ broadcastTransaction(config, signedTxHex)`)
      try {
        const txId = await broadcastTransaction(config, signed.txHex)
        log('ok', `← txId: ${txId}`)
      } catch (e) {
        log('warn', `broadcast skipped:`, (e as Error).message)
      }
    }
  } catch (e) {
    log('err', `✗ signPsbt failed:`, (e as Error).message)
  }
}

// ============================================================================
// 5. Inspect the keystone return shape on-demand (devtools convenience)
// ============================================================================

// Expose the keystone for poking around in the console.
;(window as unknown as { laserEyes: unknown }).laserEyes = {
  config,
  getWalletClient: () => getWalletClient(config),
  // Try this in devtools to see the override-cascade live:
  //   const wc = await laserEyes.getWalletClient()
  //   wc.config.account?.getAddress()
}

setAccountFields()
log('info', 'config built. chains=[mainnet], connectors=[unisat, xverse]')
log('info', 'Connect a wallet to begin. Devtools window.laserEyes.* exposes the config + keystone.')
