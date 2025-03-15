import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import AuthGuard from './AuthGuard.tsx';
import './index.css';
// import { SiwbIdentityProvider } from 'ic-use-siwb-identity';
import type { _SERVICE as siwbService } from './idls/ic_siwb_provider.d.ts';
import { idlFactory as siwbIdl } from './idls/ic_siwb_provider.idl.ts';
import { SiwbIdentityProvider } from 'ic-siwb-lasereyes-connector';
import { LaserEyesProvider } from '@omnisat/lasereyes';
import { MAINNET } from '@omnisat/lasereyes';

ReactDOM.createRoot(document.getElementById('root')!).render(
  //<React.StrictMode>
  <LaserEyesProvider config={{ network: MAINNET }}>
    <SiwbIdentityProvider<siwbService>
      canisterId={process.env.PROVIDER! ?? 'avqkn-guaaa-aaaaa-qaaea-cai'}
      idlFactory={siwbIdl}
      httpAgentOptions={{ host: process.env.DFX_NETWORK === 'ic' ? 'https://icp0.io' : 'http://127.0.0.1:4943' }} // use only in local canister
    >
      <AuthGuard>
        <App />
      </AuthGuard>
    </SiwbIdentityProvider>
  </LaserEyesProvider>,

  // </React.StrictMode>,
);
