import { WalletProvider } from '.';
import { ProviderType, NetworkType } from '../../types';
export default class PhantomProvider extends WalletProvider {
    get library(): any | undefined;
    get network(): NetworkType;
    observer?: MutationObserver;
    initialize(): void;
    addListeners(): void;
    removeListeners(): void;
    dispose(): void;
    private handleAccountsChanged;
    private handleNetworkChanged;
    connect(_: ProviderType): Promise<void>;
    getNetwork(): Promise<"testnet" | "mainnet">;
    sendBTC(to: string, amount: number): Promise<string>;
    signMessage(message: string, toSignAddress?: string | undefined): Promise<string>;
    signPsbt(_: string, psbtHex: string, __: string, finalize?: boolean | undefined, broadcast?: boolean | undefined): Promise<{
        signedPsbtHex: string | undefined;
        signedPsbtBase64: string | undefined;
        txId?: string | undefined;
    } | undefined>;
    pushPsbt(tx: string): Promise<string | undefined>;
    getPublicKey(): Promise<string>;
    getBalance(): Promise<any>;
    getInscriptions(): Promise<any[]>;
    requestAccounts(): Promise<string[]>;
    switchNetwork(network: NetworkType): Promise<void>;
}
//# sourceMappingURL=phantom.d.ts.map