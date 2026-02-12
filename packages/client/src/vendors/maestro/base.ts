import { DataSourceError } from '../../errors'
import { getMaestroUrl } from '../../lib/urls'
import type {
  BaseCapability,
  CapabilityGroup,
  DataSourceContext,
  FeeEstimate,
  PaginatedResult,
  PaginationParams,
  Transaction,
  UTXO,
} from '../../types'
import { BaseNetwork } from '../../types/network'
import type { MaestroConfig } from './config'

function resolveUrlAndKey(
  network: string,
  config: MaestroConfig
): { apiUrl: string; apiKey: string } {
  if (config.networks?.[network]) {
    return {
      apiUrl: config.networks[network].apiUrl,
      apiKey: config.networks[network].apiKey,
    }
  }
  return {
    apiUrl: getMaestroUrl(network),
    apiKey:
      network === BaseNetwork.TESTNET4 ? config.testnetApiKey || config.apiKey : config.apiKey,
  }
}

async function maestroCall(
  apiUrl: string,
  apiKey: string,
  method: 'get' | 'post',
  endpoint: string,
  body?: unknown
) {
  const url = `${apiUrl}${endpoint}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'api-key': apiKey,
  }

  try {
    const response = await fetch(url, {
      method: method.toUpperCase(),
      headers,
      body: method === 'post' ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    throw new DataSourceError(
      `Maestro API error: ${error instanceof Error ? error.message : String(error)}`,
      'maestro',
      error instanceof Error ? error : undefined
    )
  }
}

export function baseCapabilities(
  vendorConfig: MaestroConfig
): (ctx: DataSourceContext) => CapabilityGroup<BaseCapability> {
  return (ctx: DataSourceContext) => {
    const { apiUrl, apiKey } = resolveUrlAndKey(ctx.network, vendorConfig)

    const methods: BaseCapability = {
      async getBalance(address: string): Promise<string> {
        const resp = await maestroCall(apiUrl, apiKey, 'get', `/addresses/${address}/balance`)
        return (resp as { data: string }).data
      },

      async getUtxos(
        _address: string,
        _pagination?: PaginationParams
      ): Promise<PaginatedResult<UTXO>> {
        // Maestro doesn't natively expose a mempool-compatible UTXO endpoint
        // This is a partial implementation; callers should prefer mempool for UTXOs
        throw new DataSourceError('getUtxos is not supported by Maestro data source', 'maestro')
      },

      async getTransaction(txId: string): Promise<Transaction> {
        const resp = await maestroCall(apiUrl, apiKey, 'get', `/rpc/transaction/${txId}`)
        return (resp as { data: Transaction }).data
      },

      async broadcastTransaction(rawTx: string): Promise<string> {
        return (await maestroCall(
          apiUrl,
          apiKey,
          'post',
          '/arpc/transaction/submit',
          rawTx
        )) as string
      },

      async getRecommendedFees(): Promise<FeeEstimate> {
        const resp = await maestroCall(apiUrl, apiKey, 'get', '/mempool/fee_rates')
        const data = resp as { data: Array<{ sats_per_vb: { min: number; median: number } }> }
        const fee = data.data[0].sats_per_vb
        return { fastFee: fee.median, minFee: fee.min }
      },

      async getOutputValue(_txId: string, _vout: number): Promise<number | null> {
        throw new DataSourceError(
          'getOutputValue is not supported by Maestro data source',
          'maestro'
        )
      },

      async waitForTransaction(_txId: string): Promise<boolean> {
        throw new DataSourceError(
          'waitForTransaction is not supported by Maestro data source',
          'maestro'
        )
      },
    }

    return { group: 'base', methods }
  }
}
