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

import { MAINNET } from '@omnisat/lasereyes-client'
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
  unisat,
  xverse,
} from '@omnisat/lasereyes-core'

// ============================================================================
// 1. Build the LaserEyes config
// ============================================================================

const config = createLaserEyesConfig({
  chains: [MAINNET],
  connectors: [unisat(), xverse()],
  transports: {
    mainnet: [createMempoolDataSource({ network: MAINNET })],
  },
})

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
  const line = parts
    .map((p) => (typeof p === 'string' ? p : JSON.stringify(p, null, 2)))
    .join(' ')
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
  $('network').textContent = networkId ?? '—'
  $('active-connector').textContent = connector?.id ?? '—'
  // The override is the visible bit of Phase 10 — surface it.
  $('has-override').textContent = connector?.getClient ? 'yes (nativeRpc)' : 'no (composed default)'
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
        await connect(config, { connectorId: c.id })
        const result = config.state.$account.get()
        log('ok', `← connected. account.address=${result?.getAddress()}`)
        setStatus(`connected (${c.id})`, true)
        setAccountFields()
        enableWriteButtons(true)
        ;($('disconnect') as HTMLButtonElement).disabled = false
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
  setStatus('idle', false)
  setAccountFields()
  enableWriteButtons(false)
  ;($('disconnect') as HTMLButtonElement).disabled = true
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
    log('err', `✗ sendBitcoin failed:`, (e as Error).message)
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
    log('err', `✗ signMessage failed:`, (e as Error).message)
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
log(
  'info',
  'Connect a wallet to begin. Devtools window.laserEyes.* exposes the config + keystone.'
)
