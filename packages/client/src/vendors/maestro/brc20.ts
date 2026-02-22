import { DataSourceError } from '../../errors'
import { getMaestroUrl } from '../../lib/urls'
import type {
  Brc20Balance,
  Brc20Capability,
  Brc20Info,
  CapabilityGroup,
  DataSourceContext,
  PaginatedResult,
  PaginationParams,
} from '../../types'
import { BaseNetwork } from '../../types/network'
import type { MaestroConfig } from './config'

function resolveUrlAndKey(
  network: string,
  config: MaestroConfig
): { apiUrl: string; apiKey: string } {
  if (config.networks?.[network]) {
    return { apiUrl: config.networks[network].apiUrl, apiKey: config.networks[network].apiKey }
  }
  return {
    apiUrl: getMaestroUrl(network),
    apiKey:
      network === BaseNetwork.TESTNET4 ? config.testnetApiKey || config.apiKey : config.apiKey,
  }
}

async function maestroGet(apiUrl: string, apiKey: string, endpoint: string) {
  const response = await fetch(`${apiUrl}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
  })
  if (!response.ok) {
    throw new DataSourceError(`Maestro API error: HTTP ${response.status}`, 'maestro')
  }
  return response.json()
}

export function brc20Capabilities(
  vendorConfig: MaestroConfig
): (ctx: DataSourceContext) => CapabilityGroup<Brc20Capability> {
  return (ctx: DataSourceContext) => {
    const { apiUrl, apiKey } = resolveUrlAndKey(ctx.network, vendorConfig)

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

    return { group: 'brc20', methods }
  }
}
