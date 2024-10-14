import { WalletProvider } from '.';
import { ProviderType, NetworkType, LaserEyesStoreType } from '../..';
import { MapStore } from 'nanostores';
declare const keysToPersist: readonly ["address", "paymentAddress", "publicKey", "paymentPublicKey", "balance"];
type PersistedKey = (typeof keysToPersist)[number];
export default class MagicEdenProvider extends WalletProvider {
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
    requestAccounts(): Promise<string[]>;
    getNetwork(): Promise<NetworkType | undefined>;
    getPublicKey(): Promise<string | undefined>;
    getBalance(): Promise<string | number | bigint>;
    getInscriptions(): Promise<any[]>;
    sendBTC(to: string, amount: number): Promise<string>;
    signMessage(message: string, toSignAddress?: string | undefined): Promise<string>;
    signPsbt(_: string, __: string, psbtBase64: string, _finalize?: boolean | undefined, broadcast?: boolean | undefined): Promise<{
        signedPsbtHex: string | undefined;
        signedPsbtBase64: string | undefined;
        txId?: string | undefined;
    } | undefined>;
    pushPsbt(_tx: string): Promise<string | undefined>;
}
export {};
//# sourceMappingURL=magic-eden.d.ts.map