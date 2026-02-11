export enum BaseNetwork {
  MAINNET = 'mainnet',
  SIGNET = 'signet',
  TESTNET = 'testnet',
  TESTNET4 = 'testnet4',
  REGTEST = 'regtest',
  FRACTAL_MAINNET = 'fractal_mainnet',
  FRACTAL_TESTNET = 'fractal_testnet',
  OYLNET = 'oylnet',
}

export type BaseNetworkType =
  | typeof BaseNetwork.MAINNET
  | typeof BaseNetwork.TESTNET
  | typeof BaseNetwork.TESTNET4
  | typeof BaseNetwork.SIGNET
  | typeof BaseNetwork.FRACTAL_MAINNET
  | typeof BaseNetwork.FRACTAL_TESTNET
  | typeof BaseNetwork.OYLNET

export type NetworkType = BaseNetworkType | string
