/**
 * Sandshrew {@link AlkaneCapability} implementation.
 *
 * @module backends/sandshrew/alkanes
 */

import type { AlkaneCapability } from '../../backends/capabilities'
import { ChainBackendError } from '../../errors'
import { bytesToHex, hexToBytes } from '../../lib/bytes'
import type {
  AlkaneBalance,
  AlkaneOutpoint,
  ChainBackendContext,
  PaginatedResult,
  PaginationParams,
} from '../../types'
import type { SandshrewConfig } from './config'
import { resolveUrl } from './shared'

function runeIdToString({ block, tx }: { block: string; tx: string }) {
  return `${block}:${tx}`
}

async function alkaneRpcCall(baseUrl: string, method: string, params: unknown[]) {
  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method,
        params,
        id: 1,
      }),
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    const data = await response.json()
    if ((data as { error?: { message: string } }).error) {
      throw new Error((data as { error: { message: string } }).error.message)
    }
    return (data as { result: unknown }).result
  } catch (error) {
    throw new ChainBackendError(
      `Alkane RPC error: ${error instanceof Error ? error.message : String(error)}`,
      'sandshrew',
      error instanceof Error ? error : undefined
    )
  }
}

export function alkaneCapabilities(
  vendorConfig?: SandshrewConfig
): (ctx: ChainBackendContext) => AlkaneCapability {
  return (ctx: ChainBackendContext) => {
    const { url, key } = resolveUrl(ctx.network.id, vendorConfig)
    const rpcUrl = `${url}/${key}`

    const methods: AlkaneCapability = {
      async alkanesGetByAddress(
        address: string,
        _pagination?: PaginationParams
      ): Promise<PaginatedResult<AlkaneOutpoint>> {
        const result = await alkaneRpcCall(rpcUrl, 'alkanes_protorunesbyaddress', [
          { address, protocolTag: '1' },
        ])
        const response = result as {
          outpoints: Array<{
            runes: Array<{
              balance: string
              rune: {
                id: { block: string; tx: string }
                name: string
                spacedName: string
                divisibility: number
                spacers: number
                symbol: string
              }
            }>
            outpoint: { txid: string; vout: number }
            output: { value: string; script: string }
            txindex: number
            height: number
          }>
        }

        return {
          data: response.outpoints
            .filter(outpoint => outpoint.runes.length > 0)
            .map(outpoint => ({
              ...outpoint,
              outpoint: {
                vout: outpoint.outpoint.vout,
                txid: bytesToHex(hexToBytes(outpoint.outpoint.txid)),
              },
              runes: outpoint.runes.map(rune => ({
                ...rune,
                balance: Number.parseInt(rune.balance, 16).toString(),
                rune: {
                  ...rune.rune,
                  id: {
                    block: Number.parseInt(rune.rune.id.block, 16).toString(),
                    tx: Number.parseInt(rune.rune.id.tx, 16).toString(),
                  },
                },
              })),
            })),
        }
      },

      async alkanesGetAddressBalances(
        address: string,
        _pagination?: PaginationParams
      ): Promise<PaginatedResult<AlkaneBalance>> {
        const { data: outpoints } = await methods.alkanesGetByAddress(address)
        const balances: Record<string, AlkaneBalance> = {}
        for (const outpoint of outpoints) {
          for (const rune of outpoint.runes) {
            const runeId = runeIdToString(rune.rune.id)
            if (!balances[runeId]) {
              balances[runeId] = {
                id: runeId,
                balance: BigInt(rune.balance),
                name: rune.rune.name,
                symbol: rune.rune.symbol,
              }
            } else {
              balances[runeId].balance += BigInt(rune.balance)
            }
          }
        }
        return { data: Object.values(balances) }
      },
    }

    return methods
  }
}
