import * as bitcoin from 'bitcoinjs-lib';
import { UNSUPPORTED_PROVIDER_METHOD_ERROR, WalletProvider } from '.';
import { getBTCBalance } from '../../lib/helpers';
import { LEATHER, P2TR, P2WPKH } from '../../constants/wallets';
import { listenKeys } from 'nanostores';
import { persistentMap } from '@nanostores/persistent';
import { SIGNET, TESTNET, TESTNET4 } from '../../constants';
import { RpcErrorCode } from 'sats-connect';
import axios from 'axios';
import { getMempoolSpaceUrl } from '../../lib/urls';
const keysToPersist = [
    'address',
    'paymentAddress',
    'publicKey',
    'paymentPublicKey',
    'balance',
];
const LEATHER_WALLET_PERSISTENCE_KEY = 'LEATHER_CONNECTED_WALLET_STATE';
export default class LeatherProvider extends WalletProvider {
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
            value: persistentMap(LEATHER_WALLET_PERSISTENCE_KEY, {
                address: '',
                publicKey: '',
                paymentAddress: '',
                paymentPublicKey: '',
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
        return window.LeatherProvider;
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
        if (changedKey && newState.provider === LEATHER) {
            if (changedKey === 'balance') {
                this.$valueStore.setKey('balance', newState.balance?.toString() ?? '');
            }
            else if (keysToPersist.includes(changedKey)) {
                this.$valueStore.setKey(changedKey, newState[changedKey]?.toString() ?? '');
            }
        }
    }
    initialize() {
        console.log('initializing');
        listenKeys(this.$store, ['provider'], (newStore) => {
            if (newStore.provider !== LEATHER) {
                if (this.removeSubscriber) {
                    this.$valueStore.set({
                        address: '',
                        publicKey: '',
                        paymentAddress: '',
                        paymentPublicKey: '',
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
            const leatherLib = window?.LeatherProvider;
            if (leatherLib) {
                this.$store.setKey('hasProvider', {
                    ...this.$store.get().hasProvider,
                    [LEATHER]: true,
                });
                this.observer?.disconnect();
            }
        });
        this.observer.observe(document, { childList: true, subtree: true });
    }
    dispose() {
        this.observer?.disconnect();
    }
    async connect(_) {
        if (!this.library)
            throw new Error("Leather isn't installed");
        const getAddressesResponse = await this.library.request('getAddresses');
        if (!getAddressesResponse)
            throw new Error('No accounts found');
        const addressesResponse = getAddressesResponse.result;
        const addresses = addressesResponse.addresses;
        const leatherAccountsParsed = addresses.map((address) => address.address);
        const taprootAddress = addresses.find((address) => address.type === P2TR);
        const segwitAddress = addresses.find((address) => address.type === P2WPKH);
        if (!taprootAddress?.publicKey || !segwitAddress?.publicKey) {
            throw new Error('No accounts found');
        }
        if (String(taprootAddress?.address)?.startsWith('tb') &&
            this.network !== TESTNET &&
            this.network !== TESTNET4 &&
            this.network !== SIGNET) {
            throw new Error(`Please switch networks to ${this.network} in the wallet settings.`);
        }
        this.$store.setKey('accounts', leatherAccountsParsed);
        this.$store.setKey('address', taprootAddress.address);
        this.$store.setKey('paymentAddress', segwitAddress.address);
        this.$store.setKey('publicKey', taprootAddress.publicKey);
        this.$store.setKey('paymentPublicKey', segwitAddress.publicKey);
        this.$store.setKey('provider', LEATHER);
        // TODO: Confirm if this is necessary and why
        getBTCBalance(segwitAddress.address, this.network).then((totalBalance) => {
            this.$store.setKey('balance', totalBalance);
        });
        this.$store.setKey('connected', true);
    }
    async getNetwork() {
        return this.network;
    }
    async sendBTC(to, amount) {
        const response = await this.library?.request('sendTransfer', {
            recipients: [
                {
                    address: to,
                    amount: amount,
                },
            ],
        });
        if (response?.result?.txid) {
            return response.result.txid;
        }
        else {
            if (response.error.code === RpcErrorCode.USER_REJECTION) {
                throw new Error('User rejected the request');
            }
            else {
                throw new Error('Error sending BTC: ' + response.error.message);
            }
        }
    }
    async signMessage(message, toSignAddress) {
        const paymentType = toSignAddress === this.$store.get().address ? P2TR : P2WPKH;
        if (toSignAddress !== this.$store.get().address &&
            toSignAddress !== this.$store.get().paymentAddress) {
            throw new Error('Invalid address to sign message');
        }
        const signed = await this.library.request('signMessage', {
            message: message,
            paymentType,
        });
        return signed?.result?.signature;
    }
    async signPsbt(_, psbtHex, __, finalize, broadcast) {
        const requestParams = {
            hex: psbtHex,
            broadcast: false,
            network: this.network,
        };
        const response = await this.library.request('signPsbt', requestParams);
        const leatherHexResult = response.result;
        const signedTx = leatherHexResult.hex;
        const signed = bitcoin.Psbt.fromHex(String(signedTx));
        if (finalize && broadcast) {
            const finalized = signed.finalizeAllInputs();
            const txId = await this.pushPsbt(finalized.toHex());
            return {
                signedPsbtHex: signed.toHex(),
                signedPsbtBase64: signed.toBase64(),
                txId,
            };
        }
        else if (finalize) {
            const finalized = signed.finalizeAllInputs();
            return {
                signedPsbtHex: finalized.toHex(),
                signedPsbtBase64: finalized.toBase64(),
                txId: undefined,
            };
        }
        else {
            return {
                signedPsbtHex: signed.toHex(),
                signedPsbtBase64: signed.toBase64(),
                txId: undefined,
            };
        }
    }
    async pushPsbt(tx) {
        const decoded = bitcoin.Psbt.fromHex(tx);
        const extracted = decoded.extractTransaction();
        return await axios
            .post(`${getMempoolSpaceUrl(this.network)}/api/tx`, extracted.toHex())
            .then((res) => res.data);
    }
    async getPublicKey() {
        const { result } = (await this.library.request('getAddresses'));
        const addresses = result.addresses;
        const taprootAddress = addresses.find((address) => address.type === P2TR);
        if (!taprootAddress?.publicKey) {
            throw new Error('No accounts found');
        }
        return taprootAddress.publicKey;
    }
    async getBalance() {
        const bal = await getBTCBalance(this.$store.get().paymentAddress, this.network);
        this.$store.setKey('balance', bal);
        return bal.toString();
    }
    async getInscriptions() {
        throw UNSUPPORTED_PROVIDER_METHOD_ERROR;
    }
    async requestAccounts() {
        const { result } = (await this.library.request('getAddresses'));
        const addresses = result.addresses;
        const accounts = addresses.map((address) => address.address);
        this.$store.setKey('accounts', accounts);
        return accounts;
    }
    async switchNetwork() {
        throw UNSUPPORTED_PROVIDER_METHOD_ERROR;
    }
}
