import { atom, map } from 'nanostores';
import { MAINNET } from '../constants/networks';
import { LEATHER, MAGIC_EDEN, OKX, OYL, PHANTOM, UNISAT, WIZZ, XVERSE, ORANGE, } from '../constants/wallets';
export function triggerDOMShakeHack() {
    setTimeout(() => {
        const node = document.createTextNode(' ');
        document.body.appendChild(node);
        node.remove();
    }, 1500);
}
export function createStores() {
    return {
        $store: map({
            provider: undefined,
            address: '',
            paymentAddress: '',
            publicKey: '',
            paymentPublicKey: '',
            connected: false,
            isConnecting: false,
            isInitializing: true,
            accounts: [],
            balance: undefined,
            hasProvider: {
                [UNISAT]: false,
                [XVERSE]: false,
                [OYL]: false,
                [MAGIC_EDEN]: false,
                [OKX]: false,
                [LEATHER]: false,
                [PHANTOM]: false,
                [WIZZ]: false,
                [ORANGE]: false,
            },
        }),
        $network: atom(MAINNET),
        $library: atom(undefined),
    };
}
export function createConfig({ network }) {
    return {
        network,
    };
}
