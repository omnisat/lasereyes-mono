import axios from "axios";
import { DataSource } from "../../../types/data-source";
import { RuneBalance } from "@magiceden-oss/runestone-lib";
import { MAINNET } from "../../../constants";
import { OrdOutputs } from "../../../types/ord";
import { EsploraTx, SingleRuneOutpoint } from "../../../types/sandshrew";
import { getPublicKeyHash } from "../../btc";

export class SandshrewDataSource implements DataSource {
  private apiUrl: string = '';
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string, network: string) {
    this.apiKey = apiKey;
    this.setNetwork(network, baseUrl);
  }

  public setNetwork(_network: string, _baseUrl?: string) {
    this.apiUrl = `https://mainnet.sandshrew.io/v1/lasereyes`;
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

  async getOrdAddress(address: string) {
    return this.call('ord_address', [address]);
  }

  async getTxInfo(txId: string): Promise<EsploraTx> {
    return this.call('esplora_tx', [txId]);
  }

  async batchOrdOutput({ outpoints, rune_name }: { outpoints: string[], rune_name: string }): Promise<OrdOutputs[]> {
    const MAX_OUTPOINTS_PER_CALL = 1000;
    const ordOutputs: OrdOutputs[] = [];
    for (let i = 0; i < outpoints.length; i += MAX_OUTPOINTS_PER_CALL) {
      const batch = outpoints.slice(i, i + MAX_OUTPOINTS_PER_CALL);
      const multiCall = batch.map((outpoint) => {
        return ['ord_output', [outpoint]];
      });

      const { result } = await this.call('sandshrew_multicall', multiCall);

      for (let i = 0; i < result.length; i++) {
        result[i].result['output'] = batch[i];
      }

      const filteredResult = result.filter((output: OrdOutputs) =>
        Object.keys(output.result.runes).includes(rune_name)
      );
      ordOutputs.push(...filteredResult);
    }
    return ordOutputs;
  }

  async getAddressRunesBalances(address: string) {
    try {
      const response = await this.getOrdAddress(address);
      const runesData = response.result.runes_balances;
      if (!runesData) {
        throw new Error('No runes data found');
      }

      return runesData.map((rune: any) => ({
        name: rune[0],
        balance: rune[1],
        symbol: rune[2],
      })) as RuneBalance[];
    } catch (error) {
      console.error('Error fetching ord address:', error);
      throw error;
    }
  }

  async getRuneOutpoints({ address, runeId }: { address: string, runeId: string }): Promise<SingleRuneOutpoint[]> {
    const addressOutpoints = await this.getOrdAddress(address);
    const { entry } = await this.getRuneById(runeId);
    const runeName = entry.spaced_rune;

    const ordOutputs = await this.batchOrdOutput({
      outpoints: addressOutpoints.result.outputs,
      rune_name: runeName,
    });

    const runeUtxosOutpoints = await this.mapRuneBalances({
      ordOutputs: ordOutputs,
    });

    return runeUtxosOutpoints;
  }

  private async mapRuneBalances({ ordOutputs }: { ordOutputs: OrdOutputs[] }): Promise<SingleRuneOutpoint[]> {
    try {
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

        singleRuneOutpoint['script'] = Buffer.from(
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
    } catch (e) {
      throw e;
    }
  }

}
