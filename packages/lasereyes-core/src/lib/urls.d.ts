import { FRACTAL_MAINNET, FRACTAL_TESTNET, MAINNET, SIGNET, TESTNET, TESTNET4 } from '../constants/networks';
export declare const MEMPOOL_SPACE_URL = "https://mempool.space";
export declare const MEMPOOL_SPACE_TESTNET_URL = "https://mempool.space/testnet";
export declare const MEMPOOL_SPACE_TESTNET4_URL = "https://mempool.space/testnet4";
export declare const MEMPOOL_SPACE_SIGNET_URL = "https://mempool.space/signet";
export declare const MEMPOOL_SPACE_FRACTAL_MAINNET_URL = "https://mempool.fractalbitcoin.io";
export declare const MEMPOOL_SPACE_FRACTAL_TESTNET_URL = "https://mempool-testnet.fractalbitcoin.io";
export declare const getMempoolSpaceUrl: (network: typeof MAINNET | typeof TESTNET | typeof TESTNET4 | typeof SIGNET | typeof FRACTAL_MAINNET | typeof FRACTAL_TESTNET) => "https://mempool.space" | "https://mempool.space/testnet" | "https://mempool.space/testnet4" | "https://mempool.space/signet" | "https://mempool.fractalbitcoin.io" | "https://mempool-testnet.fractalbitcoin.io";
//# sourceMappingURL=urls.d.ts.map