import axios from "axios";
import { NetworkType } from "../../../types"
import { DataSource } from "../../../types/data-source"
import { getMaestroUrl } from "../../urls";
import { MaestroAddressInscription, MaestroBrc20ByAddressResponse, MaestroGetAddressBalanceResponse, MaestroGetAddressInscriptions, MaestroGetBrc20InfoResponse, MaestroGetInscriptionInfoResponse, MaestroGetRuneInfoResponse, MaestroGetTransactionInfoResponse } from "../../../types/maestro";
import { MAESTRO } from "../../../constants/data-sources";

export class MaestroDataSource implements DataSource {
  private apiUrl: string = "";
  private apiKey: string;
  private testnetApiKey?: string;

  constructor(apiKey: string, network: NetworkType, testnetApiKey?: string) {
    this.apiKey = apiKey;
    this.testnetApiKey = testnetApiKey;
    this.setNetwork(network);
  }

  public getName() {
    return MAESTRO;
  }

  public setNetwork(network: NetworkType) {
    this.apiUrl = getMaestroUrl(network);
    if (this.apiUrl.includes('testnet')) {
      this.apiKey = this.testnetApiKey || this.apiKey;
    } else {
      this.apiKey = this.apiKey;
    }
  }

  private async call(method: 'get' | 'post', endpoint: string, body?: any) {
    const url = `${this.apiUrl}${endpoint}`;
    try {
      const options = {
        headers: {
          "Content-Type": "application/json",
          "api-key": this.apiKey
        }
      };

      const response =
        method === "get"
          ? await axios.get(url, options)
          : await axios.post(url, body, options);

      return response.data;
    } catch (error) {
      console.error(`MaestroDataSource.call error:`, error);
      throw error;
    }
  }

  async getAddressBtcBalance(address: string): Promise<string> {
    const balanceResp = await this.call('get', `/addresses/${address}/balance`) as MaestroGetAddressBalanceResponse
    return balanceResp.data
  }

  async getAddressBrc20Balances(address: string): Promise<MaestroBrc20ByAddressResponse> {
    return await this.call('get', `/addresses/${address}/brc20`) as MaestroBrc20ByAddressResponse
  }

  async getAddressInscriptions(address: string, offset?: number, limit?: number): Promise<MaestroGetAddressInscriptions> {
    const queryParams = new URLSearchParams();
    if (offset !== undefined) queryParams.append('offset', offset.toString());
    if (limit !== undefined) queryParams.append('limit', limit.toString());

    const url = `/addresses/${address}/inscriptions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.call('get', url) as MaestroGetAddressInscriptions;
    const responseWithAddress = {
      ...response, data: response.data.map((insc: MaestroAddressInscription) => ({ ...insc, address }))
    }

    return responseWithAddress;
  }

  async getInscriptionInfo(inscriptionId: string): Promise<MaestroGetInscriptionInfoResponse> {
    return await this.call('get', `/assets/inscriptions/${inscriptionId}`);
  }

  async getBrc20ByTicker(ticker: string): Promise<MaestroGetBrc20InfoResponse> {
    return this.call('get', `/assets/brc20/${ticker}`);
  }

  async getRuneById(runeId: string): Promise<MaestroGetRuneInfoResponse> {
    return this.call('get', `/assets/runes/${runeId}`);
  }

  async getRuneByName(runeName: string): Promise<MaestroGetRuneInfoResponse> {
    return this.call('get', `/assets/runes/${runeName}`);
  }

  async getTransactionInfo(txHash: string): Promise<MaestroGetTransactionInfoResponse> {
    return this.call('get', `/rpc/transaction/${txHash}`);
  }

  async broadcastTransaction(txHex: string): Promise<string> {
    return await this.call('post', `/arpc/transaction/submit`, txHex);
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

}
