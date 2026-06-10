/**
 * The Alpine component backing `index.html`.
 *
 * Two responsibilities, kept separate:
 *
 *  1. `init()` bridges lasereyes-core's nanostores into Alpine's reactive
 *     state — the same job a React/Vue binding does, in ~15 lines. The view
 *     only ever sees flat primitives (strings/booleans), never library types.
 *
 *  2. Each method below is a thin wrapper around a single lasereyes-core
 *     action. They all thread `config` as the first argument — that
 *     repetition is the library's actual call shape, left visible on purpose.
 */

import { NetworkNotConfiguredError } from '@omnisat/lasereyes-client'
import { buildSendBtcPsbt } from '@omnisat/lasereyes-client/utils'
import {
  broadcastTransaction,
  connect,
  disconnect,
  getAddressBalance,
  getAddressUtxos,
  getRecommendedFees,
  sendBtc,
  signMessage,
  signPsbt,
  switchNetwork,
} from '@omnisat/lasereyes-core/actions'
import { config } from './config'

// View-model shapes — local to the showcase, not from the library.
type LogLevel = 'info' | 'ok' | 'warn' | 'err'
interface LogEntry {
  ts: string
  level: LogLevel
  text: string
}
interface ConnectorView {
  id: string
  name: string
  ready: boolean
  /** True when this connector arrived via announcement, not explicit config. */
  discovered: boolean
}

// The set of configured network ids, derived from `config` (not imported).
const supportedNetworkIds = config.chains.map(c => c.id)
// Ids of the connectors we registered explicitly. Anything in $connectors
// that isn't here got there through the announcement/discovery flow.
const explicitConnectorIds = config.connectors.map(c => c.id)
// Network-id type, *derived* from the value above rather than imported — so
// `switchNetwork(id)` stays type-safe without reaching into library types.
type ConfiguredNetworkId = (typeof supportedNetworkIds)[number]

export function showcase() {
  return {
    // ── reactive view state (projected from the stores in init) ───────────
    status: 'disconnected',
    address: '—',
    networkId: '',
    networkSupported: true,
    connectorId: '—',
    hasOverride: false,
    hasConnector: false,
    balance: '—',
    connectors: [] as ConnectorView[],
    chains: supportedNetworkIds,

    // ── form inputs (x-model) ─────────────────────────────────────────────
    sendTo: '',
    sendAmount: 0,
    message: '',
    psbt: '',

    // Finalized tx hex from the last signPsbt — broadcast is a separate,
    // deliberate step (the showcase never auto-submits).
    signedTx: '',

    // ── flow trace ────────────────────────────────────────────────────────
    log: [] as LogEntry[],

    /**
     * Bridge lasereyes-core's two nanostores into reactive Alpine state.
     * Both subscriptions fire synchronously on subscribe, so the initial
     * render is correct with no imperative kick.
     */
    init() {
      config.state.$connectors.subscribe(registry => {
        this.connectors = Object.values(registry).map(c => ({
          id: c.id,
          name: c.name,
          ready: c.isReady(),
          discovered: !explicitConnectorIds.includes(c.id),
        }))
      })

      config.state.$connection.subscribe(({ status, account, networkId, connector }) => {
        this.status = status
        this.address = account?.getAddress() ?? '—'
        this.networkId = networkId
        this.networkSupported = supportedNetworkIds.includes(networkId)
        this.connectorId = connector?.id ?? '—'
        this.hasOverride = connector?.getClient !== undefined
        this.hasConnector = connector !== undefined
      })

      this.note(
        'info',
        `config ready · chains=[${this.chains.join(', ')}] · explicit connectors=[${explicitConnectorIds.join(', ')}]`
      )
      this.note(
        'info',
        'Xverse is unregistered — it should appear below only via the announcement flow.'
      )
    },

    // ── one method per lasereyes-core action ──────────────────────────────

    connect(connectorId: string) {
      return this.run(`connect(config, { connectorId: '${connectorId}' })`, async () => {
        const result = await connect(config, { connectorId })
        return `connected on '${result.networkId}' as ${result.account.getAddress()}`
      })
    },

    disconnect() {
      return this.run('disconnect(config)', async () => {
        await disconnect(config)
        return 'disconnected'
      })
    },

    getBalance() {
      const address = config.state.$connection.get().account?.getAddress()
      if (!address) return
      return this.run(`getAddressBalance(config, '${address}')`, async () => {
        const sats = await getAddressBalance(config, address)
        this.balance = String(sats)
        return `balance: ${sats} sats`
      })
    },

    send() {
      const to = this.sendTo.trim()
      const amount = Number(this.sendAmount)
      if (!to || !amount) return this.note('warn', 'fill in recipient and amount')
      return this.run(`sendBtc(config, '${to}', ${amount})`, async () => {
        const txId = await sendBtc(config, to, amount)
        return `txId: ${txId}`
      })
    },

    signMessage() {
      if (!this.message) return this.note('warn', 'enter a message')
      return this.run(`signMessage(config, '${this.message}')`, async () => {
        const signature = await signMessage(config, this.message)
        return `signature: ${signature}`
      })
    },

    /**
     * Build an unsigned PSBT and drop it into the Sign PSBT box, so the
     * signing path is testable without pasting hex by hand. It's a
     * self-send (recipient = change = your own payment address) of a tiny
     * amount, so it's safe to sign and broadcast.
     */
    generatePsbt() {
      const conn = config.state.$connection.get()
      // `status === 'connected'` narrows account to WalletAccount — so
      // getAddress()/getPublicKey() are both available straight off connection
      // state, no capture-at-connect and no library-type import.
      if (conn.status !== 'connected') return this.note('warn', 'connect a wallet first')
      const address = conn.account.getAddress()
      const publicKey = conn.account.getPublicKey()

      const network = config.chains.find(c => c.id === conn.networkId)?.type
      if (!network) return this.note('warn', `no chain configured for '${conn.networkId}'`)

      return this.run(`build self-send PSBT for ${address}`, async () => {
        const { data: utxos } = await getAddressUtxos(config, address)
        if (utxos.length === 0) return 'no UTXOs at this address — fund it first'
        const fees = await getRecommendedFees(config)

        const { psbtHex } = buildSendBtcPsbt({
          utxos,
          toAddress: address,
          amount: 1000,
          changeAddress: address,
          feeRate: fees.fastFee,
          network,
          // Required for the builder to set tapInternalKey on taproot inputs —
          // without it, wallets like Xverse sign nothing ("no taproot inputs
          // signed").
          publicKey,
        })

        this.psbt = psbtHex
        return `PSBT ready (${psbtHex.length / 2} bytes) — hit Sign PSBT`
      })
    },

    signPsbt() {
      const psbt = this.psbt.trim()
      if (!psbt) return this.note('warn', 'paste a PSBT hex')
      return this.run('signPsbt(config, …, { finalize: true })', async () => {
        const signed = await signPsbt(config, psbt, { finalize: true })
        this.signedTx = signed.txHex ?? ''
        return signed.txHex
          ? `signed · txHex ready (${signed.txHex.length / 2} bytes) — hit Broadcast to submit`
          : 'signed (wallet returned no txHex)'
      })
    },

    broadcast() {
      if (!this.signedTx) return this.note('warn', 'sign a PSBT first')
      return this.run('broadcastTransaction(config, signedTxHex)', async () => {
        const txId = await broadcastTransaction(config, this.signedTx)
        return `txId: ${txId}`
      })
    },

    switchNetwork(id: ConfiguredNetworkId) {
      return this.run(`switchNetwork(config, '${id}')`, async () => {
        const result = await switchNetwork(config, id)
        return `wallet now on '${result.id}'`
      })
    },

    // ── trace helpers (UI only) ───────────────────────────────────────────

    /** Run a labelled action, logging the call, its result, and any error. */
    async run(label: string, fn: () => Promise<string>) {
      this.note('info', `→ ${label}`)
      try {
        this.note('ok', `← ${await fn()}`)
      } catch (e) {
        if (e instanceof NetworkNotConfiguredError) {
          this.note('err', `✗ ${e.message}`)
          this.note('info', '  use the Switch network buttons to move to a supported chain.')
        } else {
          this.note('err', `✗ ${label} failed: ${(e as Error).message}`)
        }
      }
    },

    note(level: LogLevel, text: string) {
      this.log.push({ ts: new Date().toLocaleTimeString(), level, text })
      // Mirror to console for the deeper trace.
      console.log(`[${level}]`, text)
    },
  }
}
