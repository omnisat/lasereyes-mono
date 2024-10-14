import { ProviderType } from '../types';
export type LaserEyesStoreType = {
    provider: ProviderType | undefined;
    address: string;
    paymentAddress: string;
    publicKey: string;
    paymentPublicKey: string;
    connected: boolean;
    isConnecting: boolean;
    isInitializing: boolean;
    accounts: string[];
    balance: bigint | undefined;
    hasProvider: Record<ProviderType, boolean | undefined>;
};
//# sourceMappingURL=types.d.ts.map