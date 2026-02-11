import type { NetworkType } from './network'

export interface CapabilityGroup<T> {
  group: string
  methods: T
}

export type DataSourceContext = {
  network: NetworkType
  config: Record<string, unknown>
}

export type ChainDataSource<TCapabilities = object> = {
  network: NetworkType
  getCapabilities(): Record<string, string[]>
  extend<TNew>(
    factory: (context: DataSourceContext) => CapabilityGroup<TNew>
  ): ChainDataSource<TCapabilities & TNew>
} & TCapabilities
