import { createChainDataSource } from '../../data-source'
import type {
  AlkaneCapability,
  BaseCapability,
  ChainDataSource,
  InscriptionCapability,
  NetworkType,
  OrdCapability,
  RuneCapability,
} from '../../types'
import { alkaneCapabilities } from './alkanes'
import { baseCapabilities } from './base'
import type { SandshrewConfig } from './config'
import { inscriptionCapabilities } from './inscriptions'
import { ordCapabilities } from './ord'
import { runeCapabilities } from './runes'

export { alkaneCapabilities } from './alkanes'
export { baseCapabilities } from './base'
export type { SandshrewConfig } from './config'
export { inscriptionCapabilities } from './inscriptions'
export { ordCapabilities } from './ord'
export { runeCapabilities } from './runes'

export function createDataSource(
  config: {
    network: NetworkType
  } & SandshrewConfig
): ChainDataSource<
  BaseCapability & RuneCapability & AlkaneCapability & InscriptionCapability & OrdCapability
> {
  return createChainDataSource({ network: config.network })
    .extend(baseCapabilities(config))
    .extend(runeCapabilities(config))
    .extend(alkaneCapabilities(config))
    .extend(inscriptionCapabilities(config))
    .extend(ordCapabilities(config))
}
