import { DataSourceError } from '../../errors'
import { getMaestroUrl } from '../../lib/urls'
import type {
  CapabilityGroup,
  DataSourceContext,
  Inscription,
  InscriptionCapability,
  InscriptionInfo,
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

export function inscriptionCapabilities(
  vendorConfig: MaestroConfig
): (ctx: DataSourceContext) => CapabilityGroup<InscriptionCapability> {
  return (ctx: DataSourceContext) => {
    const { apiUrl, apiKey } = resolveUrlAndKey(ctx.network, vendorConfig)

    const methods: InscriptionCapability = {
      async getAddressInscriptions(
        address: string,
        pagination?: PaginationParams
      ): Promise<PaginatedResult<Inscription>> {
        const params = new URLSearchParams()
        if (pagination?.limit) params.set('count', pagination.limit.toString())
        if (pagination?.cursor) params.set('cursor', String(pagination.cursor))

        const qs = params.toString()
        const resp = await maestroGet(
          apiUrl,
          apiKey,
          `/addresses/${address}/inscriptions${qs ? `?${qs}` : ''}`
        )
        const raw = resp as {
          data: Array<{
            inscription_id: string
            satoshis: string
            utxo_block_height: number
          }>
          next_cursor?: string
        }

        return {
          data: raw.data.map(insc => ({
            id: insc.inscription_id,
            inscriptionId: insc.inscription_id,
            content: '',
            number: 0,
            address,
            contentType: '',
            output: '',
            location: '',
            genesisTransaction: '',
            height: insc.utxo_block_height,
            preview: '',
            outputValue: Number(insc.satoshis),
          })),
          nextCursor: raw.next_cursor,
        }
      },

      async getInscriptionInfo(inscriptionId: string): Promise<InscriptionInfo> {
        const resp = await maestroGet(apiUrl, apiKey, `/assets/inscriptions/${inscriptionId}`)
        return resp as InscriptionInfo
      },

      async batchGetInscriptionInfo(inscriptionIds: string[]): Promise<InscriptionInfo[]> {
        const results: InscriptionInfo[] = []
        for (const id of inscriptionIds) {
          results.push(await methods.getInscriptionInfo(id))
        }
        return results
      },
    }

    return { group: 'inscription', methods }
  }
}
