/**
 * Maestro {@link BaseCapability} implementation.
 *
 * @remarks
 * Maestro covers balance, transaction lookup, broadcast, and fees but does
 * NOT support `btcGetAddressUtxos`, `btcGetOutputValue`, or
 * `btcWaitForTransaction` — those throw {@link ChainBackendError} so the
 * caller can fall back to another backend via {@link mergeChainBackends}.
 *
 * @module vendors/maestro/base
 */

import type { BaseCapability } from '../../backend/capabilities'
import { ChainBackendError } from '../../errors'
import type {
  ChainBackendContext,
  FeeEstimate,
  PaginatedResult,
  PaginationParams,
  Transaction,
  UTXO,
} from '../../types'
import type { MaestroConfig } from './config'
import { maestroGet, maestroPost, resolveUrlAndKey } from './shared'

export function baseCapabilities(
  vendorConfig: MaestroConfig
): (ctx: ChainBackendContext) => BaseCapability {
  return (ctx: ChainBackendContext) => {
    const { apiUrl, apiKey } = resolveUrlAndKey(ctx.network.id, vendorConfig)

    const methods: BaseCapability = {
      async btcGetBalance(address: string): Promise<string> {
        const resp = await maestroGet(apiUrl, apiKey, `/addresses/${address}/balance`)
        return (resp as { data: string }).data
      },

      async btcGetAddressUtxos(
        _address: string,
        _pagination?: PaginationParams
      ): Promise<PaginatedResult<UTXO>> {
        throw new ChainBackendError(
          'btcGetAddressUtxos is not supported by Maestro backend',
          'maestro'
        )
      },

      async btcGetTransaction(txId: string): Promise<Transaction> {
        const resp = await maestroGet(apiUrl, apiKey, `/rpc/transaction/${txId}`)
        return (resp as { data: Transaction }).data
      },

      async btcBroadcastTransaction(rawTx: string): Promise<string> {
        return (await maestroPost(apiUrl, apiKey, '/arpc/transaction/submit', rawTx)) as string
      },

      async btcGetRecommendedFees(): Promise<FeeEstimate> {
        const resp = await maestroGet(apiUrl, apiKey, '/mempool/fee_rates')
        const data = resp as { data: Array<{ sats_per_vb: { min: number; median: number } }> }
        const fee = data.data[0].sats_per_vb
        return { fastFee: fee.median, minFee: fee.min }
      },

      async btcGetOutputValue(_txId: string, _vout: number): Promise<number | null> {
        throw new ChainBackendError(
          'btcGetOutputValue is not supported by Maestro backend',
          'maestro'
        )
      },

      async btcWaitForTransaction(_txId: string): Promise<boolean> {
        throw new ChainBackendError(
          'btcWaitForTransaction is not supported by Maestro backend',
          'maestro'
        )
      },
    }

    return methods
  }
}
