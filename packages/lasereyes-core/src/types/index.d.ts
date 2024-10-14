import { FRACTAL_MAINNET, FRACTAL_TESTNET, MAINNET, SIGNET, TESTNET, TESTNET4 } from '../constants/networks';
import { UNISAT, XVERSE, OYL, MAGIC_EDEN, OKX, LEATHER, PHANTOM, WIZZ, ORANGE } from '../constants/wallets';
export type NetworkType = typeof MAINNET | typeof TESTNET | typeof TESTNET4 | typeof SIGNET | typeof FRACTAL_MAINNET | typeof FRACTAL_TESTNET;
export type ProviderType = typeof UNISAT | typeof XVERSE | typeof OYL | typeof MAGIC_EDEN | typeof OKX | typeof LEATHER | typeof PHANTOM | typeof WIZZ | typeof ORANGE;
export type Config = {
    network: typeof MAINNET | typeof TESTNET | typeof TESTNET4 | typeof SIGNET | typeof FRACTAL_MAINNET | typeof FRACTAL_TESTNET;
};
export interface OYLBalanceResponse {
    brc20s: {
        total: number;
    };
    btc: {
        pending: number;
        confirmed: number;
        total: number;
    };
    overall: {
        pending: number;
        confirmed: number;
        total: number;
    };
}
export interface LeatherRPCResponse {
    jsonrpc: string;
    id: string;
    result: LeatherRequestAddressResponse | LeatherRequestSignResponse;
}
export interface LeatherRequestAddressResponse {
    addresses: LeatherAddress[];
}
export interface LeatherRequestSignResponse {
    hex: string;
}
export interface LeatherAddress {
    symbol: string;
    type?: string;
    address: string;
    publicKey?: string;
    derivationPath?: string;
    tweakedPublicKey?: string;
}
export interface SignPsbtRequestParams {
    hex: string;
    signAtIndex?: number | number[];
    broadcast?: boolean;
    network: string;
}
export interface BlockchainInfoResponse {
    notice: string;
    unspent_outputs: BlockchainInfoUTXO[];
}
export interface BlockchainInfoUTXO {
    tx_hash_big_endian: string;
    tx_hash: string;
    tx_output_n: number;
    script: string;
    value: number;
    value_hex: string;
    confirmations: number;
    tx_index: number;
}
export interface MempoolUtxo {
    txid: string;
    vout: number;
    status: {
        confirmed: boolean;
        block_height: number;
        block_hash: string;
        block_time: number;
    };
    value: number;
}
export type PhantomBtcAccount = {
    address: string;
    addressType: 'p2tr' | 'p2wpkh' | 'p2sh' | 'p2pkh';
    publicKey: string;
    purpose: 'payment' | 'ordinals';
};
export type WizzBalanceResponse = {
    unconfirmed: number;
    confirmed: number;
    total: number;
};
export interface UTXO {
    tx_hash_big_endian: string;
    tx_hash: string;
    tx_output_n: number;
    script: string;
    value: number;
    value_hex: string;
    confirmations: number;
    tx_index: number;
}
export interface CommitPsbtResponse {
    inscriberAddress: string;
    psbtHex: string;
    psbtBase64: string;
    feeRate: number;
    totalFees: number;
}
export interface MempoolTransaction {
    txid: string;
    version: number;
    locktime: number;
    vin: Vin[];
    vout: Vout[];
    size: number;
    weight: number;
    sigops: number;
    fee: number;
    status: Status;
}
export interface Vin {
    txid: string;
    vout: number;
    prevout: Prevout;
    scriptsig: string;
    scriptsig_asm: string;
    is_coinbase: boolean;
    sequence: number;
}
export interface Prevout {
    scriptpubkey: string;
    scriptpubkey_asm: string;
    scriptpubkey_type: string;
    scriptpubkey_address: string;
    value: number;
}
export interface Vout {
    scriptpubkey: string;
    scriptpubkey_asm: string;
    scriptpubkey_type: string;
    scriptpubkey_address: string;
    value: number;
}
export interface Status {
    confirmed: boolean;
    block_height: number;
    block_hash: string;
    block_time: number;
}
//# sourceMappingURL=index.d.ts.map