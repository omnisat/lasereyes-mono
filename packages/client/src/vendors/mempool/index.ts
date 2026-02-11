import { createChainDataSource } from '../../data-source'
import type { BaseCapability, ChainDataSource, NetworkType } from '../../types'
import { baseCapabilities } from './base'
import type { MempoolConfig } from './config'

export { baseCapabilities } from './base'
export type { MempoolConfig } from './config'

export function createDataSource(
  config: {
    network: NetworkType
  } & MempoolConfig
): ChainDataSource<BaseCapability> {
  return createChainDataSource({ network: config.network }).extend(baseCapabilities(config))
}
