import { MempoolUtxo, NetworkType } from ".";

export interface DataSource {
  getAddressInscriptions?(address: string, offset?: number, limit?: number): Promise<any>;
  getBalance?(address: string): Promise<string>;
  getAddressBrc20Balances?(address: string): Promise<any>;
  getTransaction?(txId: string): Promise<any>;
  getRawTransaction?(txId: string): Promise<any>;
  getRecommendedFees?(): Promise<any>;
  getRuneById?(runeId: string): Promise<any>;
  getRuneByName?(runeName: string): Promise<any>;
  broadcastTransaction?(rawTx: string): Promise<string>;
  setNetwork?(network: string): void;
  getTransactionInfo?(id: string): Promise<any>;
  getOrdAddress?(address: string): Promise<any>;
  getTxInfo?(txId: string): Promise<any>;
  batchOrdOutput?(params: { outpoints: string[], rune_name: string }): Promise<any>;
  getAddressRunesBalances?(address: string): Promise<any>;
  getRuneOutpoints?(params: { address: string, runeId: string }): Promise<any>;
  getAddressUtxos?(address: string, network: NetworkType): Promise<Array<MempoolUtxo>>;
  waitForTransaction?(id: string, network: NetworkType): Promise<Boolean>;
  getOutputValueByVOutIndex?(txId: string, vOut: number, network: NetworkType): Promise<number | null>;
}
