/**
 * Maestro {@link Brc20Capability} implementation.
 *
 * @module vendors/maestro/brc20
 */

import type { Brc20Capability } from '../../backend/capabilities'
import type {
  Brc20Balance,
  Brc20Info,
  ChainBackendContext,
  PaginatedResult,
  PaginationParams,
} from '../../types'
import type { MaestroConfig } from './config'
import { maestroGet, resolveUrlAndKey } from './shared'

export function brc20Capabilities(
  vendorConfig: MaestroConfig
): (ctx: ChainBackendContext) => Brc20Capability {
  return (ctx: ChainBackendContext) => {
    const { apiUrl, apiKey } = resolveUrlAndKey(ctx.network.id, vendorConfig)

    const methods: Brc20Capability = {
      async brc20GetAddressBalances(
        address: string,
        _pagination?: PaginationParams
      ): Promise<PaginatedResult<Brc20Balance>> {
        const resp = await maestroGet(apiUrl, apiKey, `/addresses/${address}/brc20`)
        const data = (
          resp as {
            data: Record<string, { total: string; available: string }>
          }
        ).data

        return {
          data: Object.entries(data)
            .map(([ticker, balance]) => ({
              ticker,
              overall: balance.total,
              transferable: '0',
              available: balance.available,
            }))
            .slice(Number(_pagination?.cursor || 0)),
        }
      },

      async brc20GetByTicker(ticker: string): Promise<Brc20Info> {
        return (await maestroGet(apiUrl, apiKey, `/assets/brc20/${ticker}`)) as Brc20Info
      },
    }

    return methods
  }
}
