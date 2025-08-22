import { useLaserEyes, UNISAT } from '@kevinoyl/lasereyes'

export default function UnisatCard() {
  const { connected, connect, disconnect, address, balance, publicKey } =
    useLaserEyes()
  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">Unisat</h5>
      </div>
      <h6>Is Wallet Connected?</h6>
      <p
        className={`badge ${connected ? 'bg-success' : 'bg-danger'} text-light`}
      >
        {connected ? 'Yes' : 'No'}
      </p>

      <h6>Address</h6>
      <p>{address}</p>

      <h6>Public Key</h6>
      <p>{publicKey}</p>

      <h6>Balance</h6>
      <p>{balance}</p>

      <button
        className="btn btn-primary"
        onClick={() => {
          if (connected) {
            disconnect()
          } else {
            connect(UNISAT)
          }
        }}
      >
        {connected ? 'Disconnect' : 'Connect'}
      </button>
    </div>
  )
}
