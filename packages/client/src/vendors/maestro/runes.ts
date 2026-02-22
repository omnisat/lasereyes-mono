import { DataSourceError } from '../../errors'
import { getMaestroUrl } from '../../lib/urls'
import type { CapabilityGroup, DataSourceContext, RuneCapability, RuneInfo } from '../../types'
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
): (
  ctx: DataSourceContext
) => CapabilityGroup<Pick<RuneCapability, 'runesGetById' | 'runesGetByName'>> {
  return (ctx: DataSourceContext) => {
    const { apiUrl, apiKey } = resolveUrlAndKey(ctx.network, vendorConfig)

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

    return { group: 'runes', methods }
  }
}
