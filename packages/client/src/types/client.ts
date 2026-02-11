import type { ChainDataSource } from './data-source'
import type { NetworkType } from './network'

export type Client<TDataSource = object, TActions = object> = {
  network: NetworkType
  dataSource: ChainDataSource<TDataSource>
  extend<TNew>(
    factory: (client: Client<TDataSource, TActions>) => TNew
  ): Client<TDataSource, TActions & TNew>
} & TActions

export interface ClientConfig<TDS> {
  network: NetworkType
  dataSource: ChainDataSource<TDS>
}
