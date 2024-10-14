import { WalletProvider } from '.';
import { NetworkType } from '../..';
export declare class WizzProvider extends WalletProvider {
    get library(): any | undefined;
    get network(): string;
    observer?: MutationObserver;
    private handleNetworkChanged;
    private handleAccountsChanged;
    initialize(): void;
    private removeLibraryListeners;
    private addLibraryListeners;
    dispose(): void;
    connect(): Promise<void>;
    requestAccounts(): Promise<string[]>;
    getNetwork(): Promise<NetworkType | undefined>;
    switchNetwork(_network: NetworkType): Promise<void>;
    getPublicKey(): Promise<string | undefined>;
    getBalance(): Promise<string | number | bigint>;
    getInscriptions(): Promise<any[]>;
    sendBTC(to: string, amount: number): Promise<string>;
    signMessage(message: string): Promise<string>;
    signPsbt(_: string, psbtHex: string, __: string, finalize?: boolean | undefined, broadcast?: boolean | undefined): Promise<{
        signedPsbtHex: string | undefined;
        signedPsbtBase64: string | undefined;
        txId?: string | undefined;
    } | undefined>;
    pushPsbt(tx: string): Promise<string | undefined>;
}
//# sourceMappingURL=wizz.d.ts.map