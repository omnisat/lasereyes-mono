/**
 * Cached reads: useBalance, useUtxos, useFeeRates, useTransaction.
 *
 * Also exercises:
 *  - per-call overrides — `{ chainId }` (read a non-active chain) and
 *    `{ enabled }` (pause/resume),
 *  - cursor pagination — `useUtxos` accumulates pages (`items` + `fetchNextPage`
 *    + `hasNextPage`), so there's a "Load more" button instead of a dangling
 *    `nextCursor`.
 */

import {
  useAccount,
  useBalance,
  useFeeRates,
  useNetwork,
  useTransaction,
  useUtxos,
} from '@omnisat/lasereyes-react'
import { useState } from 'react'

export function ReadsPanel() {
  const { network, chains } = useNetwork()
  const { paymentAddress } = useAccount()
  const chainIds = chains.map(c => c.id)

  const [pollBalance, setPollBalance] = useState(true)
  // The selector is an *override*: until the user picks a chain it follows the
  // active network, so switching networks re-reads the right chain (rather than
  // pinning the initial one and erroring on a foreign-chain address).
  const [chainOverride, setChainOverride] = useState<(typeof chainIds)[number] | undefined>()
  const readChain = chainOverride ?? network
  // A cross-chain read (chainId) requires an explicit address — the hook won't
  // pair the active-account default with a foreign chain. Pass the active payment
  // address ('' → idle while disconnected).
  const balance = useBalance(paymentAddress ?? '', { chainId: readChain, enabled: pollBalance })

  const utxos = useUtxos()
  const fees = useFeeRates()

  const [txid, setTxid] = useState('')
  const tx = useTransaction(txid) // idle until txid is non-empty

  return (
    <div className="panel">
      <h2>Reads</h2>

      <h3>Balance</h3>
      <div className="row">
        <span className="cap">On chain</span>
        <select
          value={readChain}
          // onChange gives a plain string; chainId is narrowed to the configured
          // ids, so we assert back to that union. Minor friction worth noting.
          onChange={e => setChainOverride(e.target.value as (typeof chainIds)[number])}
        >
          {chainIds.map(id => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
        <label>
          <input
            type="checkbox"
            checked={pollBalance}
            onChange={e => setPollBalance(e.target.checked)}
          />{' '}
          enabled
        </label>
      </div>
      <div className="row">
        <span className="kv">
          {balance.status === 'success' ? (
            <>
              <code>{balance.data}</code> sats
            </>
          ) : (
            <code>{balance.status}</code>
          )}
        </span>
        <button type="button" onClick={() => balance.refetch()}>
          Refetch
        </button>
      </div>
      {balance.status === 'error' && <div className="kv err">{balance.error.message}</div>}

      <h3 className="mt">UTXOs</h3>
      <div className="kv">
        {utxos.status === 'success' ? (
          <span>
            <code>{utxos.items.length}</code> utxos loaded ·{' '}
            <code>{utxos.items.reduce((sum, u) => sum + u.value, 0)}</code> sats total
          </span>
        ) : (
          <code>{utxos.status}</code>
        )}
      </div>
      <div className="row">
        <button
          type="button"
          disabled={!utxos.hasNextPage || utxos.isFetchingNextPage}
          onClick={() => utxos.fetchNextPage()}
        >
          {utxos.isFetchingNextPage ? 'Loading…' : 'Load more'}
        </button>
        {!utxos.hasNextPage && utxos.status === 'success' && (
          <span className="kv">all pages loaded</span>
        )}
      </div>

      <h3 className="mt">Recommended fees</h3>
      <div className="kv">
        {fees.status === 'success' ? (
          <span>
            fast <code>{fees.data.fastFee}</code> · normal <code>{fees.data.minFee}</code> sat/vB
          </span>
        ) : (
          <code>{fees.status}</code>
        )}
      </div>

      <h3 className="mt">Transaction lookup</h3>
      <div className="row">
        <input
          value={txid}
          placeholder="paste a txid"
          onChange={e => setTxid(e.target.value.trim())}
        />
      </div>
      <div className="kv">
        {tx.status === 'idle' && <span>enter a txid…</span>}
        {tx.status === 'loading' && <span>loading…</span>}
        {tx.status === 'success' && (
          <span>
            confirmed: <code>{String(tx.data.status.confirmed)}</code>
          </span>
        )}
        {tx.status === 'error' && <span className="err">{tx.error.message}</span>}
      </div>
    </div>
  )
}
