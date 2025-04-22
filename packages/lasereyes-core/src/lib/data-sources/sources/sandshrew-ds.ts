import axios from "axios";
import type { DataSource } from "../../../types/data-source";
import { MAINNET } from "../../../constants";
import type { OrdOutputs, OrdRuneBalance } from "../../../types/ord";
import type { AddressInfo, InscriptionInfo } from 'ordapi';
import type { SandshrewGetRuneByIdOrNameResponse, SingleRuneOutpoint } from "../../../types/sandshrew";
import type { EsploraTx } from "../../../types/esplora";
import { getPublicKeyHash } from "../../btc";
import { SANDSHREW_LASEREYES_KEY, SANDSHREW_URL } from "../../urls";
import type { RpcResponse } from "../../../types/rpc";
import { SANDSHREW } from "../../../constants/data-sources";
import { AlkanesRpc } from "@oyl/sdk/lib/rpclient/alkanes";
import type { AlkanesOutpoint } from "../../../types";

export class SandshrewDataSource implements DataSource {
  private apiUrl = `${SANDSHREW_URL}/${SANDSHREW_LASEREYES_KEY}`;
  private apiKey: string = SANDSHREW_LASEREYES_KEY;
  private alkanes: AlkanesRpc;

  constructor(baseUrl: string, apiKey: string, network: string) {
    this.setNetwork(network, baseUrl);
    this.apiKey = apiKey
    this.alkanes = new AlkanesRpc(this.apiUrl);
  }

  public getName() {
    return SANDSHREW;
  }

  public setNetwork(_network: string, _baseUrl?: string) {
    this.apiUrl = `${this.apiUrl}/${this.apiKey || SANDSHREW_LASEREYES_KEY}`;
    this.alkanes = new AlkanesRpc(this.apiUrl);
  }

  private async call(method: string, params: unknown) {
    try {
      const response = await axios.post(this.apiUrl, {
        jsonrpc: '2.0',
        id: method,
        method,
        params
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      console.error('SandshrewDataSource.callRPC error:', error)
      throw error
    }
  }

  async getAlkanesByAddress(address: string, protocolTag: string): Promise<AlkanesOutpoint[]> {
    const response = await this.alkanes.getAlkanesByAddress({
      address,
      protocolTag
    })
    return response as AlkanesOutpoint[];
  }

  async getTransaction(txId: string) {
    const response = (await this.call('esplora_tx', [txId])) as RpcResponse
    return response.result as EsploraTx;
  }

  async getRuneById(runeId: string): Promise<SandshrewGetRuneByIdOrNameResponse> {
    const response = await this.call('ord_rune', [runeId]) as RpcResponse
    return response.result as SandshrewGetRuneByIdOrNameResponse;
  }

  async getRuneByName(runeName: string): Promise<SandshrewGetRuneByIdOrNameResponse> {
    const response = await this.call('ord_rune', [runeName]) as RpcResponse
    return response.result as SandshrewGetRuneByIdOrNameResponse;
  }

  async broadcastTransaction(rawTx: string): Promise<string> {
    return await this.call('broadcast_tx', [rawTx]) as string
  }

  async getOrdAddress(address: string): Promise<AddressInfo> {
    const response = await this.call('ord_address', [address]) as RpcResponse
    return response.result as AddressInfo;
  }

  async getTxInfo(txId: string): Promise<EsploraTx> {
    const response = await this.call('esplora_tx', [txId]) as RpcResponse
    return response.result as EsploraTx;
  }

  async batchOrdOutput({ outpoints, rune_name }: { outpoints: string[], rune_name: string }): Promise<OrdOutputs[]> {
    const MAX_OUTPOINTS_PER_CALL = 1000;
    const ordOutputs: OrdOutputs[] = [];
    for (let i = 0; i < outpoints.length; i += MAX_OUTPOINTS_PER_CALL) {
      const batch = outpoints.slice(i, i + MAX_OUTPOINTS_PER_CALL);
      const multiCall = batch.map((outpoint) => {
        return ['ord_output', [outpoint]];
      });

      const { result } = await this.call('sandshrew_multicall', multiCall) as RpcResponse;

      for (let i = 0; i < result.length; i++) {
        result[i].result.output = batch[i];
      }

      const filteredResult = result.filter((output: OrdOutputs) =>
        Object.keys(output.result.runes).includes(rune_name)
      );
      ordOutputs.push(...filteredResult);
    }
    return ordOutputs;
  }

  async batchOrdInscriptionInfo(inscriptionIds: string[]): Promise<InscriptionInfo[]> {
    const MAX_INSCRIPTIONS_PER_CALL = 1000;
    const inscriptionInfos: InscriptionInfo[] = [];
    for (let i = 0; i < inscriptionIds.length; i += MAX_INSCRIPTIONS_PER_CALL) {
      const batch = inscriptionIds.slice(i, i + MAX_INSCRIPTIONS_PER_CALL);
      const multiCall = batch.map((inscriptionId) => {
        return ['ord_inscription', [inscriptionId]];
      });
      const { result } = await this.call('sandshrew_multicall', multiCall) as RpcResponse;
      for (let i = 0; i < result.length; i++) {
        inscriptionInfos.push(result[i].result as InscriptionInfo);
      }
    }
    return inscriptionInfos;
  }

  async getAddressRunesBalances(address: string): Promise<OrdRuneBalance[]> {
    try {
      const response = await this.getOrdAddress(address);
      const runesData = response.runes_balances;
      if (!runesData) {
        throw new Error('No runes data found');
      }

      return runesData.map((rune) => ({
        name: rune[0],
        balance: rune[1],
        symbol: rune[2],
      })) as OrdRuneBalance[];
    } catch (error) {
      console.error('Error fetching ord address:', error);
      throw error;
    }
  }

  async getInscriptionInfo(inscriptionId: string): Promise<any> {
    const response = await this.call('ord_inscription', [inscriptionId]) as RpcResponse
    return response.result as InscriptionInfo
  }

  async getRuneOutpoints({ address, runeId }: { address: string, runeId: string }): Promise<SingleRuneOutpoint[]> {
    const addressOutpoints = await this.getOrdAddress(address);
    const { entry } = await this.getRuneById(runeId);
    const runeName = entry.spaced_rune;

    const ordOutputs = await this.batchOrdOutput({
      outpoints: addressOutpoints.outputs,
      rune_name: runeName,
    });

    const runeUtxosOutpoints = await this.mapRuneBalances({
      ordOutputs: ordOutputs,
    });

    return runeUtxosOutpoints;
  }

  private async mapRuneBalances({ ordOutputs }: { ordOutputs: OrdOutputs[] }): Promise<SingleRuneOutpoint[]> {
      const runeOutpoints: SingleRuneOutpoint[] = [];
      for (let i = 0; i < ordOutputs.length; i++) {
        const ordOutput = ordOutputs[i];
        const { result } = ordOutput;
        if (!result.output?.split(':')) {
          throw new Error('No output found');
        }

        const { output, address, runes } = result;
        const singleRuneOutpoint: SingleRuneOutpoint = {
          output,
          wallet_addr: address,
          script: '',
          balances: [],
          decimals: [],
          rune_ids: [],
          value: result.value,
        };

        singleRuneOutpoint.script = Buffer.from(
          getPublicKeyHash(address, MAINNET)
        ).toString('hex');

        if (typeof runes === 'object' && !Array.isArray(runes)) {
          for (const rune in runes) {
            singleRuneOutpoint.balances.push(runes[rune].amount);
            singleRuneOutpoint.decimals.push(runes[rune].divisibility);
            singleRuneOutpoint.rune_ids.push((await this.getRuneByName(rune)).id);
          }
        }

        runeOutpoints.push(singleRuneOutpoint);
      }
      return runeOutpoints;
  }

}
