import { BitcoinNetworkType } from '@orangecrypto/orange-connect'
export const XVERSE_NETWORK: 'Mainnet' | 'Testnet' = 'Mainnet'

export const UNISAT_MAINNET = 'BITCOIN_MAINNET'
export const UNISAT_TESTNET = 'BITCOIN_TESTNET'
export const UNISAT_TESTNET4 = 'BITCOIN_TESTNET4'
export const UNISAT_SIGNET = 'BITCOIN_SIGNET'
export const UNISAT_FRACTAL_MAINNET = 'FRACTAL_BITCOIN_MAINNET'
export const UNISAT_FRACTAL_TESTNET = 'FRACTAL_BITCOIN_TESTNET'

export const OP_WALLET_MAINNET = 'livenet'
export const OP_WALLET_TESTNET = 'testnet'

export const XVERSE_MAINNET = 'Mainnet'
export const XVERSE_TESTNET = 'Testnet'
export const XVERSE_SIGNET = 'Signet'

export const OKX_MAINNET = 'livenet'
export const OKX_TESTNET = 'testnet'

export const WIZZ_MAINNET = 'livenet'
export const WIZZ_TESTNET = 'testnet'
export const WIZZ_TESTNET4 = 'testnet4'
export const WIZZ_SIGNET = 'signet'

export const ORANGE_MAINNET = 'Mainnet'
export const ORANGE_TESTNET = 'Testnet'

export const LEATHER_MAINNET = 'mainnet'
export const LEATHER_TESTNET = 'testnet'
export const MAINNET = 'mainnet'
export const SIGNET = 'signet'
export const TESTNET = 'testnet'
export const TESTNET4 = 'testnet4'
export const FRACTAL_MAINNET = 'fractal mainnet'
export const FRACTAL_TESTNET = 'fractal testnet'
export const REGTEST = 'regtest'

export const getSatsConnectNetwork = (network: string) => {
  if (network === MAINNET) return XVERSE_MAINNET
  if (network === TESTNET) return XVERSE_TESTNET
  if (network === SIGNET) return XVERSE_SIGNET
  return XVERSE_MAINNET
}

export const getLeatherNetwork = (network: string) => {
  if (network === MAINNET) return LEATHER_MAINNET
  if (network === TESTNET) return LEATHER_TESTNET
  return LEATHER_MAINNET
}

export const getUnisatNetwork = (network: string) => {
  if (network === MAINNET) return UNISAT_MAINNET
  if (network === TESTNET) return UNISAT_TESTNET
  if (network === TESTNET4) return UNISAT_TESTNET4
  if (network === SIGNET) return UNISAT_SIGNET
  if (network === FRACTAL_MAINNET) return UNISAT_FRACTAL_MAINNET
  if (network === FRACTAL_TESTNET) return UNISAT_FRACTAL_TESTNET
  return UNISAT_MAINNET
}

export const getWizzNetwork = (network: string) => {
  if (network === MAINNET) return WIZZ_MAINNET
  if (network === TESTNET) return WIZZ_TESTNET
  if (network === TESTNET4) return WIZZ_TESTNET4
  if (network === SIGNET) return WIZZ_SIGNET
  if (network === FRACTAL_TESTNET) return WIZZ_TESTNET
  if (network === FRACTAL_MAINNET) return WIZZ_MAINNET
  return WIZZ_MAINNET
}

export const getOrangeNetwork = (network: string): BitcoinNetworkType => {
  if (network === MAINNET) return ORANGE_MAINNET as BitcoinNetworkType
  if (network === TESTNET) return ORANGE_TESTNET as BitcoinNetworkType
  return ORANGE_MAINNET as BitcoinNetworkType
}

export const getNetworkForUnisat = (network: string) => {
  if (network === UNISAT_MAINNET) return MAINNET
  if (network === UNISAT_TESTNET) return TESTNET
  if (network === UNISAT_TESTNET4) return TESTNET4
  if (network === UNISAT_SIGNET) return SIGNET
  if (network === UNISAT_FRACTAL_MAINNET) return FRACTAL_MAINNET
  if (network === UNISAT_FRACTAL_TESTNET) return FRACTAL_TESTNET
  return MAINNET
}

export const getNetworkForXverse = (network: string) => {
  if (network === XVERSE_MAINNET) return MAINNET
  if (network === XVERSE_TESTNET) return TESTNET
  return MAINNET
}

export const getNetworkForLeather = (network: string) => {
  if (network === LEATHER_MAINNET) return MAINNET
  if (network === LEATHER_TESTNET) return TESTNET
  return MAINNET
}

export const getNetworkForOkx = (network: string) => {
  if (network === OKX_MAINNET) return MAINNET
  if (network === OKX_TESTNET) return TESTNET
  return MAINNET
}

export const getNetworkForWizz = (network: string) => {
  if (network === WIZZ_MAINNET) return MAINNET
  if (network === WIZZ_TESTNET) return TESTNET
  if (network === WIZZ_TESTNET4) return TESTNET4
  if (network === WIZZ_SIGNET) return SIGNET
  if (network === FRACTAL_TESTNET) return TESTNET
  if (network === FRACTAL_MAINNET) return MAINNET

  return MAINNET
}
