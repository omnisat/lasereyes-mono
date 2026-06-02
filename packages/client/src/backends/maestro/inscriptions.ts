/**
 * Maestro {@link InscriptionCapability} implementation.
 *
 * @module backends/maestro/inscriptions
 */

import type { InscriptionCapability } from '../../backends/capabilities'
import type {
  ChainBackendContext,
  Inscription,
  InscriptionInfo,
  PaginatedResult,
  PaginationParams,
} from '../../types'
import type { MaestroConfig } from './config'
import { maestroGet, resolveUrlAndKey } from './shared'

export function inscriptionCapabilities(
  vendorConfig: MaestroConfig
): (ctx: ChainBackendContext) => InscriptionCapability {
  return (ctx: ChainBackendContext) => {
    const { apiUrl, apiKey } = resolveUrlAndKey(ctx.network.id, vendorConfig)

    const methods: InscriptionCapability = {
      async inscriptionsGetByAddress(
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

      async inscriptionsGetInfo(inscriptionId: string): Promise<InscriptionInfo> {
        const resp = await maestroGet(apiUrl, apiKey, `/assets/inscriptions/${inscriptionId}`)
        return resp as InscriptionInfo
      },

      async inscriptionsBatchGetInfo(inscriptionIds: string[]): Promise<InscriptionInfo[]> {
        const results: InscriptionInfo[] = []
        for (const id of inscriptionIds) {
          results.push(await methods.inscriptionsGetInfo(id))
        }
        return results
      },
    }

    return methods
  }
}
