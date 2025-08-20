export type Inscription = {
  id: string;
  inscriptionId: string;
  content: string;
  number: number;
  address: string;
  contentType: string;
  output: string;
  location: string;
  genesisTransaction: string;
  height: number;
  preview: string;
  outputValue: number;
  offset?: number;
}


export type Brc20Balance = {
  ticker: string;
  overall: string;
  transferable: string;
  available: string;
};
