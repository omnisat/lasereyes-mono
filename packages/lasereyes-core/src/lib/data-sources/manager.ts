import { MAESTRO } from '../../constants/data-sources'
import type { AlkanesOutpoint, Config } from '../../types'
import type { AlkaneBalance } from '../../types/alkane'
import type { DataSource } from '../../types/data-source'
import type { Inscription } from '../../types/lasereyes'
import type { MaestroAddressInscription } from '../../types/maestro'
import { BaseNetwork } from '../../types/network'
import type { OrdRuneBalance } from '../../types/ord'
import {
  FormattedAlkane,
  FormattedInscription,
  FormattedRune,
  FormattedUTXO,
  LasereyesUTXO,
} from '../../types/utxo'
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
import { getAddressScriptPubKey } from '../btc'

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
      new MempoolSpaceDataSource(network, {
        networks: {
          mainnet: {
            apiUrl:
              config?.dataSources?.mempool?.url ||
              getMempoolSpaceUrl(BaseNetwork.MAINNET),
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
          'fractal-mainnet': {
            apiUrl: getMempoolSpaceUrl(BaseNetwork.FRACTAL_MAINNET),
          },
          'fractal-testnet': {
            apiUrl: getMempoolSpaceUrl(BaseNetwork.FRACTAL_TESTNET),
          },
          ...config?.dataSources?.mempool?.networks,
        },
      })
    )

    this.dataSources.set(
      'sandshrew',
      new SandshrewDataSource(network, {
        apiKey: config?.dataSources?.sandshrew?.apiKey,
        networks: {
          mainnet: {
            apiKey:
              config?.dataSources?.sandshrew?.apiKey || SANDSHREW_LASEREYES_KEY,
            apiUrl: getSandshrewUrl(BaseNetwork.MAINNET),
          },
          testnet: {
            apiKey:
              config?.dataSources?.sandshrew?.apiKey || SANDSHREW_LASEREYES_KEY,
            apiUrl: getSandshrewUrl(BaseNetwork.TESTNET),
          },
          ...config?.dataSources?.sandshrew?.networks,
        },
      })
    )

    this.dataSources.set(
      'maestro',
      new MaestroDataSource(network, {
        networks: {
          mainnet: {
            apiKey:
              config?.dataSources?.maestro?.apiKey || MAESTRO_API_KEY_MAINNET,
            apiUrl: getMaestroUrl(BaseNetwork.MAINNET),
          },
          testnet4: {
            apiKey:
              config?.dataSources?.maestro?.testnetApiKey ||
              MAESTRO_API_KEY_TESTNET4,
            apiUrl: getMaestroUrl(BaseNetwork.TESTNET4),
          },
          ...config?.dataSources?.maestro?.networks,
        },
      })
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
    this.dataSources
      .get(source)
      ?.setNetwork?.(
        this.network,
        this.customNetworks.get(this.network)?.baseNetwork
      )
  }

  public getSource(source: string): DataSource | undefined {
    return this.dataSources.get(source)
  }

  public async getAddressAlkanesBalances(
    address: string
  ): Promise<AlkaneBalance[]> {
    const dataSource = this.findAvailableSource('getAddressAlkanesBalances')
    if (!dataSource || !dataSource.getAddressAlkanesBalances) {
      throw new Error(ERROR_METHOD_NOT_AVAILABLE)
    }
    return await dataSource.getAddressAlkanesBalances(address)
  }

  public async getAlkanesByAddress(
    address: string
  ): Promise<AlkanesOutpoint[]> {
    const dataSource = this.findAvailableSource('getAlkanesByAddress')
    if (!dataSource || !dataSource.getAlkanesByAddress) {
      throw new Error(ERROR_METHOD_NOT_AVAILABLE)
    }
    return await dataSource.getAlkanesByAddress(address)
  }

  public async getAddressBtcBalance(address: string): Promise<string> {
    const dataSource = this.findAvailableSource('getAddressBtcBalance')
    if (!dataSource || !dataSource.getAddressBtcBalance) {
      throw new Error(ERROR_METHOD_NOT_AVAILABLE)
    }

    const balance = await this.withFallback('sandshrew', async (ds) => {
      return await ds.getAddressBtcBalance?.(address)
    })
    if (balance === undefined) {
      throw new Error('Unable to get balance from any data source')
    }
    return balance
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
    const fees = await this.withFallback('sandshrew', async (ds) => {
      return await ds.getRecommendedFees?.()
    })
    if (fees === undefined) {
      throw new Error('Unable to get recommended fees from any data source')
    }
    return {
      fastFee: fees.fastFee,
      minFee: fees.minFee,
    }
  }

  public async getAddressUtxos(address: string): Promise<Array<LasereyesUTXO>> {
    const dataSource = this.findAvailableSource('getAddressUtxos')
    if (!dataSource || !dataSource.getAddressUtxos) {
      throw new Error(ERROR_METHOD_NOT_AVAILABLE)
    }
    const utxos = await this.withFallback('sandshrew', async (ds) => {
      return await ds.getAddressUtxos?.(address)
    })
    if (utxos === undefined) {
      throw new Error('Unable to get utxos from any data source')
    }
    return utxos
  }

  public async getOutputValueByVOutIndex(
    txId: string,
    vOut: number
  ): Promise<number | null> {
    const dataSource = this.findAvailableSource('getOutputValueByVOutIndex')
    if (!dataSource || !dataSource.getOutputValueByVOutIndex) {
      throw new Error(ERROR_METHOD_NOT_AVAILABLE)
    }
    const value = await this.withFallback('sandshrew', async (ds) => {
      return await ds.getOutputValueByVOutIndex?.(txId, vOut)
    })
    if (value === undefined) {
      throw new Error('Unable to get output value from any data source')
    }
    return value
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

  async getFormattedUTXOs(
    address: string | string[]
  ): Promise<FormattedUTXO[]> {
    const sandshrewDS = this.getSource('sandshrew') as SandshrewDataSource
    if (!sandshrewDS || !sandshrewDS.getBalances) {
      throw new Error(
        'Sandshrew data source with getBalances method is required'
      )
    }

    console.log('getting balances', address)

    // Single fetch call to get all UTXOs and their data
    const balancesArray = await sandshrewDS.getBalances(address)

    console.log('balances', balancesArray)

    const formattedUTXOs: FormattedUTXO[] = []

    // Convert single address to array for consistent processing
    const addressArray = Array.isArray(address) ? address : [address]

    // Process each address's balances
    for (let i = 0; i < balancesArray.length; i++) {
      const balances = balancesArray[i]
      const currentAddress = addressArray[i]

      const currentHeight = balances.metashrewHeight
      const scriptPubKey = Buffer.from(
        getAddressScriptPubKey(currentAddress, this.network)
      ).toString('hex')

      // Process spendable UTXOs (regular bitcoin UTXOs)
      for (const spendable of balances.spendable) {
        const [txHash, txOutputIndex] = spendable.outpoint.split(':')

        formattedUTXOs.push({
          txHash,
          txOutputIndex: parseInt(txOutputIndex),
          btcValue: spendable.value,
          scriptPubKey,
          address: currentAddress,
          hasRunes: false,
          runes: [],
          hasAlkanes: false, // No alkanes info in sandshrew_balances
          alkanes: [],
          hasInscriptions: false,
          inscriptions: [],
          confirmations: spendable.height
            ? currentHeight - spendable.height
            : undefined,
        })
      }

      // Process asset UTXOs (UTXOs with inscriptions and/or runes)
      for (const asset of balances.assets) {
        const [txHash, txOutputIndex] = asset.outpoint.split(':')

        // Process inscriptions
        const inscriptions: FormattedInscription[] = (
          asset.inscriptions || []
        ).map((inscriptionId: string) => ({
          inscriptionId,
        }))

        // Process runes (ord_runes is the actual runes data)
        const runes: FormattedRune[] = []
        if (asset.ord_runes) {
          for (const [runeName, runeData] of Object.entries(asset.ord_runes)) {
            runes.push({
              runeId: runeName, // Using name as ID
              amount: (runeData as any).amount,
            })
          }
        }

        // Process alkanes (runes[] array is actually alkanes data)
        const alkanes: FormattedAlkane[] = []
        if (asset.runes) {
          for (const alkaneBalance of asset.runes) {
            alkanes.push({
              id:
                parseInt(alkaneBalance.rune.id.block, 16) +
                ':' +
                parseInt(alkaneBalance.rune.id.tx, 16),
              amount: parseInt(alkaneBalance.balance, 16), // Convert hex to number
              name: alkaneBalance.rune.name,
              symbol: alkaneBalance.rune.symbol,
            })
          }
        }

        formattedUTXOs.push({
          txHash,
          txOutputIndex: parseInt(txOutputIndex),
          btcValue: asset.value,
          scriptPubKey,
          address: currentAddress,
          hasRunes: runes.length > 0,
          runes,
          hasAlkanes: alkanes.length > 0,
          alkanes,
          hasInscriptions: inscriptions.length > 0,
          inscriptions,
          confirmations: asset.height
            ? currentHeight - asset.height
            : undefined,
        })
      }
    }

    // Sort by value (smallest first)
    formattedUTXOs.sort((a, b) => a.btcValue - b.btcValue)

    return formattedUTXOs
  }
}

export { MaestroDataSource } from './sources/maestro-ds'
export { MempoolSpaceDataSource } from './sources/mempool-space-ds'
export { SandshrewDataSource } from './sources/sandshrew-ds'
