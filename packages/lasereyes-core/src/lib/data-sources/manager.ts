import { MAESTRO } from '../../constants/data-sources'
import type { AlkanesOutpoint, Config, MempoolUtxo } from '../../types'
import type { DataSource } from '../../types/data-source'
import type { Inscription } from '../../types/lasereyes'
import type { MaestroAddressInscription } from '../../types/maestro'
import { BaseNetwork } from '../../types/network'
import type { OrdRuneBalance } from '../../types/ord'
import {
  getMempoolSpaceUrl,
  MAESTRO_API_KEY_MAINNET,
  MAESTRO_API_KEY_TESTNET4,
  SANDSHREW_LASEREYES_KEY,
  SANDSHREW_URL,
} from '../urls'
import { normalizeBrc20Balances, normalizeInscription } from './normalizations'
import { MaestroDataSource } from './sources/maestro-ds'
import { MempoolSpaceDataSource } from './sources/mempool-space-ds'
import { SandshrewDataSource } from './sources/sandshrew-ds'

const ERROR_METHOD_NOT_AVAILABLE = 'Method not available on any data source'

export class DataSourceManager {
  private static instance: DataSourceManager
  private dataSources: Map<string, DataSource> = new Map()
  private network: string
  private constructor(config?: Config) {
    const network = config?.network || BaseNetwork.MAINNET
    this.network = network
    this.dataSources.set(
      'mempool',
      new MempoolSpaceDataSource(
        config?.dataSources?.mempool?.url || getMempoolSpaceUrl(network),
        network
      )
    )

    this.dataSources.set(
      'sandshrew',
      new SandshrewDataSource(
        config?.dataSources?.sandshrew?.url || SANDSHREW_URL,
        config?.dataSources?.sandshrew?.apiKey || SANDSHREW_LASEREYES_KEY,
        network
      )
    )

    this.dataSources.set(
      'maestro',
      new MaestroDataSource(
        config?.dataSources?.maestro?.apiKey || MAESTRO_API_KEY_MAINNET,
        network,
        config?.dataSources?.maestro?.testnetApiKey || MAESTRO_API_KEY_TESTNET4
      )
    )
  }

  public static init(config?: Config) {
    if (!DataSourceManager.instance) {
      DataSourceManager.instance = new DataSourceManager(config)
    }
  }

  public static getInstance(): DataSourceManager {
    if (!DataSourceManager.instance) {
      throw new Error('DataSourceManager has not been initialized')
    }

    return DataSourceManager.instance
  }

  public updateNetwork(newNetwork: string) {
    this.network = newNetwork
    for (const ds of this.dataSources.values()) {
      ds.setNetwork?.(newNetwork)
    }
  }

  public registerDataSource(source: string, dataSource: DataSource) {
    this.dataSources.set(source, dataSource)
    this.dataSources.get(source)?.setNetwork?.(this.network)
  }

  public getSource(source: string): DataSource | undefined {
    return this.dataSources.get(source)
  }

  public async getAlkanesByAddress(
    address: string,
    protocolTag: string
  ): Promise<AlkanesOutpoint[]> {
    const dataSource = this.findAvailableSource('getAlkanesByAddress')
    if (!dataSource || !dataSource.getAlkanesByAddress) {
      throw new Error(ERROR_METHOD_NOT_AVAILABLE)
    }
    return await dataSource.getAlkanesByAddress(address, protocolTag)
  }

  public async getAddressBtcBalance(address: string): Promise<string> {
    const dataSource = this.findAvailableSource('getAddressBtcBalance')
    if (!dataSource || !dataSource.getAddressBtcBalance) {
      throw new Error(ERROR_METHOD_NOT_AVAILABLE)
    }

    return await dataSource.getAddressBtcBalance(address)
  }

  public async getAddressBrc20Balances(address: string): Promise<unknown> {
    const dataSource = this.findAvailableSource('getAddressBrc20Balances')
    if (!dataSource || !dataSource.getAddressBrc20Balances) {
      throw new Error(ERROR_METHOD_NOT_AVAILABLE)
    }

    const brc20Raw = await dataSource.getAddressBrc20Balances(address)
    return normalizeBrc20Balances(brc20Raw)
  }

  public async getAddressInscriptions(
    address: string,
    offset?: number,
    limit?: number
  ): Promise<Inscription[]> {
    const dataSource = this.findAvailableSource('getAddressInscriptions')
    if (!dataSource || !dataSource.getAddressInscriptions) {
      throw new Error(ERROR_METHOD_NOT_AVAILABLE)
    }
    if (!dataSource.getInscriptionInfo) {
      throw new Error(ERROR_METHOD_NOT_AVAILABLE)
    }

    const network = BaseNetwork.MAINNET

    const inscriptionsResult = await dataSource.getAddressInscriptions(
      address,
      offset,
      limit
    )
    const sourceName = dataSource.getName()

    if (sourceName === MAESTRO && inscriptionsResult.data) {
      const inscriptionsWithDetails = await Promise.all(
        inscriptionsResult.data.map(
          async (inscription: MaestroAddressInscription) => {
            try {
              if (!dataSource.getInscriptionInfo) {
                throw new Error(ERROR_METHOD_NOT_AVAILABLE)
              }
              const detailedInscription = await dataSource.getInscriptionInfo(
                inscription.inscription_id
              )
              return {
                ...inscription,
                ...detailedInscription.data,
              }
            } catch (error) {
              console.error(
                `Failed to fetch details for inscription ${inscription.inscription_id}:`,
                error
              )
              return inscription
            }
          }
        )
      )

      return inscriptionsWithDetails.map((insc) =>
        normalizeInscription(insc, sourceName, network)
      )
    }
    if (inscriptionsResult.inscriptions) {
      return inscriptionsResult.inscriptions.map((insc: unknown) =>
        normalizeInscription(insc, sourceName, network)
      )
    }
    if (Array.isArray(inscriptionsResult)) {
      return inscriptionsResult.map((insc: unknown) =>
        normalizeInscription(insc, sourceName, network)
      )
    }

    console.warn(
      'Unable to normalize inscriptions from data source',
      sourceName
    )
    return []
  }

  public async getInscriptionInfo(inscriptionId: string): Promise<unknown> {
    const dataSource = this.findAvailableSource('getInscriptionInfo')
    if (!dataSource || !dataSource.getInscriptionInfo) {
      throw new Error(ERROR_METHOD_NOT_AVAILABLE)
    }
    return await dataSource.getInscriptionInfo(inscriptionId)
  }

  public async getRecommendedFees(): Promise<{
    fastFee: number
    minFee: number
  }> {
    const dataSource = this.findAvailableSource('getRecommendedFees')
    if (!dataSource || !dataSource.getRecommendedFees) {
      throw new Error(ERROR_METHOD_NOT_AVAILABLE)
    }

    console.log('getting recommended fees')
    const fees = await dataSource.getRecommendedFees()
    return {
      fastFee: fees.fastFee,
      minFee: fees.minFee,
    }
  }

  public async getAddressUtxos(address: string): Promise<MempoolUtxo[]> {
    const dataSource = this.findAvailableSource('getAddressUtxos')
    if (!dataSource || !dataSource.getAddressUtxos) {
      throw new Error(ERROR_METHOD_NOT_AVAILABLE)
    }
    return await dataSource.getAddressUtxos(address)
  }

  public async getOutputValueByVOutIndex(
    txId: string,
    vOut: number
  ): Promise<number | null> {
    const dataSource = this.findAvailableSource('getOutputValueByVOutIndex')
    if (!dataSource || !dataSource.getOutputValueByVOutIndex) {
      throw new Error(ERROR_METHOD_NOT_AVAILABLE)
    }
    return await dataSource.getOutputValueByVOutIndex(txId, vOut)
  }

  public async waitForTransaction(txId: string): Promise<boolean> {
    const dataSource = this.findAvailableSource('waitForTransaction')
    if (!dataSource || !dataSource.waitForTransaction) {
      throw new Error(ERROR_METHOD_NOT_AVAILABLE)
    }

    return !!(await dataSource.waitForTransaction(txId))
  }

  public async getAddressRunesBalances(
    address: string
  ): Promise<OrdRuneBalance[]> {
    const dataSource = this.findAvailableSource('getAddressRunesBalances')
    if (!dataSource || !dataSource.getAddressRunesBalances) {
      throw new Error(ERROR_METHOD_NOT_AVAILABLE)
    }

    return await dataSource.getAddressRunesBalances(address)
  }

  public async broadcastTransaction(rawTx: string): Promise<string> {
    const dataSource = this.findAvailableSource('broadcastTransaction')
    if (!dataSource || !dataSource.broadcastTransaction) {
      throw new Error(ERROR_METHOD_NOT_AVAILABLE)
    }
    return await dataSource.broadcastTransaction(rawTx)
  }

  public async withFallback<T>(
    primarySource: string,
    method: (ds: DataSource) => Promise<T>
  ): Promise<T> {
    const sources = [
      primarySource,
      ...Array.from(this.dataSources.keys()).filter((s) => s !== primarySource),
    ]
    for (const source of sources) {
      try {
        const ds = this.getSource(source)
        if (!ds) continue
        return await method(ds)
      } catch (error) {
        console.warn(`Fallback: ${source} failed`, error)
      }
    }
    throw new Error('All data sources failed')
  }

  private findAvailableSource(
    method: keyof DataSource
  ): DataSource | undefined {
    for (const source of this.dataSources.values()) {
      if (typeof source[method] === 'function') {
        return source
      }
    }
    return undefined
  }
}

export { MaestroDataSource } from './sources/maestro-ds'
export { MempoolSpaceDataSource } from './sources/mempool-space-ds'
export { SandshrewDataSource } from './sources/sandshrew-ds'
