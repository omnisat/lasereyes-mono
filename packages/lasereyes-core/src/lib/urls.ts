import {
  FRACTAL_MAINNET,
  FRACTAL_TESTNET,
  OYLNET,
  SIGNET,
  TESTNET,
  TESTNET4,
} from '../constants/networks'
import { NetworkType } from '../types'

export const SANDSHREW_URL_MAINNET: string = 'https://mainnet.sandshrew.io/v2'
export const SANDSHREW_URL_SIGNET: string = 'https://signet.sandshrew.io/v2'
export const SANDSHREW_URL_TESTNET: string = 'https://testnet.sandshrew.io/v2'
export const SANDSHREW_URL_OYLNET: string = 'https://oylnet.oyl.gg/v2'

export const SANDSHREW_LASEREYES_KEY: string = 'lasereyes'
export const MAESTRO_API_KEY_MAINNET: string =
  'VIOi9IApvUkDFWBQ7I9oHsfUMWOIfDeO'
export const MAESTRO_API_KEY_TESTNET4: string =
  'bVG4GSXShooC9f67hq5YQWAJfZyRPrEN'

export const MAESTRO_API_URL_MAINNET: string =
  'https://xbt-mainnet.gomaestro-api.org/v0'
export const MAESTRO_API_URL_TESTNET4: string =
  'https://xbt-testnet.gomaestro-api.org/v0'

export const MEMPOOL_SPACE_URL = 'https://mempool.space'
export const MEMPOOL_SPACE_URL_TESTNET = 'https://mempool.space/testnet'
export const MEMPOOL_SPACE_URL_TESTNET4 = 'https://mempool.space/testnet4'
export const MEMPOOL_SPACE_URL_SIGNET = 'https://mempool.space/signet'
export const MEMPOOL_SPACE_URL_FRACTAL_MAINNET =
  'https://mempool.fractalbitcoin.io'
export const MEMPOOL_SPACE_URL_FRACTAL_TESTNET =
  'https://mempool-testnet.fractalbitcoin.io'

export const UNISAT_CONTENT_URL_MAINNET: string =
  'https://static.unisat.io/content'
export const UNISAT_CONTENT_URL_TESTNET: string =
  'https://static-testnet.unisat.io/content'
export const UNISAT_CONTENT_URL_TESTNET4: string =
  'https://ordinals-testnet4.unisat.io/content'
export const UNISAT_CONTENT_URL_FRACTAL_MAINNET: string =
  'https://ordinals.fractalbitcoin.io/content'
export const UNISAT_CONTENT_URL_FRACTAL_TESTNET: string =
  'https://ordinals-testnet.fractalbitcoin.io/content'

export const UNISAT_PREVIEW_URL_MAINNET: string =
  'https://static.unisat.io/preview'
export const UNISAT_PREVIEW_URL_TESTNET: string =
  'https://static-testnet.unisat.io/preview'
export const UNISAT_PREVIEW_URL_TESTNET4: string =
  'https://ordinals-testnet4.unisat.io/preview'
export const UNISAT_PREVIEW_URL_FRACTAL_MAINNET: string =
  'https://ordinals.fractalbitcoin.io/preview'
export const UNISAT_PREVIEW_URL_FRACTAL_TESTNET: string =
  'https://ordinals-testnet.fractalbitcoin.io/preview'

export const getMempoolSpaceUrl = (network: NetworkType) =>
  network === TESTNET
    ? MEMPOOL_SPACE_URL_TESTNET
    : network === TESTNET4
      ? MEMPOOL_SPACE_URL_TESTNET4
      : network === SIGNET
        ? MEMPOOL_SPACE_URL_SIGNET
        : network === FRACTAL_MAINNET
          ? MEMPOOL_SPACE_URL_FRACTAL_MAINNET
          : network === FRACTAL_TESTNET
            ? MEMPOOL_SPACE_URL_FRACTAL_TESTNET
            : MEMPOOL_SPACE_URL

export const getMaestroUrl = (network: NetworkType) =>
  network === TESTNET4 ? MAESTRO_API_URL_TESTNET4 : MAESTRO_API_URL_MAINNET

export const getSandshrewUrl = (network: NetworkType) => {
  switch (network) {
    case OYLNET:
      return SANDSHREW_URL_OYLNET
    case TESTNET:
      return SANDSHREW_URL_TESTNET
    case SIGNET:
      return SANDSHREW_URL_SIGNET
    default:
      return SANDSHREW_URL_MAINNET
  }
}

export const getUnisatContentUrl = (network: NetworkType) => {
  return network === TESTNET
    ? UNISAT_CONTENT_URL_TESTNET
    : network === TESTNET4
      ? UNISAT_CONTENT_URL_TESTNET4
      : network === SIGNET
        ? UNISAT_CONTENT_URL_TESTNET
        : network === FRACTAL_MAINNET
          ? UNISAT_CONTENT_URL_FRACTAL_MAINNET
          : network === FRACTAL_TESTNET
            ? UNISAT_CONTENT_URL_FRACTAL_TESTNET
            : UNISAT_CONTENT_URL_MAINNET
}

export const getUnisatPreviewUrl = (network: NetworkType) => {
  return network === TESTNET
    ? UNISAT_PREVIEW_URL_TESTNET
    : network === TESTNET4
      ? UNISAT_PREVIEW_URL_TESTNET4
      : network === SIGNET
        ? UNISAT_PREVIEW_URL_TESTNET
        : network === FRACTAL_MAINNET
          ? UNISAT_PREVIEW_URL_FRACTAL_MAINNET
          : network === FRACTAL_TESTNET
            ? UNISAT_PREVIEW_URL_FRACTAL_TESTNET
            : UNISAT_PREVIEW_URL_MAINNET
}
