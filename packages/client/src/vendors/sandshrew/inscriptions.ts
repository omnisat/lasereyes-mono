import { getSandshrewUrl, SANDSHREW_LASEREYES_KEY } from '../../lib/urls'
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

export function inscriptionCapabilities(
  vendorConfig?: SandshrewConfig
): (ctx: DataSourceContext) => CapabilityGroup<InscriptionCapability> {
  return (ctx: DataSourceContext) => {
    const { url, key } = resolveUrl(ctx.network, vendorConfig)
    const rpc = new SandshrewRpcClient(`${url}/${key}`)

    const methods: InscriptionCapability = {
      async getAddressInscriptions(
        address: string,
        _pagination?: PaginationParams
      ): Promise<PaginatedResult<Inscription>> {
        const ordResp = await rpc.call('ord_address', [address])
        const result = ordResp.result as { inscriptions: string[] }
        const inscriptionIds = result.inscriptions || []

        if (inscriptionIds.length === 0) return { data: [] }

        const infos = await methods.batchGetInscriptionInfo(inscriptionIds)
        return {
          data: infos.map(info => ({
            id: info.data.inscription_id,
            inscriptionId: info.data.inscription_id,
            content: '',
            number: info.data.inscription_number,
            address,
            contentType: info.data.content_type,
            output: '',
            location: '',
            genesisTransaction: '',
            height: info.last_updated.block_height,
            preview: '',
            outputValue: 0,
          })),
        }
      },

      async getInscriptionInfo(inscriptionId: string): Promise<InscriptionInfo> {
        const response = await rpc.call('ord_inscription', [inscriptionId])
        const raw = response.result as {
          id?: string
          number?: number
          timestamp?: number
          effective_content_type?: string
          content_length?: number
          height?: number
        }
        return {
          data: {
            inscription_id: raw.id || inscriptionId,
            inscription_number: raw.number || 0,
            created_at: raw.timestamp || 0,
            content_type: raw.effective_content_type || '',
            content_body_preview: '',
            content_length: raw.content_length || 0,
            collection_symbol: null,
          },
          last_updated: {
            block_hash: '',
            block_height: raw.height || 0,
          },
        }
      },

      async batchGetInscriptionInfo(inscriptionIds: string[]): Promise<InscriptionInfo[]> {
        const MAX_PER_CALL = 1000
        const results: InscriptionInfo[] = []

        for (let i = 0; i < inscriptionIds.length; i += MAX_PER_CALL) {
          const batch = inscriptionIds.slice(i, i + MAX_PER_CALL)
          const multiCall = batch.map(id => ['ord_inscription', [id]])
          const responses = await rpc.multicall(multiCall)

          for (const resp of responses) {
            const raw = resp.result as {
              id?: string
              number?: number
              timestamp?: number
              effective_content_type?: string
              content_length?: number
              height?: number
            }
            results.push({
              data: {
                inscription_id: raw.id || '',
                inscription_number: raw.number || 0,
                created_at: raw.timestamp || 0,
                content_type: raw.effective_content_type || '',
                content_body_preview: '',
                content_length: raw.content_length || 0,
                collection_symbol: null,
              },
              last_updated: {
                block_hash: '',
                block_height: raw.height || 0,
              },
            })
          }
        }
        return results
      },
    }

    return { group: 'inscription', methods }
  }
}
