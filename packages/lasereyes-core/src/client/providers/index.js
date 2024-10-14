export const UNSUPPORTED_PROVIDER_METHOD_ERROR = new Error("The connected wallet doesn't support this method...");
export const WALLET_NOT_INSTALLED_ERROR = new Error('Wallet is not installed');
export class WalletProvider {
    constructor(stores, parent, config) {
        Object.defineProperty(this, "parent", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: parent
        });
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: config
        });
        Object.defineProperty(this, "$store", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "$network", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.$store = stores.$store;
        this.$network = stores.$network;
        this.initialize();
    }
    disconnect() { }
    switchNetwork(_network) {
        this.parent.disconnect();
        throw UNSUPPORTED_PROVIDER_METHOD_ERROR;
    }
}
