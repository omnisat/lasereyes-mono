import { getSandshrewUrl, SANDSHREW_LASEREYES_KEY } from '../../lib/urls'
import type {
  CapabilityGroup,
  DataSourceContext,
  OrdOutputWrapper,
  RuneBalance,
  RuneCapability,
  RuneInfo,
  RuneOutpoint,
} from '../../types'
import { BaseNetwork } from '../../types/network'
import type { SandshrewConfig } from './config'
import { SandshrewRpcClient } from './rpc'

function resolveUrl(network: string, config?: SandshrewConfig): { url: string; key: string } {
  if (config?.networks?.[network]) {
    return { url: config.networks[network].apiUrl, key: config.networks[network].apiKey }
  }
  const isTestnet =
    network === BaseNetwork.TESTNET ||
    network === BaseNetwork.TESTNET4 ||
    network === BaseNetwork.SIGNET ||
    network === BaseNetwork.FRACTAL_TESTNET
  const fallbackNet = isTestnet ? BaseNetwork.SIGNET : BaseNetwork.MAINNET
  if (config?.networks?.[fallbackNet]) {
    return { url: config.networks[fallbackNet].apiUrl, key: config.networks[fallbackNet].apiKey }
  }
  return { url: getSandshrewUrl(network), key: config?.apiKey || SANDSHREW_LASEREYES_KEY }
}

export function runeCapabilities(
  vendorConfig?: SandshrewConfig
): (ctx: DataSourceContext) => CapabilityGroup<RuneCapability> {
  return (ctx: DataSourceContext) => {
    const { url, key } = resolveUrl(ctx.network, vendorConfig)
    const rpc = new SandshrewRpcClient(`${url}/${key}`)

    const methods: RuneCapability = {
      async getAddressRunesBalances(address: string): Promise<RuneBalance[]> {
        const ordResp = await rpc.call('ord_address', [address])
        const result = ordResp.result as { runes_balances?: string[][] }
        if (!result.runes_balances) return []
        return result.runes_balances.map((rune: string[]) => ({
          name: rune[0],
          balance: rune[1],
          symbol: rune[2],
        }))
      },

      async getRuneById(runeId: string): Promise<RuneInfo> {
        const response = await rpc.call('ord_rune', [runeId])
        return response.result as RuneInfo
      },

      async getRuneByName(runeName: string): Promise<RuneInfo> {
        const response = await rpc.call('ord_rune', [runeName])
        return response.result as RuneInfo
      },

      async getRuneOutpoints(params: { address: string; runeId: string }): Promise<RuneOutpoint[]> {
        const ordResp = await rpc.call('ord_address', [params.address])
        const addressInfo = ordResp.result as { outputs: string[] }
        const runeInfo = await methods.getRuneById(params.runeId)
        const runeName = runeInfo.entry.spaced_rune

        const ordOutputs = await methods.batchGetRuneOutputs({
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
              const nameInfo = await methods.getRuneByName(rune)
              outpoint.rune_ids.push(nameInfo.id)
            }
          }

          runeOutpoints.push(outpoint)
        }
        return runeOutpoints
      },

      async batchGetRuneOutputs(params: {
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

    return { group: 'rune', methods }
  }
}
