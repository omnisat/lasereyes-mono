import { DataSourceError } from '../../errors'
import { getMaestroUrl } from '../../lib/urls'
import type {
  CapabilityGroup,
  DataSourceContext,
  Inscription,
  InscriptionCapability,
  InscriptionInfo,
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
        offset = 0,
        limit = 10
      ): Promise<Inscription[]> {
        let cursor: string | undefined
        let toSkip = offset
        const batchSize = 100

        while (toSkip > 0) {
          const count = Math.min(batchSize, toSkip)
          const params = new URLSearchParams({ count: count.toString() })
          if (cursor) params.append('cursor', cursor)

          const resp = await maestroGet(
            apiUrl,
            apiKey,
            `/addresses/${address}/inscriptions?${params.toString()}`
          )
          const data = resp as { next_cursor?: string; data: unknown[] }
          if (!data.next_cursor && toSkip > count) return []
          cursor = data.next_cursor
          toSkip -= count
        }

        const params = new URLSearchParams({ count: limit.toString() })
        if (cursor) params.append('cursor', cursor)

        const resp = await maestroGet(
          apiUrl,
          apiKey,
          `/addresses/${address}/inscriptions?${params.toString()}`
        )
        const data = resp as {
          data: Array<{
            inscription_id: string
            satoshis: string
            utxo_block_height: number
          }>
        }

        return data.data.map(insc => ({
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
        }))
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
