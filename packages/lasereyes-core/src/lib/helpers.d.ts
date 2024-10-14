import * as bitcoin from 'bitcoinjs-lib';
import { FRACTAL_MAINNET, FRACTAL_TESTNET, MAINNET, SIGNET, TESTNET, TESTNET4 } from '../constants/networks';
import { MempoolUtxo } from '../types';
export declare const getBitcoinNetwork: (network: typeof MAINNET | typeof TESTNET | typeof TESTNET4 | typeof SIGNET | typeof FRACTAL_MAINNET | typeof FRACTAL_TESTNET) => bitcoin.networks.Network;
export declare const findOrdinalsAddress: (addresses: {
    purpose: string;
    address: string;
}[]) => {
    purpose: string;
    address: string;
} | undefined;
export declare const findPaymentAddress: (addresses: any) => any;
export declare const getBTCBalance: (address: string, network: typeof MAINNET | typeof TESTNET | typeof TESTNET4 | typeof SIGNET | typeof FRACTAL_MAINNET | typeof FRACTAL_TESTNET) => Promise<bigint>;
export declare const satoshisToBTC: (satoshis: number) => string;
export declare const isBase64: (str: string) => boolean;
export declare const isHex: (str: string) => boolean;
export declare function estimateTxSize(taprootInputCount: number, nonTaprootInputCount: number, outputCount: number): number;
export declare function getAddressUtxos(address: string, network: typeof MAINNET | typeof TESTNET | typeof TESTNET4 | typeof SIGNET | typeof FRACTAL_MAINNET | typeof FRACTAL_TESTNET): Promise<MempoolUtxo[]>;
export declare function createSendBtcPsbt(address: string, paymentAddress: string, recipientAddress: string, amount: number, paymentPublicKey: string, network: typeof MAINNET | typeof TESTNET | typeof TESTNET4 | typeof SIGNET | typeof FRACTAL_MAINNET | typeof FRACTAL_TESTNET, feeRate?: number): Promise<{
    psbtBase64: string;
    psbtHex: string;
}>;
export declare function getRedeemScript(paymentPublicKey: string, network: typeof MAINNET | typeof TESTNET | typeof TESTNET4 | typeof SIGNET | typeof FRACTAL_MAINNET | typeof FRACTAL_TESTNET): Uint8Array | undefined;
export declare function delay(ms: number): Promise<unknown>;
//# sourceMappingURL=helpers.d.ts.map