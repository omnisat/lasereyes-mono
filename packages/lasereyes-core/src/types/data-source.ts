export interface DataSource {
  getTransaction?(txId: string): Promise<any>;
  getRawTransaction?(txId: string): Promise<any>;
  getRecommendedFees?(): Promise<any>;
  getRuneById?(runeId: string): Promise<any>;
  getRuneByName?(runeName: string): Promise<any>;
  broadcastTransaction?(rawTx: string): Promise<string>;
  setNetwork?(network: string): void;
  getTransactionInfo?(id: string): Promise<any>
  getOrdAddress?(address: string): Promise<any>
}
