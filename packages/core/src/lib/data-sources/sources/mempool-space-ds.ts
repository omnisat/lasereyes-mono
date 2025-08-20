import axios from "axios";
import * as bitcoin from "bitcoinjs-lib";
import type { DataSource } from "../../../types/data-source";
import { getMempoolSpaceUrl } from "../../urls";
import type { MempoolUtxo, NetworkType } from "../../../types";
import type { MempoolSpaceGetTransactionResponse } from "../../../types/mempool-space";
import { MEMPOOL_SPACE } from "../../../constants/data-sources";
import { MAINNET, SIGNET, TESTNET, TESTNET4, FRACTAL_MAINNET, FRACTAL_TESTNET } from "../../../constants";
import { getBitcoinNetwork } from "../../helpers";

export type MempoolSpaceConfig = {
  networks: {
    mainnet: {
      apiUrl: string;
    },
    [key: string]: {
      apiUrl: string;
    }
  }
}

export class MempoolSpaceDataSource implements DataSource {
  private apiUrl = "";
  private networks: MempoolSpaceConfig['networks'];
  private network: NetworkType;
  constructor(network: NetworkType, config?: MempoolSpaceConfig) {
    this.networks = {
      [MAINNET]: {
        apiUrl: getMempoolSpaceUrl('mainnet')
      },
      [TESTNET]: {
        apiUrl: getMempoolSpaceUrl('testnet')
      },
      [TESTNET4]: {
        apiUrl: getMempoolSpaceUrl('testnet4')
      },
      [SIGNET]: {
        apiUrl: getMempoolSpaceUrl('signet')
      },
      [FRACTAL_MAINNET]: {
        apiUrl: getMempoolSpaceUrl('fractal-mainnet')
      },
      [FRACTAL_TESTNET]: {
        apiUrl: getMempoolSpaceUrl('fractal-testnet')
      },
      ...config?.networks,
    };
    this.network = network;
    this.setNetwork(network);
  }

  public getName() {
    return MEMPOOL_SPACE
  }

  public setNetwork(network: NetworkType) {
    if (this.networks[network]) {
      this.apiUrl = this.networks[network].apiUrl;
    } else {
      // Fallback to default URL
      this.apiUrl = getMempoolSpaceUrl(network);
    }
    this.network = network;
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

  async getAddressUtxos(address: string): Promise<Array<MempoolUtxo & { scriptPk: string }>> {
    if (address.startsWith('bcrt')) {
      return []
    }
    const utxos = await this.call('get', `/api/address/${address}/utxo`) as Array<MempoolUtxo>
    const scriptPk = bitcoin.address.toOutputScript(address, getBitcoinNetwork(this.network))
    return utxos.map((utxo) => ({
      ...utxo,
      scriptPk: Buffer.from(scriptPk).toString('hex'),
    }))
  }

  async getTransaction(
    txId: string
  ): Promise<MempoolSpaceGetTransactionResponse> {
    return await this.call('get', `/api/tx/${txId}`)
  }

  async getRecommendedFees(): Promise<{ fastFee: number; minFee: number }> {
    const response = await this.call('get', '/api/v1/fees/recommended')
    const fastFee = response.fastestFee
    const minFee = response.minimumFee
    return { fastFee, minFee }
  }

  async broadcastTransaction(txHex: string): Promise<string> {
    return await this.call('post', '/api/tx', txHex)
  }
}
