import type { InscriptionInfo } from "ordapi";
import type { AlkanesOutpoint, MempoolUtxo, NetworkType } from ".";
import type { MaestroGetInscriptionInfoResponse } from "./maestro";

export interface DataSource {
  getName(): string;
  getAlkanesByAddress?(address: string, protocolTag: string): Promise<AlkanesOutpoint[]>;
  getAddressInscriptions?(address: string, offset?: number, limit?: number): Promise<any>;
  getAddressBtcBalance?(address: string): Promise<string>;
  getAddressBrc20Balances?(address: string): Promise<any>;
  getAddressRunesBalances?(address: string): Promise<any>;
  getInscriptionInfo?(inscriptionId: string): Promise<MaestroGetInscriptionInfoResponse>;
  batchOrdInscriptionInfo?(inscriptionIds: string[]): Promise<InscriptionInfo[]>;
  getTransaction?(txId: string): Promise<any>;
  getRawTransaction?(txId: string): Promise<any>;
  getRecommendedFees?(): Promise<{ fastFee: number, minFee: number }>;
  getBrc20ByTicker?(ticker: string): Promise<any>;
  getRuneById?(runeId: string): Promise<any>;
  getRuneByName?(runeName: string): Promise<any>;
  broadcastTransaction?(rawTx: string): Promise<string>;
  setNetwork?(network: string): void;
  getTransactionInfo?(id: string): Promise<any>;
  getOrdAddress?(address: string): Promise<any>;
  getTxInfo?(txId: string): Promise<any>;
  batchOrdOutput?(params: { outpoints: string[], rune_name: string }): Promise<any>;
  getRuneOutpoints?(params: { address: string, runeId: string }): Promise<any>;
  getAddressUtxos?(address: string): Promise<Array<MempoolUtxo>>;
  getOutputValueByVOutIndex?(txId: string, vOut: number): Promise<number | null>;
  waitForTransaction?(id: string): Promise<boolean>;
  getOutputValueByVOutIndex?(txId: string, vOut: number, network: NetworkType): Promise<number | null>;
}
