import { DataSourceError } from '../../errors'
import { bytesToHex, hexToBytes, reverseBytes } from '../../lib/bytes'
import { getSandshrewUrl, SANDSHREW_LASEREYES_KEY } from '../../lib/urls'
import type {
  AlkaneBalance,
  AlkaneCapability,
  AlkaneOutpoint,
  CapabilityGroup,
  DataSourceContext,
  PaginatedResult,
  PaginationParams,
} from '../../types'
import { BaseNetwork } from '../../types/network'
import type { SandshrewConfig } from './config'

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
    throw new DataSourceError(
      `Alkane RPC error: ${error instanceof Error ? error.message : String(error)}`,
      'sandshrew',
      error instanceof Error ? error : undefined
    )
  }
}

export function alkaneCapabilities(
  vendorConfig?: SandshrewConfig
): (ctx: DataSourceContext) => CapabilityGroup<AlkaneCapability> {
  return (ctx: DataSourceContext) => {
    const { url, key } = resolveUrl(ctx.network, vendorConfig)
    const rpcUrl = `${url}/${key}`

    const methods: AlkaneCapability = {
      async getAlkanesByAddress(
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
                txid: bytesToHex(reverseBytes(hexToBytes(outpoint.outpoint.txid))),
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

      async getAddressAlkanesBalances(
        address: string,
        _pagination?: PaginationParams
      ): Promise<PaginatedResult<AlkaneBalance>> {
        const { data: outpoints } = await methods.getAlkanesByAddress(address)
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

    return { group: 'alkane', methods }
  }
}
