import axios from 'axios'
import type { DataSource } from '../../../types/data-source'
import { getMempoolSpaceUrl } from '../../urls'
import type { MempoolUtxo, NetworkType } from '../../../types'
import type { MempoolSpaceGetTransactionResponse } from '../../../types/mempool-space'
import { MEMPOOL_SPACE } from '../../../constants/data-sources'

export class MempoolSpaceDataSource implements DataSource {
  private apiUrl = ''

  constructor(baseUrl: string, network: NetworkType) {
    this.setNetwork(network, baseUrl)
    console.log(this.apiUrl)
  }

  public getName() {
    return MEMPOOL_SPACE
  }

  public setNetwork(network: NetworkType, baseUrl?: string) {
    this.apiUrl = baseUrl
      ? `${baseUrl}${network === 'mainnet' ? '' : `/${network}`}`
      : getMempoolSpaceUrl(network)
  }

  private async call(method: 'get' | 'post', endpoint: string, body?: unknown) {
    try {
      const url = `${this.apiUrl}${endpoint}`
      const options = {
        headers: {
          'Content-Type': method === 'post' ? 'text/plain' : 'application/json',
        },
      }

      const response =
        method === 'get'
          ? await axios.get(url, options)
          : await axios.post(url, body, options)

      return response.data
    } catch (error) {
      console.error('MempoolSpaceDataSource.call error:', error)
      throw error
    }
  }

  async getOutputValueByVOutIndex(
    commitTxId: string,
    vOut: number
  ): Promise<number | null> {
    const timeout: number = 60000
    const startTime: number = Date.now()

    while (true) {
      try {
        const rawTx = await this.getTransaction(commitTxId)

        if (rawTx?.vout && rawTx.vout.length > 0) {
          return Math.floor(rawTx.vout[vOut].value)
        }

        if (Date.now() - startTime > timeout) {
          return null
        }

        await new Promise((resolve) => setTimeout(resolve, 5000))
      } catch (error) {
        console.error('Error fetching transaction output value:', error)
        if (Date.now() - startTime > timeout) {
          return null
        }

        await new Promise((resolve) => setTimeout(resolve, 5000))
      }
    }
  }

  async waitForTransaction(txId: string): Promise<boolean> {
    const timeout: number = 60000
    const startTime: number = Date.now()
    while (true) {
      try {
        const tx = await this.getTransaction(txId)
        if (tx) {
          console.log('Transaction found in mempool:', txId)
          return true
        }

        if (Date.now() - startTime > timeout) {
          return false
        }

        await new Promise((resolve) => setTimeout(resolve, 5000))
      } catch (error) {
        if (Date.now() - startTime > timeout) {
          return false
        }

        await new Promise((resolve) => setTimeout(resolve, 5000))
      }
    }
  }

  async getAddressUtxos(address: string): Promise<Array<MempoolUtxo>> {
    return this.call('get', `/api/address/${address}/utxo`)
  }

  async getTransaction(
    txId: string
  ): Promise<MempoolSpaceGetTransactionResponse> {
    return await this.call('get', `/api/tx/${txId}`)
  }

  async getRecommendedFees(): Promise<{ fastFee: number; minFee: number }> {
    const response = await this.call('get', '/mempool/fee_rates')
    const fastFee = response.fastestFee
    const minFee = response.minimumFee
    return { fastFee, minFee }
  }

  async broadcastTransaction(txHex: string): Promise<string> {
    return await this.call('post', '/api/tx', txHex)
  }
}
