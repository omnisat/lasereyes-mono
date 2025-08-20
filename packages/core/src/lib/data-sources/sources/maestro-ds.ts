import axios from 'axios'
import { BaseNetwork, type NetworkType } from '../../../types'
import type { DataSource } from '../../../types/data-source'
import { getMaestroUrl, MAESTRO_API_KEY_TESTNET4 } from '../../urls'
import type {
  MaestroAddressInscription,
  MaestroBrc20ByAddressResponse,
  MaestroGetAddressBalanceResponse,
  MaestroGetAddressInscriptions,
  MaestroGetBrc20InfoResponse,
  MaestroGetInscriptionInfoResponse,
  MaestroGetRuneInfoResponse,
  MaestroGetTransactionInfoResponse,
} from '../../../types/maestro'
import { MAESTRO } from '../../../constants/data-sources'
import { TESTNET4 } from '../../../constants'

export type MaestroConfig = {
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

export class MaestroDataSource implements DataSource {
  private apiUrl = ''
  private apiKey = ''
  private networks: MaestroConfig['networks']

  constructor(network: NetworkType, config: MaestroConfig) {
    this.networks = {
      [TESTNET4]: {
        apiKey: MAESTRO_API_KEY_TESTNET4,
        apiUrl: getMaestroUrl(BaseNetwork.TESTNET4),
      },
      ...config?.networks,
    }
    this.setNetwork(network)
  }

  public getName() {
    return MAESTRO
  }

  public setNetwork(network: NetworkType) {
    if (this.networks[network]) {
      this.apiUrl = this.networks[network].apiUrl
      this.apiKey = this.networks[network].apiKey
    } else {
      this.apiUrl = getMaestroUrl(network)
      this.apiKey = this.networks.mainnet.apiKey
    }
  }

  private async call(method: 'get' | 'post', endpoint: string, body?: unknown) {
    const url = `${this.apiUrl}${endpoint}`
    try {
      const options = {
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey,
        },
      }

      const response =
        method === 'get'
          ? await axios.get(url, options)
          : await axios.post(url, body, options)

      if (!response || !response.data) {
        throw new Error(
          `Invalid response from Maestro API: ${JSON.stringify(response)}`
        )
      }
      return response.data
    } catch (error) {
      console.error('MaestroDataSource.call error:', error)
      throw error
    }
  }

  async getAddressBtcBalance(address: string): Promise<string> {
    const balanceResp = (await this.call(
      'get',
      `/addresses/${address}/balance`
    )) as MaestroGetAddressBalanceResponse
    return balanceResp.data
  }

  async getAddressBrc20Balances(
    address: string
  ): Promise<MaestroBrc20ByAddressResponse> {
    return (await this.call(
      'get',
      `/addresses/${address}/brc20`
    )) as MaestroBrc20ByAddressResponse
  }

  async getAddressInscriptions(
    address: string,
    offset: number = 0,
    limit: number = 10
  ): Promise<MaestroGetAddressInscriptions> {
    let cursor: string | undefined = undefined
    let toSkip = offset
    let batchSize = 100
    let lastResponse: any = null

    while (toSkip > 0) {
      const count = Math.min(batchSize, toSkip)
      const queryParams = new URLSearchParams()
      queryParams.append('count', count.toString())
      if (cursor) queryParams.append('cursor', cursor)

      const url = `/addresses/${address}/inscriptions?${queryParams.toString()}`
      lastResponse = await this.call('get', url)

      if (!lastResponse.next_cursor && toSkip > count) {
        return { ...lastResponse, data: [] }
      }

      cursor = lastResponse.next_cursor
      toSkip -= count
    }

    const queryParams = new URLSearchParams()
    queryParams.append('count', limit.toString())
    if (cursor) queryParams.append('cursor', cursor)

    const url = `/addresses/${address}/inscriptions?${queryParams.toString()}`
    const response = await this.call('get', url)

    // Add address to each inscription
    const responseWithAddress = {
      ...response,
      data: response.data.map((insc: MaestroAddressInscription) => ({
        ...insc,
        address,
      })),
    }

    return responseWithAddress
  }

  async getInscriptionInfo(
    inscriptionId: string
  ): Promise<MaestroGetInscriptionInfoResponse> {
    return await this.call('get', `/assets/inscriptions/${inscriptionId}`)
  }

  async getBrc20ByTicker(ticker: string): Promise<MaestroGetBrc20InfoResponse> {
    return this.call('get', `/assets/brc20/${ticker}`)
  }

  async getRuneById(runeId: string): Promise<MaestroGetRuneInfoResponse> {
    return this.call('get', `/assets/runes/${runeId}`)
  }

  async getRuneByName(runeName: string): Promise<MaestroGetRuneInfoResponse> {
    return this.call('get', `/assets/runes/${runeName}`)
  }

  async getTransactionInfo(
    txHash: string
  ): Promise<MaestroGetTransactionInfoResponse> {
    return this.call('get', `/rpc/transaction/${txHash}`)
  }

  async broadcastTransaction(txHex: string): Promise<string> {
    return await this.call('post', '/arpc/transaction/submit', txHex)
  }

  async getRawTransaction(txHash: string) {
    return this.call('get', `/raw-transactions/${txHash}`)
  }

  async getRecommendedFees(): Promise<{ fastFee: number; minFee: number }> {
    const response = await this.call('get', '/mempool/fee_rates')
    const fee = response.data[0].sats_per_vb
    const fastFee = fee.median
    const minFee = fee.min
    return { fastFee, minFee }
  }

  async getOrdAddress(address: string) {
    return this.call('get', `/inscriptions/${address}`)
  }
}
