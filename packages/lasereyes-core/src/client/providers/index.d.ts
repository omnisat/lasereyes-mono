import { MapStore, WritableAtom } from 'nanostores';
import { LaserEyesStoreType } from '../types';
import { Config, NetworkType, ProviderType } from '../../types';
import { LaserEyesClient } from '..';
export declare const UNSUPPORTED_PROVIDER_METHOD_ERROR: Error;
export declare const WALLET_NOT_INSTALLED_ERROR: Error;
export declare abstract class WalletProvider {
    readonly parent: LaserEyesClient;
    readonly config?: Config | undefined;
    readonly $store: MapStore<LaserEyesStoreType>;
    readonly $network: WritableAtom<NetworkType>;
    constructor(stores: {
        readonly $store: MapStore<LaserEyesStoreType>;
        readonly $network: WritableAtom<NetworkType>;
    }, parent: LaserEyesClient, config?: Config | undefined);
    disconnect(): void;
    abstract initialize(): void;
    abstract dispose(): void;
    abstract connect(defaultWallet: ProviderType): Promise<void>;
    abstract requestAccounts(): Promise<string[]>;
    switchNetwork(_network: NetworkType): void;
    abstract getNetwork(): Promise<NetworkType | undefined>;
    abstract getPublicKey(): Promise<string | undefined>;
    abstract getBalance(): Promise<bigint | string | number>;
    abstract getInscriptions(): Promise<any[]>;
    abstract sendBTC(to: string, amount: number): Promise<string>;
    abstract signMessage(message: string, toSignAddress?: string): Promise<string>;
    abstract signPsbt(tx: string, psbtHex: string, psbtBase64: string, finalize?: boolean, broadcast?: boolean): Promise<{
        signedPsbtHex: string | undefined;
        signedPsbtBase64: string | undefined;
        txId?: string;
    } | undefined>;
    abstract pushPsbt(tx: string): Promise<string | undefined>;
}
//# sourceMappingURL=index.d.ts.map