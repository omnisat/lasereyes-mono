import * as bitcoin from 'bitcoinjs-lib';
import { getAddress, signMessage, sendBtcTransaction, BitcoinNetworkType, MessageSigningProtocols, } from 'sats-connect';
import { UNSUPPORTED_PROVIDER_METHOD_ERROR, WalletProvider } from '.';
import { MAGIC_EDEN, getSatsConnectNetwork, MAINNET, TESTNET, TESTNET4, SIGNET, FRACTAL_TESTNET, } from '../..';
import { findOrdinalsAddress, findPaymentAddress, getBTCBalance, getBitcoinNetwork, } from '../../lib/helpers';
import { listenKeys } from 'nanostores';
import { persistentMap } from '@nanostores/persistent';
import { fromOutputScript } from 'bitcoinjs-lib/src/address';
import axios from 'axios';
import { getMempoolSpaceUrl } from '../../lib/urls';
const keysToPersist = [
    'address',
    'paymentAddress',
    'publicKey',
    'paymentPublicKey',
    'balance',
];
const MAGIC_EDEN_WALLET_PERSISTENCE_KEY = 'MAGIC_EDEN_CONNECTED_WALLET_STATE';
export default class MagicEdenProvider extends WalletProvider {
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
            value: persistentMap(MAGIC_EDEN_WALLET_PERSISTENCE_KEY, {
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
        return window.magicEden.bitcoin;
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
        if (changedKey && newState.provider === MAGIC_EDEN) {
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
            if (newVal.provider !== MAGIC_EDEN) {
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
            const xverseLib = window?.magicEden.bitcoin;
            if (xverseLib) {
                this.$store.setKey('hasProvider', {
                    ...this.$store.get().hasProvider,
                    [MAGIC_EDEN]: true,
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
            let magicEdenNetwork = getSatsConnectNetwork(this.network || MAINNET);
            const getAddressOptions = {
                getProvider: async () => this.library,
                payload: {
                    purposes: ['ordinals', 'payment'],
                    message: 'Address for receiving Ordinals and payments',
                    network: {
                        type: magicEdenNetwork,
                    },
                },
                onFinish: (response) => {
                    const foundAddress = findOrdinalsAddress(response.addresses);
                    const foundPaymentAddress = findPaymentAddress(response.addresses);
                    if (foundAddress && foundPaymentAddress) {
                        this.$store.setKey('provider', MAGIC_EDEN);
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
                    throw new Error(`User canceled lasereyes to ${MAGIC_EDEN} wallet`);
                },
                onError: (_) => {
                    throw new Error(`Can't lasereyes to ${MAGIC_EDEN} wallet`);
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
        let sendResponse;
        await sendBtcTransaction({
            getProvider: async () => this.library,
            payload: {
                network: {
                    type: getSatsConnectNetwork(this.network),
                },
                recipients: [
                    {
                        address: to,
                        amountSats: BigInt(amount),
                    },
                ],
                senderAddress: this.$store.get().paymentAddress,
            },
            onFinish: (response) => {
                // @ts-ignore
                sendResponse = response;
            },
            onCancel: () => alert('Canceled'),
        });
        // @ts-ignore
        if (!sendResponse)
            throw new Error('Error sending BTC');
        // @ts-ignore
        return sendResponse.txid;
    }
    async signMessage(message, toSignAddress) {
        try {
            const tempAddy = toSignAddress || this.$store.get().paymentAddress;
            let signedMessage = '';
            await signMessage({
                getProvider: async () => this.library,
                payload: {
                    network: {
                        type: BitcoinNetworkType.Mainnet,
                    },
                    address: tempAddy,
                    message: message,
                    protocol: MessageSigningProtocols.BIP322,
                },
                onFinish: (response) => {
                    signedMessage = response;
                },
                onCancel: () => {
                    alert('Request canceled');
                },
            });
            return signedMessage;
        }
        catch (e) {
            throw e;
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
            const { script } = input.witnessUtxo;
            const addressFromScript = fromOutputScript(script, getBitcoinNetwork(this.network));
            if (addressFromScript === paymentAddress) {
                paymentsAddressData.signingIndexes.push(Number(counter));
            }
            else if (addressFromScript === address) {
                ordinalAddressData.signingIndexes.push(Number(counter));
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
        const magicEdenNetwork = getSatsConnectNetwork(this.network);
        const signPsbtOptions = {
            getProvider: async () => this.library,
            payload: {
                network: {
                    type: magicEdenNetwork,
                },
                message: 'Sign Transaction',
                psbtBase64: toSignPsbt.toBase64(),
                broadcast: broadcast,
                inputsToSign: inputsToSign,
            },
            onFinish: (response) => {
                if (response.psbtBase64) {
                    const signedPsbt = bitcoin.Psbt.fromBase64(String(response.psbtBase64), {
                        network: getBitcoinNetwork(this.network),
                    });
                    signedPsbtHex = signedPsbt.toHex();
                    signedPsbtBase64 = signedPsbt.toBase64();
                }
            },
            onCancel: () => {
                console.log('Canceled');
                throw new Error('User canceled the request');
            },
            onError: (error) => {
                console.log('error', error);
                throw error;
            },
        };
        // @ts-ignore
        await signTransaction(signPsbtOptions);
        if (broadcast) {
            const signed = bitcoin.Psbt.fromBase64(String(signedPsbtBase64));
            const finalized = signed.finalizeAllInputs();
            const extracted = finalized.extractTransaction();
            const txId = await this.pushPsbt(extracted.toHex());
            return {
                signedPsbtHex: extracted.toHex(),
                signedPsbtBase64: 'test',
                txId,
            };
        }
        else {
            return {
                signedPsbtHex,
                signedPsbtBase64,
                txId,
            };
        }
    }
    async pushPsbt(_tx) {
        return await axios
            .post(`${getMempoolSpaceUrl(this.network)}/api/tx`, _tx)
            .then((res) => res.data);
    }
}
