import { MapStore, WritableAtom } from 'nanostores';
import { Config, NetworkType, ProviderType } from '../types';
import { WalletProvider } from './providers';
import { LaserEyesStoreType } from './types';
export declare class LaserEyesClient {
    readonly config?: Config | undefined;
    readonly $store: MapStore<LaserEyesStoreType>;
    readonly $network: WritableAtom<NetworkType>;
    readonly $providerMap: Partial<Record<ProviderType, WalletProvider>>;
    dispose(): void;
    constructor(stores: {
        readonly $store: MapStore<LaserEyesStoreType>;
        readonly $network: WritableAtom<NetworkType>;
    }, config?: Config | undefined);
    private handleIsInitializingChanged;
    connect(defaultWallet: ProviderType): Promise<void>;
    requestAccounts(): Promise<string[] | undefined>;
    disconnect(): void;
    switchNetwork(network: NetworkType): void;
    checkInitializationComplete(): void;
    private watchNetworkChange;
    getNetwork(): Promise<NetworkType | undefined>;
    sendBTC(to: string, amount: number): Promise<string | undefined>;
    signMessage(message: string, toSignAddress?: string): Promise<string | undefined>;
    signPsbt(tx: string, finalize?: boolean, broadcast?: boolean): Promise<{
        signedPsbtHex: string | undefined;
        signedPsbtBase64: string | undefined;
        txId?: string;
    } | undefined>;
    pushPsbt(tx: string): Promise<string | undefined>;
    getPublicKey(): Promise<string | undefined>;
    getBalance(): Promise<string | number | bigint | undefined>;
    getInscriptions(): Promise<any[] | undefined>;
}
//# sourceMappingURL=index.d.ts.map