import { createChainDataSource } from '../../data-source'
import type {
  BaseCapability,
  Brc20Capability,
  ChainDataSource,
  InscriptionCapability,
  NetworkType,
  RuneCapability,
} from '../../types'
import { baseCapabilities } from './base'
import { brc20Capabilities } from './brc20'
import type { MaestroConfig } from './config'
import { inscriptionCapabilities } from './inscriptions'
import { runeCapabilities } from './runes'

export { baseCapabilities } from './base'
export { brc20Capabilities } from './brc20'
export type { MaestroConfig } from './config'
export { inscriptionCapabilities } from './inscriptions'
export { runeCapabilities } from './runes'

export function createDataSource(
  config: {
    network: NetworkType
  } & MaestroConfig
): ChainDataSource<
  BaseCapability &
    InscriptionCapability &
    Brc20Capability &
    Pick<RuneCapability, 'getRuneById' | 'getRuneByName'>
> {
  return createChainDataSource({ network: config.network })
    .extend(baseCapabilities(config))
    .extend(inscriptionCapabilities(config))
    .extend(brc20Capabilities(config))
    .extend(runeCapabilities(config))
}
