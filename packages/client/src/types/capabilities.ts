import type { AlkaneBalance, AlkaneOutpoint } from './alkane'
import type { Brc20Balance, Brc20Info } from './brc20'
import type { FeeEstimate } from './fees'
import type { Inscription, InscriptionInfo } from './inscription'
import type { OrdOutputWrapper, RuneBalance, RuneInfo, RuneOutpoint } from './rune'
import type { Transaction } from './transaction'
import type { FormattedUTXO, UTXO } from './utxo'

export interface BaseCapability {
  getBalance(address: string): Promise<string>
  getUtxos(address: string): Promise<UTXO[]>
  getTransaction(txId: string): Promise<Transaction>
  broadcastTransaction(rawTx: string): Promise<string>
  getRecommendedFees(): Promise<FeeEstimate>
  getOutputValue(txId: string, vout: number): Promise<number | null>
  waitForTransaction(txId: string): Promise<boolean>
}

export interface InscriptionCapability {
  getAddressInscriptions(address: string, offset?: number, limit?: number): Promise<Inscription[]>
  getInscriptionInfo(inscriptionId: string): Promise<InscriptionInfo>
  batchGetInscriptionInfo(inscriptionIds: string[]): Promise<InscriptionInfo[]>
}

export interface RuneCapability {
  getAddressRunesBalances(address: string): Promise<RuneBalance[]>
  getRuneById(runeId: string): Promise<RuneInfo>
  getRuneByName(runeName: string): Promise<RuneInfo>
  getRuneOutpoints(params: { address: string; runeId: string }): Promise<RuneOutpoint[]>
  batchGetRuneOutputs(params: {
    outpoints: string[]
    runeName: string
  }): Promise<OrdOutputWrapper[]>
}

export interface Brc20Capability {
  getAddressBrc20Balances(address: string): Promise<Brc20Balance[]>
  getBrc20ByTicker(ticker: string): Promise<Brc20Info>
}

export interface AlkaneCapability {
  getAddressAlkanesBalances(address: string): Promise<AlkaneBalance[]>
  getAlkanesByAddress(address: string): Promise<AlkaneOutpoint[]>
}

export interface OrdCapability {
  getOrdAddress(address: string): Promise<OrdAddressInfo>
  getFormattedUtxos(address: string | string[]): Promise<FormattedUTXO[]>
}

export interface OrdAddressInfo {
  outputs: string[]
  inscriptions: string[]
  sat_balance: number
  runes_balances: string[][]
}
