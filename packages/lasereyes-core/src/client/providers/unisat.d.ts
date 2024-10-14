import { WalletProvider } from '.';
import { ProviderType, NetworkType } from '../../types';
export default class UnisatProvider extends WalletProvider {
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
    getNetwork(): Promise<NetworkType>;
    sendBTC(to: string, amount: number): Promise<string>;
    signMessage(message: string, _?: string | undefined): Promise<string>;
    signPsbt(_: string, psbtHex: string, __: string, finalize?: boolean | undefined, broadcast?: boolean | undefined): Promise<{
        signedPsbtHex: string | undefined;
        signedPsbtBase64: string | undefined;
        txId?: string | undefined;
    } | undefined>;
    pushPsbt(tx: string): Promise<string | undefined>;
    getPublicKey(): Promise<any>;
    getBalance(): Promise<any>;
    getInscriptions(): Promise<any[]>;
    requestAccounts(): Promise<string[]>;
    switchNetwork(network: NetworkType): Promise<void>;
}
//# sourceMappingURL=unisat.d.ts.map