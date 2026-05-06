/**
 * Sandshrew {@link RuneCapability} implementation.
 *
 * @module vendors/sandshrew/runes
 */

import type { RuneCapability } from '../../data-source/capabilities'
import type {
  DataSourceContext,
  OrdOutputWrapper,
  PaginatedResult,
  PaginationParams,
  RuneOutpoint,
} from '../../types'
import type { SandshrewConfig } from './config'
import { SandshrewRpcClient } from './rpc'
import { resolveUrl } from './shared'

export function runeCapabilities(
  vendorConfig?: SandshrewConfig
): (ctx: DataSourceContext) => RuneCapability {
  return (ctx: DataSourceContext) => {
    const { url, key } = resolveUrl(ctx.network.id, vendorConfig)
    const rpc = new SandshrewRpcClient(`${url}/${key}`)

    const methods: RuneCapability = {
      async runesGetAddressBalances(address, _pagination?: PaginationParams) {
        const ordResp = await rpc.call('ord_address', [address])
        const result = ordResp.result as { runes_balances?: string[][] }
        if (!result.runes_balances) return { data: [] }
        return {
          data: result.runes_balances.map((rune: string[]) => ({
            name: rune[0],
            balance: rune[1],
            symbol: rune[2],
          })),
        }
      },

      async runesGetById(runeId) {
        const response = await rpc.call('ord_rune', [runeId])
        return response.result
      },

      async runesGetByName(runeName) {
        const response = await rpc.call('ord_rune', [runeName])
        return response.result
      },

      async runesGetOutpoints(
        params: { address: string; runeId: string },
        _pagination?: PaginationParams
      ): Promise<PaginatedResult<RuneOutpoint>> {
        const ordResp = await rpc.call('ord_address', [params.address])
        const addressInfo = ordResp.result as { outputs: string[] }
        const runeInfo = await methods.runesGetById(params.runeId)
        const runeName = runeInfo.entry.spaced_rune

        const ordOutputs = await methods.runesBatchGetOutputs({
          outpoints: addressInfo.outputs,
          runeName,
        })

        const runeOutpoints: RuneOutpoint[] = []
        for (const ordOutput of ordOutputs) {
          const { result } = ordOutput
          if (!result.output) continue
          const runes = result.runes as Record<string, { amount: number; divisibility: number }>
          const outpoint: RuneOutpoint = {
            output: result.output,
            wallet_addr: result.address,
            script: '',
            balances: [],
            decimals: [],
            rune_ids: [],
            value: result.value,
          }

          if (typeof runes === 'object' && !Array.isArray(runes)) {
            for (const rune in runes) {
              outpoint.balances.push(runes[rune].amount)
              outpoint.decimals.push(runes[rune].divisibility)
              const nameInfo = await methods.runesGetByName(rune)
              outpoint.rune_ids.push(nameInfo.id)
            }
          }

          runeOutpoints.push(outpoint)
        }
        return { data: runeOutpoints }
      },

      async runesBatchGetOutputs(params: {
        outpoints: string[]
        runeName: string
      }): Promise<OrdOutputWrapper[]> {
        const MAX_PER_CALL = 1000
        const ordOutputs: OrdOutputWrapper[] = []

        for (let i = 0; i < params.outpoints.length; i += MAX_PER_CALL) {
          const batch = params.outpoints.slice(i, i + MAX_PER_CALL)
          const multiCall = batch.map(outpoint => ['ord_output', [outpoint]])
          const results = await rpc.multicall(multiCall)

          for (let j = 0; j < results.length; j++) {
            results[j].result.output = batch[j]
          }

          const filtered = results.filter((output: any) =>
            Object.keys(output.result.runes).includes(params.runeName)
          )
          ordOutputs.push(...(filtered as unknown as OrdOutputWrapper[]))
        }
        return ordOutputs
      },
    }

    return methods
  }
}
