import axios from "axios";
import { DataSource } from "../../../types/data-source";
import { getMempoolSpaceUrl } from "../../urls";
import { NetworkType } from "../../../types";

export class MempoolSpaceDataSource implements DataSource {
  private apiUrl: string = "";

  constructor(baseUrl: string, network: NetworkType) {
    this.setNetwork(network, baseUrl);
  }

  public setNetwork(network: NetworkType, baseUrl?: string) {
    this.apiUrl = baseUrl
      ? `${baseUrl}/${network === 'mainnet' ? '' : network}`
      : getMempoolSpaceUrl(network);
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

  async getTransaction(txId: string) {
    return this.call('get', `/tx/${txId}`);
  }

  async getRecommendedFees() {
    return this.call('get', `/v1/fees/recommended`);
  }

  async broadcastTransaction(txHex: string) {
    return this.call('post', `/api/tx`, txHex);
  }
}
