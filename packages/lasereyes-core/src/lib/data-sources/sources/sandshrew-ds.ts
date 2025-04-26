import axios from 'axios'
import type { DataSource } from '../../../types/data-source'
import { MAINNET } from '../../../constants'
import type { OrdOutputs, OrdRuneBalance } from '../../../types/ord'
import type { AddressInfo, InscriptionInfo } from 'ordapi'
import type {
  SandshrewGetRuneByIdOrNameResponse,
  SingleRuneOutpoint,
} from '../../../types/sandshrew'
import type { EsploraTx } from '../../../types/esplora'
import { getPublicKeyHash } from '../../btc'
import { SANDSHREW_LASEREYES_KEY, getSandshrewUrl } from '../../urls'
import type { RpcResponse } from '../../../types/rpc'
import { SANDSHREW } from '../../../constants/data-sources'
import { BaseNetwork, type AlkanesOutpoint, type NetworkType } from '../../../types'
import { AlkanesRpc } from '@oyl/sdk/lib/rpclient/alkanes'

export type SandshrewConfig = {
  networks: {
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
  private networks: SandshrewConfig['networks']
  private alkanes: AlkanesRpc
  

  constructor(network: NetworkType, config?: SandshrewConfig) {
    this.networks = {
      mainnet: {
        apiUrl: getSandshrewUrl('mainnet'),
        apiKey: SANDSHREW_LASEREYES_KEY,
      },
      signet: {
        apiUrl: getSandshrewUrl('signet'),
        apiKey: SANDSHREW_LASEREYES_KEY,
      },
      ...config?.networks,
    }
    this.setNetwork(network)
    this.alkanes = new AlkanesRpc(`${this.apiUrl}/${this.apiKey}`)
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
    this.alkanes = new AlkanesRpc(`${this.apiUrl}/${this.apiKey}`)
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

  async getAlkanesByAddress(
    address: string,
    protocolTag: string
  ): Promise<AlkanesOutpoint[]> {
    const response = await this.alkanes.getAlkanesByAddress({
      address,
      protocolTag,
    })
    return response as AlkanesOutpoint[]
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

      return runesData.map((rune) => ({
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

    // Convert to MaestroGetInscriptionInfoResponse format
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
