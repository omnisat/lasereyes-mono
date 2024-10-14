import * as bitcoin from 'bitcoinjs-lib';
import { fromOutputScript } from 'bitcoinjs-lib/src/address';
import orange, { getAddress, } from '@orangecrypto/orange-connect';
import { UNSUPPORTED_PROVIDER_METHOD_ERROR, WalletProvider } from '.';
import { MAINNET, TESTNET, TESTNET4, SIGNET, FRACTAL_TESTNET, getOrangeNetwork, ORANGE, } from '../..';
import { findOrdinalsAddress, findPaymentAddress, getBTCBalance, getBitcoinNetwork, } from '../../lib/helpers';
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
const { signMessage: signMessageOrange, sendBtcTransaction: sendBtcTxOrange, signTransaction: signPsbtOrange, } = orange;
const ORANGE_WALLET_PERSISTENCE_KEY = 'ORANGE_CONNECTED_WALLET_STATE';
export default class OrangeProvider extends WalletProvider {
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
            value: persistentMap(ORANGE_WALLET_PERSISTENCE_KEY, {
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
        return window?.OrangeWalletProviders?.OrangeBitcoinProvider;
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
        if (changedKey && newState.provider === ORANGE) {
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
            if (newVal.provider !== ORANGE) {
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
            const orangeLib = window?.OrangeWalletProviders
                ?.OrangeBitcoinProvider;
            if (orangeLib) {
                this.$store.setKey('hasProvider', {
                    ...this.$store.get().hasProvider,
                    [ORANGE]: true,
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
        const { address, paymentAddress } = this.$valueStore.get();
        try {
            if (address) {
                this.restorePersistedValues();
                getBTCBalance(paymentAddress, this.network).then((totalBalance) => {
                    this.$store.setKey('balance', totalBalance);
                });
                return;
            }
            let orangeNetwork = getOrangeNetwork(this.network || MAINNET);
            const getAddressOptions = {
                payload: {
                    purposes: ['ordinals', 'payment'],
                    message: 'Address for receiving Ordinals and payments',
                    network: {
                        type: orangeNetwork,
                    },
                },
                onFinish: (response) => {
                    const foundAddress = findOrdinalsAddress(response.addresses);
                    const foundPaymentAddress = findPaymentAddress(response.addresses);
                    if (foundAddress && foundPaymentAddress) {
                        this.$store.setKey('publicKey', String(response.addresses[0].publicKey));
                        this.$store.setKey('paymentPublicKey', String(response.addresses[1].publicKey));
                        this.$store.setKey('provider', ORANGE);
                        this.$store.setKey('address', foundAddress.address);
                        this.$store.setKey('paymentAddress', foundPaymentAddress.address);
                    }
                    getBTCBalance(foundPaymentAddress.address, this.network).then((totalBalance) => {
                        this.$store.setKey('balance', totalBalance);
                    });
                },
                onCancel: () => {
                    throw new Error(`User canceled lasereyes to ${ORANGE} wallet`);
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
        let txId = '';
        const sendBtcOptions = {
            payload: {
                network: {
                    type: getOrangeNetwork(this.network),
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
                console.log(response);
                txId = response;
            },
            onCancel: () => {
                throw new Error('User canceled the request');
            },
        };
        await sendBtcTxOrange(sendBtcOptions);
        return txId;
    }
    async signMessage(message, toSignAddress) {
        let signature = '';
        const tempAddy = toSignAddress || this.$store.get().paymentAddress;
        const signMessageOptions = {
            payload: {
                network: {
                    type: getOrangeNetwork(this.network),
                },
                address: tempAddy,
                message: message,
            },
            onFinish: (response) => {
                signature = response;
            },
            onCancel: () => alert('Signature request canceled'),
        };
        await signMessageOrange(signMessageOptions);
        return signature;
    }
    async signPsbt(_, __, psbtBase64, _finalize, broadcast) {
        const toSignPsbt = bitcoin.Psbt.fromBase64(String(psbtBase64), {
            network: getBitcoinNetwork(this.network),
        });
        const address = this.$store.get().address;
        const paymentAddress = this.$store.get().paymentAddress;
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
                const addressFromScript = fromOutputScript(script, getBitcoinNetwork(this.network));
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
        const signPsbtOptions = {
            payload: {
                network: {
                    type: getOrangeNetwork(this.network),
                },
                psbtBase64: toSignPsbt.toBase64(),
                broadcast: broadcast,
                inputsToSign: inputsToSign,
            },
            onFinish: (response) => {
                console.log(response);
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
        await signPsbtOrange(signPsbtOptions);
        return {
            signedPsbtHex,
            signedPsbtBase64,
            txId,
        };
    }
    async pushPsbt(_tx) {
        let payload = _tx;
        if (!payload.startsWith('02')) {
            const psbtObj = bitcoin.Psbt.fromHex(payload);
            psbtObj.finalizeAllInputs();
            payload = psbtObj.extractTransaction().toHex();
        }
        return await axios
            .post(`${getMempoolSpaceUrl(this.network)}/api/tx`, payload)
            .then((res) => res.data);
    }
}
