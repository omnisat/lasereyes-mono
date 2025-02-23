import axios from "axios";
import { DataSource } from "../../../types/data-source";

export class SandshrewDataSource implements DataSource {
  private apiUrl: string = '';
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string, network: string) {
    this.apiKey = apiKey;
    this.setNetwork(network, baseUrl);
  }

  public setNetwork(network: string, baseUrl?: string) {
    this.apiUrl = baseUrl
      ? `${baseUrl}/${network === 'mainnet' ? '' : network}`
      : `https://mainnet.sandshrew.io/v1/lasereyes`;
  }

  private async call(method: string, params: any) {
    try {
      const response = await axios.post(this.apiUrl, {
        jsonrpc: '2.0',
        id: method,
        method,
        params
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`SandshrewDataSource.callRPC error:`, error);
      throw error;
    }
  }

  async getTransaction(txId: string) {
    return this.call('esplora_tx', [txId]);
  }

  async getRuneById(runeId: string) {
    return this.call('ord_rune', [runeId]);
  }

  async getRuneByName(runeName: string) {
    return this.call('ord_rune', [runeName]);
  }

  async broadcastTransaction(rawTx: string) {
    return this.call('broadcast_tx', [rawTx]);
  }
}
