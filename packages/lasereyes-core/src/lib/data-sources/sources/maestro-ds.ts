import axios from "axios";
import { NetworkType } from "../../../types"
import { DataSource } from "../../../types/data-source"
import { getMaestroUrl } from "../../urls";

export class MaestroDataSource implements DataSource {
  private apiUrl: string = "";
  private apiKey: string;

  constructor(apiKey: string, network: NetworkType) {
    this.apiKey = apiKey;
    this.setNetwork(network);
  }

  public setNetwork(network: NetworkType) {
    this.apiUrl = getMaestroUrl(network);
  }

  private async call(method: 'get' | 'post', body?: any) {
    try {
      const options = {
        headers: {
          'Content-Type': 'application/json',
          'api-key': `${this.apiKey}`
        }
      };

      const response = method === 'get'
        ? await axios.get(this.apiUrl, options)
        : await axios.post(this.apiUrl, body, options);

      return response.data;
    } catch (error) {
      console.error(`MaestroDataSource.call error:`, error);
      throw error;
    }
  }

  async getTransactionInfo(txHash: string): Promise<any> {
    return this.call('get', `/transactions/${txHash}`);
  }

  async getRawTransaction(txHash: string): Promise<any> {
    return this.call('get', `/raw-transactions/${txHash}`);
  }

  async getRecommendedFees(): Promise<any> {
    return this.call('get', `/fees/recommended`);
  }

  async getOrdAddress(address: string): Promise<any> {
    return this.call('get', `/inscriptions/${address}`);
  }

  async getRuneById(runeId: string): Promise<any> {
    return this.call('get', `/runes/${runeId}`);
  }

  async getRuneByName(runeName: string): Promise<any> {
    return this.call('get', `/runes/${runeName}`);
  }
}
