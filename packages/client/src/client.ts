import { NetworkMismatchError } from './errors'
import type { ChainDataSource, Client, ClientConfig, NetworkType } from './types'

export function createClient<TDS>(config: ClientConfig<TDS>): Client<TDS> {
  if (config.dataSource.network !== config.network) {
    throw new NetworkMismatchError(config.network, config.dataSource.network)
  }

  function buildClient<TActions>(
    network: NetworkType,
    dataSource: ChainDataSource<TDS>,
    actions: TActions
  ): Client<TDS, TActions> {
    const client = {
      network,
      dataSource,
      extend<TNew>(factory: (c: Client<TDS, TActions>) => TNew): Client<TDS, TActions & TNew> {
        const newActions = factory(client)
        const merged = { ...actions, ...newActions } as TActions & TNew
        return buildClient(network, dataSource, merged)
      },
      ...(actions as object),
    } as Client<TDS, TActions>
    return client
  }

  return buildClient(config.network, config.dataSource, {} as object) as Client<TDS>
}
