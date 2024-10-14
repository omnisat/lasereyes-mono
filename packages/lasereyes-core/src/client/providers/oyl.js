import * as bitcoin from 'bitcoinjs-lib';
import { UNSUPPORTED_PROVIDER_METHOD_ERROR, WalletProvider } from '.';
import { createSendBtcPsbt, getBTCBalance } from '../../lib/helpers';
import { OYL } from '../../constants/wallets';
import { listenKeys } from 'nanostores';
import { persistentMap } from '@nanostores/persistent';
const keysToPersist = [
    'address',
    'paymentAddress',
    'publicKey',
    'paymentPublicKey',
    'balance',
];
const OYL_WALLET_PERSISTENCE_KEY = 'OYL_CONNECTED_WALLET_STATE';
export default class OylProvider extends WalletProvider {
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
            value: persistentMap(OYL_WALLET_PERSISTENCE_KEY, {
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
        return window.oyl;
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
        if (changedKey && newState.provider === OYL) {
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
            if (newStore.provider !== OYL) {
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
            const oylLib = window?.oyl;
            if (oylLib) {
                this.$store.setKey('hasProvider', {
                    ...this.$store.get().hasProvider,
                    [OYL]: true,
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
            throw new Error("Oyl isn't installed");
        const { nativeSegwit, taproot } = await this.library.getAddresses();
        if (!nativeSegwit || !taproot)
            throw new Error('No accounts found');
        this.$store.setKey('address', taproot.address);
        this.$store.setKey('paymentAddress', nativeSegwit.address);
        this.$store.setKey('publicKey', taproot.publicKey);
        this.$store.setKey('paymentPublicKey', nativeSegwit.publicKey);
        this.$store.setKey('provider', OYL);
        // TODO: Confirm if this is necessary and why
        getBTCBalance(nativeSegwit.address, this.network).then((totalBalance) => {
            this.$store.setKey('balance', totalBalance);
        });
        this.$store.setKey('connected', true);
        const balance = await this.getBalance();
        if (balance)
            this.$store.setKey('balance', balance);
    }
    async getNetwork() {
        return this.network;
    }
    async sendBTC(to, amount) {
        const { psbtHex } = await createSendBtcPsbt(this.$store.get().address, this.$store.get().paymentAddress, to, amount, this.$store.get().paymentPublicKey, this.network, 7);
        const psbt = await this.signPsbt('', psbtHex, '', true, true);
        if (!psbt)
            throw new Error('Error sending BTC');
        // @ts-ignore
        return psbt.txId;
    }
    async signMessage(message, toSignAddress) {
        const tempAddy = toSignAddress || this.$store.get().paymentAddress;
        const response = await this.library.signMessage({
            address: tempAddy,
            message,
        });
        return response.signature;
    }
    async signPsbt(_, psbtHex, __, finalize, broadcast) {
        const { psbt, txid } = await this.library.signPsbt({
            psbt: psbtHex,
            finalize,
            broadcast,
        });
        const psbtSignedPsbt = bitcoin.Psbt.fromHex(psbt);
        return {
            signedPsbtHex: psbtSignedPsbt.toHex(),
            signedPsbtBase64: psbtSignedPsbt.toBase64(),
            txId: txid,
        };
    }
    async pushPsbt(tx) {
        const response = await this.library.pushPsbt({ psbt: tx });
        return response.txid;
    }
    async getPublicKey() {
        return await this.library?.getPublicKey();
    }
    async getBalance() {
        const { total } = await this.library.getBalance();
        this.$store.setKey('balance', total);
        return total;
    }
    async getInscriptions() {
        return await this.library.getInscriptions(0, 10);
    }
    async requestAccounts() {
        return await this.library.requestAccounts();
    }
    async switchNetwork() {
        throw UNSUPPORTED_PROVIDER_METHOD_ERROR;
    }
}
