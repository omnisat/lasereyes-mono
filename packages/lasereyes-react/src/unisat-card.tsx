import { useLaserEyes } from "@";
import { UNISAT } from "@omnisat/lasereyes-core";

export default function UnisatCard() {
  const { connected, connect, disconnect, address, publicKey } = useLaserEyes();
  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">Unisat</h5>
        <p className="card-text">
          Unisat is a decentralized satellite network.
        </p>
        <a href="https://unisat.network" className="btn btn-primary">
          Learn more
        </a>
      </div>
      <h6>Is Wallet Connected?</h6>
      <p
        className={`badge ${connected ? "bg-success" : "bg-danger"} text-light`}
      >
        {connected ? "Yes" : "No"}
      </p>

      <h6>Address</h6>
      <p>{address}</p>

      <h6>Public Key</h6>
      <p>{publicKey}</p>

      <button
        className="btn btn-primary"
        onClick={() => {
          if (connected) {
            disconnect();
          } else {
            connect(UNISAT);
          }
        }}
      >
        {connected ? "Disconnect" : "Connect"}
      </button>
    </div>
  );
}
