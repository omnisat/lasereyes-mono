/**
 * Sandshrew {@link BaseCapability} implementation.
 *
 * @module vendors/sandshrew/base
 */

import type { BaseCapability } from '../../data-source/capabilities'
import { getAddressScriptPubKey } from '../../lib/btc'
import { bytesToHex } from '../../lib/bytes'
import type {
  DataSourceContext,
  FeeEstimate,
  PaginatedResult,
  Transaction,
  UTXO,
} from '../../types'
import type { SandshrewConfig } from './config'
import { SandshrewRpcClient } from './rpc'
import { resolveUrl } from './shared'

export function baseCapabilities(
  vendorConfig?: SandshrewConfig
): (ctx: DataSourceContext) => BaseCapability {
  return (ctx: DataSourceContext) => {
    const { url, key } = resolveUrl(ctx.network.id, vendorConfig)
    const rpc = new SandshrewRpcClient(`${url}/${key}`)

    const methods: BaseCapability = {
      async btcGetBalance(address: string): Promise<string> {
        const response = await rpc.call('esplora_address', [address])
        const result = response.result as {
          chain_stats: { funded_txo_sum: string; spent_txo_sum: string }
        }
        return (
          BigInt(result.chain_stats.funded_txo_sum) - BigInt(result.chain_stats.spent_txo_sum)
        ).toString()
      },

      async btcGetAddressUtxos(address: string): Promise<PaginatedResult<UTXO>> {
        const response = await rpc.call('esplora_address::utxo', [address])
        const scriptPk = getAddressScriptPubKey(address, ctx.network.type)
        const mapped = (response.result as UTXO[]).map(utxo => ({
          ...utxo,
          scriptPk: bytesToHex(scriptPk),
        })) as UTXO[]
        return { data: mapped }
      },

      async btcGetTransaction(txId: string): Promise<Transaction> {
        const response = await rpc.call('esplora_tx', [txId])
        return response.result as Transaction
      },

      async btcBroadcastTransaction(rawTx: string): Promise<string> {
        const response = await rpc.call('broadcast_tx', [rawTx])
        return response as unknown as string
      },

      async btcGetRecommendedFees(): Promise<FeeEstimate> {
        const response = await rpc.call('esplora_fee-estimates', [])
        const feeEstimates = response.result as Record<string, number>
        const fastFee = feeEstimates['1'] || 0
        const minFee = Math.min(...Object.values(feeEstimates))
        return { fastFee: Math.round(fastFee), minFee: Math.round(minFee) }
      },

      async btcGetOutputValue(txId: string, vout: number): Promise<number | null> {
        const response = await rpc.call('esplora_tx', [txId])
        const result = response.result as {
          vout: { value: number }[]
        }
        return result.vout[vout]?.value ?? null
      },

      async btcWaitForTransaction(txId: string): Promise<boolean> {
        const timeout = 60000
        const startTime = Date.now()
        while (true) {
          try {
            const tx = await methods.btcGetTransaction(txId)
            if (tx) return true
            if (Date.now() - startTime > timeout) return false
            await new Promise(resolve => setTimeout(resolve, 5000))
          } catch {
            if (Date.now() - startTime > timeout) return false
            await new Promise(resolve => setTimeout(resolve, 5000))
          }
        }
      },
    }

    return methods
  }
}
