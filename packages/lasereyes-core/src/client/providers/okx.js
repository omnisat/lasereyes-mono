import * as bitcoin from 'bitcoinjs-lib';
import { WalletProvider } from '.';
import { FRACTAL_MAINNET, FRACTAL_TESTNET, getNetworkForOkx, MAINNET, OKX, SIGNET, TESTNET, TESTNET4, } from '../..';
import { getBTCBalance } from '../../lib/helpers';
import { listenKeys } from 'nanostores';
import { persistentMap } from '@nanostores/persistent';
import axios from 'axios';
import { getMempoolSpaceUrl } from '../../lib/urls';
const keysToPersist = [
    'address',
    'paymentAddress',
    'publicKey',
    'paymentPublicKey',
    'balance',
];
const OKX_WALLET_PERSISTENCE_KEY = 'OKX_CONNECTED_WALLET_STATE';
export default class OkxProvider extends WalletProvider {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "observer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "$valueStore", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: persistentMap(OKX_WALLET_PERSISTENCE_KEY, {
                address: '',
                paymentAddress: '',
                paymentPublicKey: '',
                publicKey: '',
                balance: '',
            })
        });
        Object.defineProperty(this, "removeSubscriber", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    get library() {
        let foundOkx;
        if (this.network === TESTNET ||
            this.network === TESTNET4 ||
            this.network === SIGNET ||
            this.network === FRACTAL_TESTNET) {
            foundOkx = window?.okxwallet?.bitcoinTestnet;
        }
        else if (this.network === MAINNET || this.network === FRACTAL_MAINNET) {
            foundOkx = window?.okxwallet?.bitcoin;
        }
        return foundOkx;
    }
    get network() {
        return this.$network.get();
    }
    restorePersistedValues() {
        const vals = this.$valueStore.get();
        for (const key of keysToPersist) {
            this.$store.setKey(key, vals[key]);
        }
    }
    watchStateChange(newState, _, changedKey) {
        if (changedKey && newState.provider === OKX) {
            if (changedKey === 'balance') {
                this.$valueStore.setKey('balance', newState.balance?.toString() ?? '');
            }
            else if (keysToPersist.includes(changedKey)) {
                this.$valueStore.setKey(changedKey, newState[changedKey]?.toString() ?? '');
            }
        }
    }
    initialize() {
        listenKeys(this.$store, ['provider'], (newVal) => {
            if (newVal.provider !== OKX) {
                if (this.removeSubscriber) {
                    this.$valueStore.set({
                        address: '',
                        paymentAddress: '',
                        paymentPublicKey: '',
                        publicKey: '',
                        balance: '',
                    });
                    this.removeSubscriber();
                    this.removeSubscriber = undefined;
                }
            }
            else {
                this.removeSubscriber = this.$store.subscribe(this.watchStateChange.bind(this));
            }
        });
        this.observer = new window.MutationObserver(() => {
            const okxLib = this.library;
            if (okxLib) {
                this.$store.setKey('hasProvider', {
                    ...this.$store.get().hasProvider,
                    [OKX]: true,
                });
                this.observer?.disconnect();
            }
        });
        this.observer?.observe(document, { childList: true, subtree: true });
    }
    dispose() {
        this.observer?.disconnect();
    }
    async connect(_) {
        try {
            const okxAccounts = await this.library.connect();
            if (!okxAccounts)
                throw new Error('No accounts found');
            this.$store.setKey('address', okxAccounts.address);
            this.$store.setKey('paymentAddress', okxAccounts.address);
            this.$store.setKey('publicKey', okxAccounts.publicKey);
            this.$store.setKey('paymentPublicKey', okxAccounts.publicKey);
            this.$store.setKey('accounts', [okxAccounts]);
            const balance = await this.library?.getBalance();
            this.$store.setKey('balance', balance.total);
            this.$store.setKey('provider', OKX);
            this.$store.setKey('connected', true);
        }
        catch (e) {
            throw e;
        }
    }
    async requestAccounts() {
        const library = this.library;
        const network = this.network;
        if (network === TESTNET ||
            network === TESTNET4 ||
            network === FRACTAL_TESTNET) {
            return await library.connect();
        }
        return await library.requestAccounts();
    }
    async getNetwork() {
        const { address } = this.$store.get();
        const network = this.network;
        if (address.slice(0, 1) === 't') {
            if (network === TESTNET) {
                return TESTNET;
            }
            else if (network === TESTNET4) {
                return TESTNET4;
            }
            else if (network === SIGNET) {
                return SIGNET;
            }
            else if (network === FRACTAL_TESTNET) {
                return FRACTAL_TESTNET;
            }
            return TESTNET;
        }
        const okxNetwork = await this.library.getNetwork();
        return getNetworkForOkx(okxNetwork);
    }
    async getPublicKey() {
        const library = this.library;
        return await library?.getPublicKey();
    }
    async getBalance() {
        const { paymentAddress } = this.$store.get();
        return await getBTCBalance(paymentAddress, this.network);
    }
    async getInscriptions() {
        const library = this.library;
        return await library.getInscriptions(0, 10);
    }
    async sendBTC(to, amount) {
        const library = this.library;
        const txId = await library.sendBitcoin(to, amount);
        if (!txId)
            throw new Error('Transaction failed');
        return txId;
    }
    async signMessage(message, _) {
        const library = this.library;
        return await library?.signMessage(message);
    }
    async signPsbt(_, psbtHex, __, _finalize, broadcast) {
        const library = this.library;
        const signedPsbt = await library.signPsbt(psbtHex, {
            autoFinalized: _finalize,
        });
        const psbtSignedPsbt = bitcoin.Psbt.fromHex(signedPsbt);
        if (_finalize && broadcast) {
            const txId = await this.pushPsbt(signedPsbt);
            return {
                signedPsbtHex: psbtSignedPsbt.toHex(),
                signedPsbtBase64: psbtSignedPsbt.toBase64(),
                txId,
            };
        }
        return {
            signedPsbtHex: psbtSignedPsbt.toHex(),
            signedPsbtBase64: psbtSignedPsbt.toBase64(),
            txId: undefined,
        };
    }
    async pushPsbt(_tx) {
        return await axios
            .post(`${getMempoolSpaceUrl(this.network)}/api/tx`, _tx)
            .then((res) => res.data);
    }
}
