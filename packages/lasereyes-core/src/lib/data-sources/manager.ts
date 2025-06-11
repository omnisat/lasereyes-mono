import asyncPool from 'tiny-async-pool'
import { MAESTRO } from '../../constants/data-sources'
import type { AlkanesOutpoint, Config, MempoolUtxo } from '../../types'
import type { AlkaneBalance } from '../../types/alkane'
import type { DataSource } from '../../types/data-source'
import type { Inscription } from '../../types/lasereyes'
import type { MaestroAddressInscription } from '../../types/maestro'
import { BaseNetwork } from '../../types/network'
import type { OrdOutput, OrdRuneBalance } from '../../types/ord'
import {
  FormattedAlkane,
  FormattedInscription,
  FormattedRune,
  FormattedUTXO,
} from '../../types/utxo'
import {
  getMaestroUrl,
  getMempoolSpaceUrl,
  MAESTRO_API_KEY_MAINNET,
  MAESTRO_API_KEY_TESTNET4,
  SANDSHREW_LASEREYES_KEY,
  getSandshrewUrl,
} from '../urls'
import { toBigEndian } from '../utils'
import { normalizeBrc20Balances, normalizeInscription } from './normalizations'
import { MaestroDataSource } from './sources/maestro-ds'
import { MempoolSpaceDataSource } from './sources/mempool-space-ds'
import { SandshrewDataSource } from './sources/sandshrew-ds'

const ERROR_METHOD_NOT_AVAILABLE = 'Method not available on any data source'

type LasereyesUTXO = MempoolUtxo & {
  scriptPk: string
}

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

  public async getAddressUtxos(address: string): Promise<Array<LasereyesUTXO>> {
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

  async getFormattedUTXOs(address: string): Promise<FormattedUTXO[]> {
    const alkanes = await this.getAlkanesByAddress(address)
    const utxos = await this.getAddressUtxos(address)
    if (utxos.length === 0) {
      return []
    }

    alkanes.forEach((alkane) => {
      alkane.outpoint.txid = toBigEndian(alkane.outpoint.txid)
    })

    const concurrencyLimit = 10
    const processedUtxos: {
      utxo: LasereyesUTXO
      txOutput: OrdOutput
      scriptPk: string
      alkanesOutpoints: AlkanesOutpoint[]
    }[] = []

    const processUtxo = async (utxo: LasereyesUTXO) => {
      try {
        const txIdVout = `${utxo.txid}:${utxo.vout}`

        const multiCall = await (
          this.getSource('sandshrew') as SandshrewDataSource
        ).multicall([
          ['ord_output', [txIdVout]],
          ['esplora_tx', [utxo.txid]],
        ])

        const txOutput = multiCall[0].result as OrdOutput
        const txDetails = multiCall[1].result

        const alkanesOutpoints = alkanes.filter(
          (alkane) =>
            alkane.outpoint.txid === utxo.txid &&
            alkane.outpoint.vout === utxo.vout
        )

        return {
          utxo,
          txOutput,
          scriptPk: txDetails.vout[utxo.vout].scriptpubkey,
          alkanesOutpoints,
        }
      } catch (error) {
        console.error(`Error processing UTXO ${utxo.txid}:${utxo.vout}`, error)
        throw error
      }
    }

    for await (const result of asyncPool(
      concurrencyLimit,
      utxos,
      processUtxo
    )) {
      if (result !== null) {
        processedUtxos.push(result)
      }
    }

    processedUtxos.sort((a, b) => a.utxo.value - b.utxo.value)

    return processedUtxos.map(({ utxo, txOutput, alkanesOutpoints }) => {
      const hasInscriptions = txOutput.inscriptions.length > 0
      const hasRunes = Object.keys(txOutput.runes).length > 0
      const hasAlkanes = alkanesOutpoints.length > 0
      // const confirmations = blockCount - utxo.status.block_height
      const inscriptions: FormattedInscription[] = txOutput.inscriptions.map(
        (inscriptionId) => ({
          inscriptionId,
        })
      )
      const runes: FormattedRune[] = Object.entries(txOutput.runes).map(
        ([runeId, rune]) => ({
          runeId,
          amount: rune.amount,
          name: rune.name,
          symbol: rune.symbol,
        })
      )
      const alkanes: FormattedAlkane[] = alkanesOutpoints.map((alkane) => ({
        id: alkane.outpoint.txid,
        amount: alkane.outpoint.vout,
        name: alkane.outpoint.txid,
        symbol: alkane.outpoint.txid,
      }))

      return {
        alkanes,
        runes,
        inscriptions,
        hasInscriptions,
        hasRunes,
        hasAlkanes,
        txHash: utxo.txid,
        txOutputIndex: utxo.vout,
        btcValue: utxo.value,
        scriptPubKey: txOutput.script_pubkey,
      } as FormattedUTXO
    })
  }
}

export { MaestroDataSource } from './sources/maestro-ds'
export { MempoolSpaceDataSource } from './sources/mempool-space-ds'
export { SandshrewDataSource } from './sources/sandshrew-ds'
