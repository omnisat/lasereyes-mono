import axios from 'axios'
import type { DataSource } from '../../../types/data-source'
import { MAINNET } from '../../../constants'
import type { OrdOutputs, OrdRuneBalance } from '../../../types/ord'
import type { AddressInfo, InscriptionInfo } from 'ordapi'
import type {
  SandshrewGetRuneByIdOrNameResponse,
  SingleRuneOutpoint,
  SandshrewBalancesResult,
} from '../../../types/sandshrew'
import type { EsploraTx } from '../../../types/esplora'
import { getPublicKeyHash } from '../../btc'
import { SANDSHREW_LASEREYES_KEY, getSandshrewUrl } from '../../urls'
import type { RpcResponse } from '../../../types/rpc'
import { SANDSHREW } from '../../../constants/data-sources'
import {
  type AlkanesOutpoint,
  BaseNetwork,
  type NetworkType,
} from '../../../types'
import type { AlkaneBalance } from '../../../types/alkane'
import { AlkanesRpc } from '../../../client/modules/alkanes/rpc'
import { LasereyesUTXO } from '../../../types/utxo'
import { getBitcoinNetwork } from '../../helpers'
import * as bitcoin from 'bitcoinjs-lib'

export function runeIdToString({ block, tx }: { block: string; tx: string }) {
  return `${block}:${tx}`
}

export type SandshrewConfig = {
  apiKey?: string
  networks?: {
    mainnet: {
      apiUrl: string
      apiKey: string
    }
    [key: string]: {
      apiUrl: string
      apiKey: string
    }
  }
}

export class SandshrewDataSource implements DataSource {
  private apiUrl = ''
  private apiKey = ''
  private networks: NonNullable<SandshrewConfig['networks']>
  alkanesRpc: AlkanesRpc
  network: NetworkType

  constructor(network: NetworkType, config?: SandshrewConfig) {
    this.networks = {
      mainnet: {
        apiUrl: getSandshrewUrl('mainnet'),
        apiKey: config?.apiKey || SANDSHREW_LASEREYES_KEY,
      },
      signet: {
        apiUrl: getSandshrewUrl('signet'),
        apiKey: config?.apiKey || SANDSHREW_LASEREYES_KEY,
      },
      oylnet: {
        apiUrl: getSandshrewUrl('oylnet'),
        apiKey: config?.apiKey || 'regtest',
      },
      ...config?.networks,
    }
    this.setNetwork(network)
    this.alkanesRpc = new AlkanesRpc(`${this.apiUrl}/${this.apiKey}`)
    this.network = network
  }

  public getName() {
    return SANDSHREW
  }

  public setNetwork(network: NetworkType) {
    if (this.networks[network]) {
      this.apiUrl = this.networks[network].apiUrl
      this.apiKey = this.networks[network].apiKey
    } else {
      // Default to mainnet if network not found in config
      const isTestnet =
        network === BaseNetwork.TESTNET ||
        network === BaseNetwork.TESTNET4 ||
        network === BaseNetwork.SIGNET ||
        network === BaseNetwork.FRACTAL_TESTNET
      const networkKey = isTestnet ? BaseNetwork.SIGNET : BaseNetwork.MAINNET

      if (this.networks[networkKey]) {
        this.apiUrl = this.networks[networkKey].apiUrl
        this.apiKey = this.networks[networkKey].apiKey
      } else {
        // Fallback to default URLs
        this.apiUrl = getSandshrewUrl(network)
        this.apiKey = SANDSHREW_LASEREYES_KEY
      }
    }
    this.alkanesRpc = new AlkanesRpc(`${this.apiUrl}/${this.apiKey}`)
    this.network = network
  }

  private async call(method: string, params: unknown) {
    console.log('SandshrewDataSource.call', method, params)
    console.log('SandshrewDataSource.apiUrl', this.apiUrl)
    console.log('SandshrewDataSource.apiKey', this.apiKey)
    try {
      const url = `${this.apiUrl}/${this.apiKey}`
      const response = await axios.post(
        url,
        {
          jsonrpc: '2.0',
          id: method,
          method,
          params,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      return response.data
    } catch (error) {
      console.error('SandshrewDataSource.callRPC error:', error)
      throw error
    }
  }

  async multicall(multiCall: any[]): Promise<RpcResponse[]> {
    const response = await this.call('sandshrew_multicall', multiCall)
    return response.result
  }

  async getAlkanesByAddress(address: string): Promise<AlkanesOutpoint[]> {
    const response = await this.alkanesRpc.getAlkanesByAddress({
      address,
    })
    return response
  }

  async getAddressBtcBalance(address: string): Promise<string> {
    const response = await this.call('esplora_address', [address])

    const result = response.result as {
      address: string
      chain_stats: {
        funded_txo_sum: string
        spent_txo_sum: string
      }
    }
    return (
      BigInt(result.chain_stats.funded_txo_sum) -
      BigInt(result.chain_stats.spent_txo_sum)
    ).toString()
  }

  async getAddressUtxos(address: string): Promise<Array<LasereyesUTXO>> {
    const response = await this.call('esplora_address::utxo', [address])
    const scriptPk = bitcoin.address.toOutputScript(
      address,
      getBitcoinNetwork(this.network)
    )
    const result = response.result as Array<LasereyesUTXO>
    return result.map((utxo) => ({
      ...utxo,
      scriptPk: Buffer.from(scriptPk).toString('hex'),
    }))
  }

  async getOutputValueByVOutIndex(
    txId: string,
    vOut: number
  ): Promise<number | null> {
    const response = await this.call('esplora_tx', [txId])
    const result = response.result as {
      vout: {
        value: number
      }[]
    }
    return result.vout[vOut]?.value ?? null
  }

  async getAddressAlkanesBalances(address: string): Promise<AlkaneBalance[]> {
    const response = await this.getAlkanesByAddress(address)
    const alkanesBalances: Record<string, AlkaneBalance> = {}
    for (const outpoint of response) {
      for (const rune of outpoint.runes) {
        const runeId = runeIdToString(rune.rune.id)
        if (!alkanesBalances[runeId]) {
          alkanesBalances[runeId] = {
            id: runeId,
            balance: BigInt(rune.balance),
            name: rune.rune.name,
            symbol: rune.rune.symbol,
          }
        } else {
          alkanesBalances[runeId].balance += BigInt(rune.balance)
        }
      }
    }
    return Object.values(alkanesBalances)
  }

  async getTransaction(txId: string) {
    const response = (await this.call('esplora_tx', [txId])) as RpcResponse
    return response.result as EsploraTx
  }

  async getRuneById(
    runeId: string
  ): Promise<SandshrewGetRuneByIdOrNameResponse> {
    const response = (await this.call('ord_rune', [runeId])) as RpcResponse
    return response.result as SandshrewGetRuneByIdOrNameResponse
  }

  async getRuneByName(
    runeName: string
  ): Promise<SandshrewGetRuneByIdOrNameResponse> {
    const response = (await this.call('ord_rune', [runeName])) as RpcResponse
    return response.result as SandshrewGetRuneByIdOrNameResponse
  }

  async broadcastTransaction(rawTx: string): Promise<string> {
    return (await this.call('broadcast_tx', [rawTx])) as string
  }

  async getOrdAddress(address: string): Promise<AddressInfo> {
    const response = (await this.call('ord_address', [address])) as RpcResponse
    return response.result as AddressInfo
  }

  async getTxInfo(txId: string): Promise<EsploraTx> {
    const response = (await this.call('esplora_tx', [txId])) as RpcResponse
    return response.result as EsploraTx
  }

  async batchOrdOutput({
    outpoints,
    rune_name,
  }: {
    outpoints: string[]
    rune_name: string
  }): Promise<OrdOutputs[]> {
    const MAX_OUTPOINTS_PER_CALL = 1000
    const ordOutputs: OrdOutputs[] = []
    for (let i = 0; i < outpoints.length; i += MAX_OUTPOINTS_PER_CALL) {
      const batch = outpoints.slice(i, i + MAX_OUTPOINTS_PER_CALL)
      const multiCall = batch.map((outpoint) => {
        return ['ord_output', [outpoint]]
      })

      const { result } = (await this.call(
        'sandshrew_multicall',
        multiCall
      )) as RpcResponse

      for (let i = 0; i < result.length; i++) {
        result[i].result.output = batch[i]
      }

      const filteredResult = result.filter((output: OrdOutputs) =>
        Object.keys(output.result.runes).includes(rune_name)
      )
      ordOutputs.push(...filteredResult)
    }
    return ordOutputs
  }

  async batchOrdInscriptionInfo(
    inscriptionIds: string[]
  ): Promise<InscriptionInfo[]> {
    const MAX_INSCRIPTIONS_PER_CALL = 1000
    const inscriptionInfos: InscriptionInfo[] = []
    for (let i = 0; i < inscriptionIds.length; i += MAX_INSCRIPTIONS_PER_CALL) {
      const batch = inscriptionIds.slice(i, i + MAX_INSCRIPTIONS_PER_CALL)
      const multiCall = batch.map((inscriptionId) => {
        return ['ord_inscription', [inscriptionId]]
      })
      const { result } = (await this.call(
        'sandshrew_multicall',
        multiCall
      )) as RpcResponse
      for (let i = 0; i < result.length; i++) {
        inscriptionInfos.push(result[i].result as InscriptionInfo)
      }
    }
    return inscriptionInfos
  }

  async getAddressRunesBalances(address: string): Promise<OrdRuneBalance[]> {
    try {
      const response = await this.getOrdAddress(address)
      const runesData = response.runes_balances
      if (!runesData) {
        throw new Error('No runes data found')
      }

      return runesData.map((rune: string[]) => ({
        name: rune[0],
        balance: rune[1],
        symbol: rune[2],
      })) as OrdRuneBalance[]
    } catch (error) {
      console.error('Error fetching ord address:', error)
      throw error
    }
  }

  async getInscriptionInfo(inscriptionId: string) {
    const response = (await this.call('ord_inscription', [
      inscriptionId,
    ])) as RpcResponse
    const inscriptionInfo = response.result as InscriptionInfo

    return {
      data: {
        inscription_id: inscriptionInfo.id || inscriptionId,
        inscription_number: inscriptionInfo.number || 0,
        created_at: inscriptionInfo.timestamp || 0,
        content_type: inscriptionInfo.effective_content_type || '',
        content_body_preview: '',
        content_length: inscriptionInfo.content_length || 0,
        collection_symbol: null,
      },
      last_updated: {
        block_hash: '',
        block_height: inscriptionInfo.height || 0,
      },
    }
  }

  async getRecommendedFees(): Promise<{ fastFee: number; minFee: number }> {
    const response = (await this.call(
      'esplora_fee-estimates',
      []
    )) as RpcResponse
    const feeEstimates = response.result as Record<string, number>

    // Get the fee for 1 block confirmation (fastest)
    const fastFee = feeEstimates['1'] || 0

    // Get the minimum fee (lowest value in the estimates)
    const minFee = Math.min(...Object.values(feeEstimates))

    return { fastFee: Math.round(fastFee), minFee: Math.round(minFee) }
  }

  async getBalances(
    address: string | string[]
  ): Promise<SandshrewBalancesResult[]> {
    if (Array.isArray(address)) {
      const multiCall = address.map((addr) => [
        'sandshrew_balances',
        [{ address: addr }],
      ])
      const result = await this.multicall(multiCall)
      return result.map((e) => e.result) as SandshrewBalancesResult[]
    }

    const response = (await this.call('sandshrew_balances', [
      { address },
    ])) as RpcResponse

    return [response.result as SandshrewBalancesResult]
  }

  async getRuneOutpoints({
    address,
    runeId,
  }: {
    address: string
    runeId: string
  }): Promise<SingleRuneOutpoint[]> {
    const addressOutpoints = await this.getOrdAddress(address)
    const { entry } = await this.getRuneById(runeId)
    const runeName = entry.spaced_rune

    const ordOutputs = await this.batchOrdOutput({
      outpoints: addressOutpoints.outputs,
      rune_name: runeName,
    })

    const runeUtxosOutpoints = await this.mapRuneBalances({
      ordOutputs: ordOutputs,
    })

    return runeUtxosOutpoints
  }

  private async mapRuneBalances({
    ordOutputs,
  }: {
    ordOutputs: OrdOutputs[]
  }): Promise<SingleRuneOutpoint[]> {
    const runeOutpoints: SingleRuneOutpoint[] = []
    for (let i = 0; i < ordOutputs.length; i++) {
      const ordOutput = ordOutputs[i]
      const { result } = ordOutput
      if (!result.output?.split(':')) {
        throw new Error('No output found')
      }

      const { output, address, runes } = result
      const singleRuneOutpoint: SingleRuneOutpoint = {
        output,
        wallet_addr: address,
        script: '',
        balances: [],
        decimals: [],
        rune_ids: [],
        value: result.value,
      }

      singleRuneOutpoint.script = Buffer.from(
        getPublicKeyHash(address, MAINNET)
      ).toString('hex')

      if (typeof runes === 'object' && !Array.isArray(runes)) {
        for (const rune in runes) {
          singleRuneOutpoint.balances.push(runes[rune].amount)
          singleRuneOutpoint.decimals.push(runes[rune].divisibility)
          singleRuneOutpoint.rune_ids.push((await this.getRuneByName(rune)).id)
        }
      }

      runeOutpoints.push(singleRuneOutpoint)
    }
    return runeOutpoints
  }
}
