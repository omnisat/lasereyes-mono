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

  async getTransaction(txId: string) {
    try {
      const res = await axios.get(`${this.apiUrl}/tx/${txId}`);
      return res.data;
    } catch (error) {
      console.error(`MempoolSpaceDataSource.getTransaction error:`, error);
      throw error;
    }
  }

  async getRecommendedFees() {
    try {
      const res = await axios.get(`${this.apiUrl}/v1/fees/recommended`);
      return res.data;
    } catch (error) {
      console.error(`MempoolSpaceDataSource.getRecommendedFees error:`, error);
      throw error;
    }
  }

  async broadcastTransaction(txHex: string) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/api/tx`,
        txHex,
        {
          headers: {
            'Content-Type': 'text/plain',
          },
        }
      )
      return response.data
    } catch (error) {
      console.error(`MempoolSpaceDataSource.getTransaction error:`, error);
      throw error
    }
  }
}
