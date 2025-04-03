import axios from "axios";
import { DataSource } from "../../../types/data-source";
import { getMempoolSpaceUrl } from "../../urls";
import { MempoolUtxo, NetworkType } from "../../../types";
import { MempoolSpaceFeeRatesResponse, MempoolSpaceGetTransactionResponse } from "../../../types/mempool-space";
import { MEMPOOL_SPACE } from "../../../constants/data-sources";

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
  private apiUrl: string = "";
  private networks: MempoolSpaceConfig['networks'];

  constructor(network: NetworkType, config?: MempoolSpaceConfig) {
    this.networks = config?.networks || {
      mainnet: {
        apiUrl: getMempoolSpaceUrl('mainnet')
      },
      testnet: {
        apiUrl: getMempoolSpaceUrl('testnet')
      },
      testnet4: {
        apiUrl: getMempoolSpaceUrl('testnet4')
      },
      signet: {
        apiUrl: getMempoolSpaceUrl('signet')
      },
      "fractal-mainnet": {
        apiUrl: getMempoolSpaceUrl('fractal-mainnet')
      },
      "fractal-testnet": {
        apiUrl: getMempoolSpaceUrl('fractal-testnet')
      }
    };
    this.setNetwork(network);
  }

  public getName() {
    return MEMPOOL_SPACE;
  }

  public setNetwork(network: NetworkType) {
    if (this.networks[network]) {
      this.apiUrl = this.networks[network].apiUrl;
    } else {
      // Fallback to default URL
      this.apiUrl = getMempoolSpaceUrl(network);
    }
  }

  private async call(method: 'get' | 'post', endpoint: string, body?: any) {
    try {
      const url = `${this.apiUrl}${endpoint}`;
      const options = {
        headers: {
          'Content-Type': method === 'post' ? 'text/plain' : 'application/json'
        }
      };

      const response = method === 'get'
        ? await axios.get(url, options)
        : await axios.post(url, body, options);

      return response.data;
    } catch (error) {
      console.error(`MempoolSpaceDataSource.call error:`, error);
      throw error;
    }
  }


  async getOutputValueByVOutIndex(
    commitTxId: string,
    vOut: number,
  ): Promise<number | null> {
    const timeout: number = 60000
    const startTime: number = Date.now()

    while (true) {
      try {
        const rawTx: any = await this.getTransaction(commitTxId)

        if (rawTx && rawTx.vout && rawTx.vout.length > 0) {
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


  async waitForTransaction(
    txId: string,
  ): Promise<boolean> {
    const timeout: number = 60000
    const startTime: number = Date.now()
    while (true) {
      try {
        const tx: any = await this.getTransaction(txId)
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
    return this.call('get', `/api/address/${address}/utxo`);
  }

  async getTransaction(txId: string): Promise<MempoolSpaceGetTransactionResponse> {
    return await this.call('get', `/api/tx/${txId}`);
  }

  async getRecommendedFees(): Promise<MempoolSpaceFeeRatesResponse> {
    return await this.call('get', `/api/v1/fees/recommended`);
  }

  async broadcastTransaction(txHex: string): Promise<string> {
    return await this.call('post', `/api/tx`, txHex);
  }
}
