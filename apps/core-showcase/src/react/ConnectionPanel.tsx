/**
 * Connection + account + network. Exercises the lifecycle/state hooks:
 * useStatus, useConnectors, useConnect, useConnector, useDisconnect,
 * useAccount, useNetwork. (useConfig is exercised in WritesPanel.)
 */

import {
  useAccount,
  useConnect,
  useConnector,
  useConnectors,
  useDisconnect,
  useNetwork,
  useStatus,
} from '@omnisat/lasereyes-react'

export function ConnectionPanel() {
  const status = useStatus()
  const account = useAccount()
  const connectors = useConnectors()
  const active = useConnector() // active connector, or undefined when disconnected
  const { connect, isPending, error } = useConnect()
  const { disconnect } = useDisconnect()
  // useNetwork now exposes the configured `chains` alongside the active id +
  // switcher, so the switch buttons need nothing else.
  const { network, chains, switchNetwork } = useNetwork()

  return (
    <div className="panel">
      <h2>Connection</h2>

      <div className="row">
        <span className="cap">Status</span>
        <span className={`pill ${status === 'connected' ? 'live' : 'idle'}`}>{status}</span>
        {isPending && <span className="kv">connecting…</span>}
      </div>

      <div className="row">
        <span className="cap">Connectors</span>
        <div className="cluster">
          {connectors.length === 0 && <span className="kv">No wallets announced.</span>}
          {connectors.map(c => (
            <button
              type="button"
              key={c.id}
              disabled={!c.isReady() || isPending}
              onClick={() => connect(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="kv err">connect failed: {error.message}</div>}

      <div className="row">
        <button type="button" disabled={status !== 'connected'} onClick={() => disconnect()}>
          Disconnect
        </button>
      </div>

      <h3 className="mt">Account</h3>
      {account.status === 'connected' ? (
        // Connected branch: account/connector are non-null without a null-check.
        <div className="kv">
          <div>
            {/* connected branch ⇒ payment address/publicKey are `string` (no `?? '—'`) */}
            Payment: <code>{account.paymentAddress}</code>
          </div>
          <div>
            Ordinals: <code>{account.ordinalsAddress ?? '—'}</code>
          </div>
          <div>
            Public key: <code>{account.publicKey}</code>
          </div>
          <div>
            Connector: <code>{active?.name ?? account.connector.name}</code>
            {active?.getClient && <span className="pill">nativeRpc override</span>}
          </div>
        </div>
      ) : (
        <div className="kv">Not connected.</div>
      )}

      <h3 className="mt">Network</h3>
      <div className="row">
        <span className="cap">Active</span>
        <code>{network}</code>
      </div>
      <div className="cluster">
        {chains.map(chain => (
          <button
            type="button"
            key={chain.id}
            disabled={chain.id === network || status !== 'connected'}
            onClick={() => switchNetwork(chain.id)}
          >
            {chain.id}
          </button>
        ))}
      </div>
    </div>
  )
}
