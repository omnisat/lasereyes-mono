import { MAESTRO } from '../../constants/data-sources'
import { Config, MempoolUtxo } from '../../types'
import { DataSource } from '../../types/data-source'
import { Inscription } from '../../types/lasereyes'
import { MaestroAddressInscription } from '../../types/maestro'
import { BaseNetwork } from '../../types/network'
import { OrdRuneBalance } from '../../types/ord'
import {
  getMaestroUrl,
  getMempoolSpaceUrl,
  MAESTRO_API_KEY_MAINNET,
  MAESTRO_API_KEY_TESTNET4,
  SANDSHREW_LASEREYES_KEY,
  getSandshrewUrl,
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
  private customNetworks: Map<
    string,
    Exclude<Config['customNetworks'], undefined>[string]
  > = new Map()
  private constructor(config?: Config) {
    const network = config?.network || BaseNetwork.MAINNET
    this.network = network
    this.customNetworks = new Map(Object.entries(config?.customNetworks || {}))
    this.dataSources.set(
      'mempool',
      new MempoolSpaceDataSource(
        network,
        {
          networks: {
            ...config?.dataSources?.mempool?.networks,
            mainnet: {
              apiUrl: config?.dataSources?.mempool?.url || getMempoolSpaceUrl(BaseNetwork.MAINNET),
            },
            testnet: {
              apiUrl: getMempoolSpaceUrl(BaseNetwork.TESTNET),
            },
            testnet4: {
              apiUrl: getMempoolSpaceUrl(BaseNetwork.TESTNET4),
            },
            signet: {
              apiUrl: getMempoolSpaceUrl(BaseNetwork.SIGNET),
            },
            "fractal-mainnet": {
              apiUrl: getMempoolSpaceUrl(BaseNetwork.FRACTAL_MAINNET),
            },
            "fractal-testnet": {
              apiUrl: getMempoolSpaceUrl(BaseNetwork.FRACTAL_TESTNET),
            }
          }
        }
      )
    )

    this.dataSources.set(
      'sandshrew',
      new SandshrewDataSource(
        network,
        {
          networks: {
            ...config?.dataSources?.sandshrew?.networks,
            mainnet: {
              apiKey: config?.dataSources?.sandshrew?.apiKey || SANDSHREW_LASEREYES_KEY,
              apiUrl: getSandshrewUrl(BaseNetwork.MAINNET),
            },
            testnet: {
              apiKey: config?.dataSources?.sandshrew?.apiKey || SANDSHREW_LASEREYES_KEY,
              apiUrl: getSandshrewUrl(BaseNetwork.TESTNET),
            }
          }
        }
      )
    )

    this.dataSources.set(
      'maestro',
      new MaestroDataSource(
        network,
        {
          networks: {
            ...config?.dataSources?.maestro?.networks,
            mainnet: {
              apiKey: config?.dataSources?.maestro?.apiKey || MAESTRO_API_KEY_MAINNET,
              apiUrl: getMaestroUrl(BaseNetwork.MAINNET),
            },
            testnet4: {
              apiKey: config?.dataSources?.maestro?.testnetApiKey || MAESTRO_API_KEY_TESTNET4,
              apiUrl: getMaestroUrl(BaseNetwork.TESTNET4),
            }
          }
        }
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
    const baseNetwork = this.customNetworks.get(newNetwork)?.baseNetwork
    for (const ds of this.dataSources.values()) {
      ds.setNetwork?.(newNetwork, baseNetwork)
    }
  }

  public registerDataSource(source: string, dataSource: DataSource) {
    this.dataSources.set(source, dataSource)
    this.dataSources.get(source)?.setNetwork?.(this.network, this.customNetworks.get(this.network)?.baseNetwork)
  }

  public getSource(source: string): DataSource | undefined {
    return this.dataSources.get(source)
  }

  public async getAddressBtcBalance(address: string): Promise<string> {
    const dataSource = this.findAvailableSource('getAddressBtcBalance')
    if (!dataSource || !dataSource.getAddressBtcBalance) {
      throw new Error(ERROR_METHOD_NOT_AVAILABLE)
    }

    return await dataSource.getAddressBtcBalance(address)
  }

  public async getAddressBrc20Balances(address: string): Promise<any> {
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
    } else if (inscriptionsResult.inscriptions) {
      return inscriptionsResult.inscriptions.map((insc: any) =>
        normalizeInscription(insc, sourceName, network)
      )
    } else if (Array.isArray(inscriptionsResult)) {
      return inscriptionsResult.map((insc: any) =>
        normalizeInscription(insc, sourceName, network)
      )
    }

    console.warn(
      'Unable to normalize inscriptions from data source',
      sourceName
    )
    return []
  }

  public async getInscriptionInfo(inscriptionId: string): Promise<any> {
    const dataSource = this.findAvailableSource('getInscriptionInfo')
    if (!dataSource || !dataSource.getInscriptionInfo) {
      throw new Error(ERROR_METHOD_NOT_AVAILABLE)
    }
    return await dataSource.getInscriptionInfo(inscriptionId)
  }

  public async getRecommendedFees(): Promise<any> {
    const dataSource = this.findAvailableSource('getRecommendedFees')
    if (!dataSource || !dataSource.getRecommendedFees) {
      throw new Error(ERROR_METHOD_NOT_AVAILABLE)
    }

    console.log('getting recommended fees')
    return await dataSource.getRecommendedFees()
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
    const customNetwork = this.customNetworks.get(this.network)
    if (customNetwork) {
      const dataSource = this.getSource(customNetwork.preferredDataSource)
      if (dataSource && typeof dataSource[method] === 'function') {
        return dataSource
      }
    }

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
