import { WalletProvider } from '.';
import { ProviderType, NetworkType } from '../../types';
import { MapStore } from 'nanostores';
import { LaserEyesStoreType } from '../types';
declare const keysToPersist: readonly ["address", "paymentAddress", "publicKey", "paymentPublicKey", "balance"];
type PersistedKey = (typeof keysToPersist)[number];
export default class OylProvider extends WalletProvider {
    get library(): any | undefined;
    get network(): NetworkType;
    observer?: MutationObserver;
    $valueStore: MapStore<Record<PersistedKey, string>>;
    removeSubscriber?: Function;
    restorePersistedValues(): void;
    watchStateChange(newState: LaserEyesStoreType, _: LaserEyesStoreType | undefined, changedKey: keyof LaserEyesStoreType | undefined): void;
    initialize(): void;
    dispose(): void;
    connect(_: ProviderType): Promise<void>;
    getNetwork(): Promise<NetworkType>;
    sendBTC(to: string, amount: number): Promise<string>;
    signMessage(message: string, toSignAddress?: string): Promise<string>;
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
    switchNetwork(): Promise<void>;
}
export {};
//# sourceMappingURL=oyl.d.ts.map