/**
 * Enumeration of supported Bitcoin network identifiers.
 *
 * @remarks
 * Used throughout the library to configure data sources and clients
 * for the correct network. Includes Bitcoin mainnet, testnets, and
 * Fractal sidechain networks.
 */
export enum BaseNetwork {
  /** Bitcoin mainnet. */
  MAINNET = 'mainnet',
  /** Bitcoin Signet (testing network with signed blocks). */
  SIGNET = 'signet',
  /** Bitcoin Testnet3 (legacy testnet). */
  TESTNET = 'testnet',
  /** Bitcoin Testnet4. */
  TESTNET4 = 'testnet4',
  /** Bitcoin Regtest (local regression testing). */
  REGTEST = 'regtest',
  /** Fractal Bitcoin mainnet (sidechain). */
  FRACTAL_MAINNET = 'fractal_mainnet',
  /** Fractal Bitcoin testnet (sidechain). */
  FRACTAL_TESTNET = 'fractal_testnet',
  /** OylNet (development network). */
  OYLNET = 'oylnet',
}

/**
 * Union type of all known {@link BaseNetwork} values (excluding `REGTEST`).
 *
 * @remarks
 * This type represents the set of networks that vendor data sources are expected to support.
 */
export type BaseNetworkType =
  | typeof BaseNetwork.MAINNET
  | typeof BaseNetwork.TESTNET
  | typeof BaseNetwork.TESTNET4
  | typeof BaseNetwork.SIGNET
  | typeof BaseNetwork.FRACTAL_MAINNET
  | typeof BaseNetwork.FRACTAL_TESTNET
  | typeof BaseNetwork.OYLNET

/**
 * A network identifier accepted by data sources and clients.
 *
 * @remarks
 * Extends {@link BaseNetworkType} with `string` to allow custom/unknown network identifiers.
 */
export type NetworkType = BaseNetworkType | string
