import axios from 'axios';
import { WALLET_NOT_INSTALLED_ERROR, WalletProvider } from '.';
import { FRACTAL_TESTNET, FRACTAL_MAINNET, WIZZ_MAINNET, getNetworkForWizz, WIZZ, } from '../..';
import { getMempoolSpaceUrl } from '../../lib/urls';
import * as bitcoin from 'bitcoinjs-lib';
import { listenKeys } from 'nanostores';
export class WizzProvider extends WalletProvider {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "observer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    get library() {
        return window.wizz;
    }
    get network() {
        return this.$network.get();
    }
    handleNetworkChanged(_network) {
        // const foundNetwork = getNetworkForWizz(_network);
        // this.$network.set(foundNetwork);
        this.parent.connect(WIZZ);
    }
    handleAccountsChanged(accounts) {
        if (!accounts.length) {
            this.parent.disconnect();
            return;
        }
        if (this.$store.get().accounts[0] === accounts[0]) {
            return;
        }
        this.$store.setKey('accounts', accounts);
    }
    initialize() {
        listenKeys(this.$store, ['provider'], (value) => {
            if (value.provider === WIZZ) {
                this.addLibraryListeners();
            }
            else {
                this.removeLibraryListeners();
            }
        });
        this.observer = new window.MutationObserver(() => {
            if (this.library) {
                this.$store.setKey('hasProvider', {
                    ...this.$store.get().hasProvider,
                    [WIZZ]: true,
                });
                this.observer?.disconnect();
            }
        });
        this.observer.observe(document, { childList: true, subtree: true });
    }
    removeLibraryListeners() {
        this.library?.removeListener('networkChanged', this.handleNetworkChanged.bind(this));
        this.library?.removeListener('accountsChanged', this.handleAccountsChanged.bind(this));
    }
    addLibraryListeners() {
        this.library?.on('networkChanged', this.handleNetworkChanged.bind(this));
        this.library?.on('accountsChanged', this.handleAccountsChanged.bind(this));
    }
    dispose() {
        this.observer?.disconnect();
        this.removeLibraryListeners();
    }
    async connect() {
        if (!this.library)
            throw WALLET_NOT_INSTALLED_ERROR;
        const wizzAccounts = await this.library.requestAccounts();
        if (!wizzAccounts)
            throw new Error('No accounts found');
        const wizzPubKey = await this.library.getPublicKey();
        if (!wizzPubKey)
            throw new Error('No public key found');
        this.$store.setKey('accounts', wizzAccounts);
        this.$store.setKey('address', wizzAccounts[0]);
        this.$store.setKey('paymentAddress', wizzAccounts[0]);
        this.$store.setKey('publicKey', wizzPubKey);
        this.$store.setKey('paymentPublicKey', wizzPubKey);
        this.$store.setKey('provider', WIZZ);
        await this.getNetwork().then((network) => {
            if (network && this.config?.network !== network) {
                this.parent.switchNetwork(network);
            }
        });
        await this.parent.getBalance();
        this.$store.setKey('connected', true);
    }
    async requestAccounts() {
        return await this.library.requestAccounts();
    }
    async getNetwork() {
        const wizzNetwork = await this.library?.getNetwork();
        return wizzNetwork ? getNetworkForWizz(wizzNetwork) : undefined;
    }
    async switchNetwork(_network) {
        if (_network === FRACTAL_TESTNET || _network === FRACTAL_MAINNET) {
            return await this.library.switchNetwork(WIZZ_MAINNET);
        }
        const wantedNetwork = getNetworkForWizz(_network);
        await this.library?.switchNetwork(wantedNetwork);
        this.$network.set(_network);
        await this.parent.getBalance();
    }
    async getPublicKey() {
        return await this.library?.getPublicKey();
    }
    async getBalance() {
        const balanceResponse = await this.library.getBalance();
        return balanceResponse.total;
    }
    async getInscriptions() {
        return await this.library.getInscriptions(0, 10);
    }
    async sendBTC(to, amount) {
        const txId = await this.library?.sendBitcoin(to, amount);
        if (txId) {
            return txId;
        }
        else {
            throw new Error('Error sending BTC');
        }
    }
    async signMessage(message) {
        return await this.library?.signMessage(message);
    }
    async signPsbt(_, psbtHex, __, finalize, broadcast) {
        const signedPsbt = await this.library?.signPsbt(psbtHex, {
            autoFinalized: finalize,
            broadcast: false,
        });
        const psbtSignedPsbt = bitcoin.Psbt.fromHex(signedPsbt);
        let txId;
        if (finalize && broadcast) {
            txId = await this.pushPsbt(signedPsbt);
        }
        return {
            signedPsbtHex: psbtSignedPsbt.toHex(),
            signedPsbtBase64: psbtSignedPsbt.toBase64(),
            txId: txId,
        };
    }
    async pushPsbt(tx) {
        return await axios
            .post(`${getMempoolSpaceUrl(this.$network.get())}/api/tx`, tx)
            .then((res) => res.data);
    }
}
