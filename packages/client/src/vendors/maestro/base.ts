/**
 * Maestro {@link BaseCapability} implementation.
 *
 * @remarks
 * Maestro covers balance, transaction lookup, broadcast, and fees but does
 * NOT support `btcGetAddressUtxos`, `btcGetOutputValue`, or
 * `btcWaitForTransaction` — those throw {@link DataSourceError} so the
 * caller can fall back to another data source via {@link mergeDataSources}.
 *
 * @module vendors/maestro/base
 */

import type { BaseCapability } from '../../data-source/capabilities'
import { DataSourceError } from '../../errors'
import type {
  DataSourceContext,
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
): (ctx: DataSourceContext) => BaseCapability {
  return (ctx: DataSourceContext) => {
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
        throw new DataSourceError(
          'btcGetAddressUtxos is not supported by Maestro data source',
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
        throw new DataSourceError(
          'btcGetOutputValue is not supported by Maestro data source',
          'maestro'
        )
      },

      async btcWaitForTransaction(_txId: string): Promise<boolean> {
        throw new DataSourceError(
          'btcWaitForTransaction is not supported by Maestro data source',
          'maestro'
        )
      },
    }

    return methods
  }
}
