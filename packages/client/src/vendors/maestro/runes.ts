/**
 * Maestro partial {@link RuneCapability} implementation.
 *
 * @remarks
 * Maestro only supports `runesGetById` and `runesGetByName`. For full rune
 * coverage (balances, outpoints, batch outputs) merge with the sandshrew
 * data source via {@link mergeDataSources}.
 *
 * @module vendors/maestro/runes
 */

import type { RuneCapability } from '../../data-source/capabilities'
import type { DataSourceContext, RuneInfo } from '../../types'
import type { MaestroConfig } from './config'
import { maestroGet, resolveUrlAndKey } from './shared'

type MaestroRuneResponse = {
  data: {
    id: string
    name: string
    spaced_name: string
    symbol: string
    divisibility: number
    premine: string
    etching_tx: string
    etching_height: number
    max_supply: string
    circulating_supply: string
    mints: number
    terms: {
      mint_txs_cap: unknown
      amount_per_mint: unknown
      start_height: unknown
      end_height: unknown
    }
  }
}

export function runeCapabilities(
  vendorConfig: MaestroConfig
): (ctx: DataSourceContext) => Pick<RuneCapability, 'runesGetById' | 'runesGetByName'> {
  return (ctx: DataSourceContext) => {
    const { apiUrl, apiKey } = resolveUrlAndKey(ctx.network.id, vendorConfig)

    const methods: Pick<RuneCapability, 'runesGetById' | 'runesGetByName'> = {
      async runesGetById(runeId: string): Promise<RuneInfo> {
        const resp = (await maestroGet(
          apiUrl,
          apiKey,
          `/assets/runes/${runeId}`
        )) as MaestroRuneResponse

        return {
          entry: {
            block: resp.data.etching_height,
            burned: 0,
            divisibility: resp.data.divisibility,
            etching: resp.data.etching_tx,
            mints: resp.data.mints,
            number: 0,
            premine: Number(resp.data.premine),
            spaced_rune: resp.data.spaced_name,
            symbol: resp.data.symbol,
            terms: {
              amount: 0,
              cap: 0,
              height: [],
              offset: [],
            },
            timestamp: 0,
            turbo: false,
          },
          id: resp.data.id,
          mintable: false,
          parent: '',
        }
      },

      async runesGetByName(runeName: string): Promise<RuneInfo> {
        return methods.runesGetById(runeName)
      },
    }

    return methods
  }
}
