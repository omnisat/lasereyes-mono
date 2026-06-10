/**
 * Writes: useSendBitcoin, useSignMessage, useSignPsbt, useBroadcastPsbt,
 * useBroadcastTransaction.
 *
 * The PSBT flow shows a real friction: there's no "build + sign" hook, so to
 * exercise useSignPsbt the app assembles the PSBT itself from useConfig (chain),
 * useAccount (address + public key) and useUtxos / useFeeRates, via the
 * `buildSendBtcPsbt` util. Once you have the hex, the three PSBT-ish hooks each
 * take it from a different angle.
 */

import { buildSendBtcPsbt } from '@omnisat/lasereyes-client/utils'
import {
  useAccount,
  useBroadcastPsbt,
  useBroadcastTransaction,
  useConfig,
  useFeeRates,
  useSendBitcoin,
  useSignMessage,
  useSignPsbt,
  useUtxos,
} from '@omnisat/lasereyes-react'
import { useState } from 'react'

export function WritesPanel() {
  const config = useConfig()
  const account = useAccount()
  const utxos = useUtxos()
  const fees = useFeeRates()

  const send = useSendBitcoin()
  const sign = useSignMessage()
  const psbt = useSignPsbt()
  const psbtBroadcast = useBroadcastPsbt()
  const rawBroadcast = useBroadcastTransaction()

  const [to, setTo] = useState('')
  const [amount, setAmount] = useState(1000)
  const [message, setMessage] = useState('Hello, Bitcoin!')
  const [psbtHex, setPsbtHex] = useState('')

  const connected = account.status === 'connected'

  /** Assemble an unsigned self-send PSBT from the cached reads. */
  function generatePsbt() {
    if (account.status !== 'connected') return
    const address = account.account.getAddress()
    const publicKey = account.account.getPublicKey()
    const network = config.chains.find(c => c.id === account.networkId)?.type
    const list = utxos.items // accumulated across loaded pages
    if (!network || !fees.data || list.length === 0) return
    const { psbtHex } = buildSendBtcPsbt({
      utxos: list,
      toAddress: address,
      amount: 1000,
      changeAddress: address,
      feeRate: fees.data.fastFee,
      network,
      publicKey, // taproot inputs need this or wallets sign nothing
    })
    setPsbtHex(psbtHex)
  }

  // The signed txHex (if signPsbt finalized) feeds the raw-broadcast demo.
  const signedTxHex = psbt.status === 'success' ? psbt.data.txHex : undefined

  return (
    <div className="panel span-all">
      <h2>Writes</h2>

      <h3>Send BTC</h3>
      <div className="row">
        <span className="cap">To</span>
        <input value={to} placeholder="bc1q…" onChange={e => setTo(e.target.value.trim())} />
      </div>
      <div className="row">
        <span className="cap">Amount (sats)</span>
        <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} />
        <button
          type="button"
          className="primary"
          disabled={!connected || send.isLoading || !to}
          onClick={() => send.sendBitcoin({ to, amount })}
        >
          Send
        </button>
      </div>
      <div className="kv">
        status: <code>{send.status}</code>
        {send.txId && (
          <>
            {' '}
            · txId: <code>{send.txId}</code>
          </>
        )}
        {send.error && <span className="err"> · {send.error.message}</span>}
      </div>

      <h3 className="mt">Sign message</h3>
      <div className="row">
        <input value={message} onChange={e => setMessage(e.target.value)} />
        <button
          type="button"
          className="primary"
          disabled={!connected || sign.isLoading}
          onClick={() => sign.signMessage({ message })}
        >
          Sign
        </button>
      </div>
      <div className="kv">
        status: <code>{sign.status}</code>
        {sign.status === 'success' && (
          <>
            {' '}
            · signature: <code>{sign.data}</code>
          </>
        )}
        {sign.error && <span className="err"> · {sign.error.message}</span>}
      </div>

      <h3 className="mt">PSBT</h3>
      <div className="row">
        <button type="button" disabled={!connected} onClick={generatePsbt}>
          Generate self-send PSBT
        </button>
        <span className="kv">
          {psbtHex ? `${psbtHex.length / 2} bytes ready` : 'build one to enable signing'}
        </span>
      </div>
      <div className="row">
        <textarea
          value={psbtHex}
          placeholder="70736274ff… or click Generate"
          onChange={e => setPsbtHex(e.target.value.trim())}
        />
      </div>
      <div className="row">
        <button
          type="button"
          className="primary"
          disabled={!connected || !psbtHex || psbt.isLoading}
          onClick={() => psbt.signPsbt({ psbt: psbtHex, options: { finalize: true } })}
        >
          signPsbt (finalize)
        </button>
        <button
          type="button"
          className="primary"
          disabled={!connected || !psbtHex || psbtBroadcast.isLoading}
          onClick={() => psbtBroadcast.broadcastPsbt({ psbt: psbtHex })}
        >
          broadcastPsbt (sign + send)
        </button>
        <button
          type="button"
          disabled={!connected || !signedTxHex || rawBroadcast.isLoading}
          onClick={() => signedTxHex && rawBroadcast.broadcastTransaction({ rawTx: signedTxHex })}
        >
          broadcastTransaction (raw)
        </button>
      </div>
      <div className="kv">
        <div>
          signPsbt: <code>{psbt.status}</code>
          {psbt.status === 'success' && psbt.data.txHex && <span> · txHex ready</span>}
          {psbt.error && <span className="err"> · {psbt.error.message}</span>}
        </div>
        <div>
          broadcastPsbt: <code>{psbtBroadcast.status}</code>
          {psbtBroadcast.txId && (
            <>
              {' '}
              · <code>{psbtBroadcast.txId}</code>
            </>
          )}
          {psbtBroadcast.error && <span className="err"> · {psbtBroadcast.error.message}</span>}
        </div>
        <div>
          broadcastTransaction: <code>{rawBroadcast.status}</code>
          {rawBroadcast.txId && (
            <>
              {' '}
              · <code>{rawBroadcast.txId}</code>
            </>
          )}
          {rawBroadcast.error && <span className="err"> · {rawBroadcast.error.message}</span>}
        </div>
      </div>
    </div>
  )
}
