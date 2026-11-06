/**
 * Sandshrew {@link InscriptionCapability} implementation.
 *
 * @module backends/sandshrew/inscriptions
 */

import type { InscriptionCapability } from '../../backends/capabilities'
import type {
  ChainBackendContext,
  Inscription,
  InscriptionInfo,
  PaginatedResult,
  PaginationParams,
} from '../../types'
import type { SandshrewConfig } from './config'
import { SandshrewRpcClient } from './rpc'
import { resolveUrl } from './shared'

export function inscriptionCapabilities(
  vendorConfig?: SandshrewConfig
): (ctx: ChainBackendContext) => InscriptionCapability {
  return (ctx: ChainBackendContext) => {
    const { url, key } = resolveUrl(ctx.network.id, vendorConfig)
    const rpc = new SandshrewRpcClient(`${url}/${key}`)

    const methods: InscriptionCapability = {
      async inscriptionsGetByAddress(
        address: string,
        _pagination?: PaginationParams
      ): Promise<PaginatedResult<Inscription>> {
        const ordResp = await rpc.call('ord_address', [address])
        const result = ordResp.result as { inscriptions: string[] }
        const inscriptionIds = result.inscriptions || []

        if (inscriptionIds.length === 0) return { data: [] }

        const infos = await methods.inscriptionsBatchGetInfo(inscriptionIds)
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

      async inscriptionsGetInfo(inscriptionId: string): Promise<InscriptionInfo> {
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

      async inscriptionsBatchGetInfo(inscriptionIds: string[]): Promise<InscriptionInfo[]> {
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

    return methods
  }
}
