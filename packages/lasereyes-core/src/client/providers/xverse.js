import * as bitcoin from 'bitcoinjs-lib';
import { RpcErrorCode, getAddress, request, } from 'sats-connect';
import { UNSUPPORTED_PROVIDER_METHOD_ERROR, WalletProvider } from '.';
import { XVERSE, getSatsConnectNetwork, MAINNET, TESTNET, TESTNET4, SIGNET, FRACTAL_TESTNET, } from '../..';
import { findOrdinalsAddress, findPaymentAddress, getBTCBalance, getBitcoinNetwork, } from '../../lib/helpers';
import { listenKeys } from 'nanostores';
import { persistentMap } from '@nanostores/persistent';
const keysToPersist = [
    'address',
    'paymentAddress',
    'publicKey',
    'paymentPublicKey',
    'balance',
];
const XVERSE_WALLET_PERSISTENCE_KEY = 'XVERSE_CONNECTED_WALLET_STATE';
export default class XVerseProvider extends WalletProvider {
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
            value: persistentMap(XVERSE_WALLET_PERSISTENCE_KEY, {
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
        return window.BitcoinProvider;
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
        if (changedKey && newState.provider === XVERSE) {
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
            if (newVal.provider !== XVERSE) {
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
            const xverseLib = window?.XverseProviders?.BitcoinProvider;
            if (xverseLib) {
                this.$store.setKey('hasProvider', {
                    ...this.$store.get().hasProvider,
                    [XVERSE]: true,
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
        const { address, paymentAddress } = this.$valueStore.get();
        try {
            if (address) {
                this.restorePersistedValues();
                getBTCBalance(paymentAddress, this.network).then((totalBalance) => {
                    this.$store.setKey('balance', totalBalance);
                });
                return;
            }
            let xverseNetwork = getSatsConnectNetwork(this.network || MAINNET);
            const getAddressOptions = {
                payload: {
                    purposes: ['ordinals', 'payment'],
                    message: 'Address for receiving Ordinals and payments',
                    network: {
                        type: xverseNetwork,
                    },
                },
                onFinish: (response) => {
                    const foundAddress = findOrdinalsAddress(response.addresses);
                    const foundPaymentAddress = findPaymentAddress(response.addresses);
                    if (foundAddress && foundPaymentAddress) {
                        this.$store.setKey('provider', XVERSE);
                        this.$store.setKey('address', foundAddress.address);
                        this.$store.setKey('paymentAddress', foundPaymentAddress.address);
                    }
                    this.$store.setKey('publicKey', String(response.addresses[0].publicKey));
                    this.$store.setKey('paymentPublicKey', String(response.addresses[1].publicKey));
                    getBTCBalance(foundPaymentAddress.address, this.network).then((totalBalance) => {
                        this.$store.setKey('balance', totalBalance);
                    });
                },
                onCancel: () => {
                    throw new Error(`User canceled lasereyes to ${XVERSE} wallet`);
                },
                onError: (_) => {
                    throw new Error(`Can't lasereyes to ${XVERSE} wallet`);
                },
            };
            await getAddress(getAddressOptions);
            this.$store.setKey('connected', true);
        }
        catch (e) {
            throw e;
        }
    }
    async requestAccounts() {
        return [this.$store.get().address, this.$store.get().paymentAddress];
    }
    async getNetwork() {
        const { address } = this.$store.get();
        if (address.slice(0, 1) === 't' &&
            [TESTNET, TESTNET4, SIGNET, FRACTAL_TESTNET].includes(this.network)) {
            return this.network;
        }
        return MAINNET;
    }
    getPublicKey() {
        throw UNSUPPORTED_PROVIDER_METHOD_ERROR;
    }
    async getBalance() {
        const { paymentAddress } = this.$store.get();
        return await getBTCBalance(paymentAddress, this.network);
    }
    getInscriptions() {
        throw UNSUPPORTED_PROVIDER_METHOD_ERROR;
    }
    async sendBTC(to, amount) {
        const response = await request('sendTransfer', {
            recipients: [
                {
                    address: to,
                    amount: amount,
                },
            ],
        });
        if (response.status === 'success') {
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
        const tempAddy = toSignAddress || this.$store.get().paymentAddress;
        const response = await request('signMessage', {
            address: tempAddy,
            message,
        });
        if (response.status === 'success') {
            return response.result.signature;
        }
        else {
            if (response.error.code === RpcErrorCode.USER_REJECTION) {
                throw new Error('User rejected the request');
            }
            else {
                throw new Error('Error signing message: ' + response.error.message);
            }
        }
    }
    async signPsbt(_, __, psbtBase64, _finalize, broadcast) {
        const { address, paymentAddress } = this.$store.get();
        const toSignPsbt = bitcoin.Psbt.fromBase64(String(psbtBase64), {
            network: getBitcoinNetwork(this.network),
        });
        const inputs = toSignPsbt.data.inputs;
        const inputsToSign = [];
        const ordinalAddressData = {
            address: address,
            signingIndexes: [],
        };
        const paymentsAddressData = {
            address: paymentAddress,
            signingIndexes: [],
        };
        let counter = 0;
        for await (let input of inputs) {
            if (input.witnessUtxo === undefined) {
                paymentsAddressData.signingIndexes.push(Number(counter));
            }
            else {
                const { script } = input.witnessUtxo;
                const addressFromScript = bitcoin.address.fromOutputScript(script, getBitcoinNetwork(this.network));
                if (addressFromScript === paymentAddress) {
                    paymentsAddressData.signingIndexes.push(Number(counter));
                }
                else if (addressFromScript === address) {
                    ordinalAddressData.signingIndexes.push(Number(counter));
                }
            }
            counter++;
        }
        if (ordinalAddressData.signingIndexes.length > 0) {
            inputsToSign.push(ordinalAddressData);
        }
        if (paymentsAddressData.signingIndexes.length > 0) {
            inputsToSign.push(paymentsAddressData);
        }
        let txId, signedPsbtHex, signedPsbtBase64;
        const xverseNetwork = getSatsConnectNetwork(this.network);
        const signPsbtOptions = {
            payload: {
                network: {
                    type: xverseNetwork,
                },
                message: 'Sign Transaction',
                psbtBase64: toSignPsbt.toBase64(),
                broadcast: broadcast,
                inputsToSign: inputsToSign,
            },
            onFinish: (response) => {
                if (response.txId) {
                    txId = response.txId;
                }
                else if (response.psbtBase64) {
                    const signedPsbt = bitcoin.Psbt.fromBase64(String(response.psbtBase64), {
                        network: getBitcoinNetwork(this.network),
                    });
                    signedPsbtHex = signedPsbt.toHex();
                    signedPsbtBase64 = signedPsbt.toBase64();
                }
            },
            onCancel: () => console.log('Canceled'),
        };
        // @ts-ignore
        await signTransaction(signPsbtOptions);
        return {
            signedPsbtHex,
            signedPsbtBase64,
            txId,
        };
    }
    pushPsbt(_tx) {
        throw UNSUPPORTED_PROVIDER_METHOD_ERROR;
    }
}
