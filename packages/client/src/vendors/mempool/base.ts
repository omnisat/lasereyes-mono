import {
  FRACTAL_MAINNET,
  FRACTAL_TESTNET,
  MAINNET,
  SIGNET,
  TESTNET,
  TESTNET4,
} from '../../constants/networks'
import { DataSourceError } from '../../errors'
import { getAddressScriptPubKey } from '../../lib/btc'
import { bytesToHex } from '../../lib/bytes'
import { getMempoolSpaceUrl } from '../../lib/urls'
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
import type { MempoolConfig } from './config'

export function baseCapabilities(
  vendorConfig?: MempoolConfig
): (ctx: DataSourceContext) => CapabilityGroup<BaseCapability> {
  return (ctx: DataSourceContext) => {
    const networkUrls: Record<string, string> = {
      [MAINNET]: getMempoolSpaceUrl('mainnet'),
      [TESTNET]: getMempoolSpaceUrl('testnet'),
      [TESTNET4]: getMempoolSpaceUrl('testnet4'),
      [SIGNET]: getMempoolSpaceUrl('signet'),
      [FRACTAL_MAINNET]: getMempoolSpaceUrl('fractal_mainnet'),
      [FRACTAL_TESTNET]: getMempoolSpaceUrl('fractal_testnet'),
    }

    if (vendorConfig?.networks) {
      for (const [net, conf] of Object.entries(vendorConfig.networks)) {
        networkUrls[net] = conf.apiUrl
      }
    }

    const apiUrl = networkUrls[ctx.network] || getMempoolSpaceUrl(ctx.network)

    async function call(method: 'get' | 'post', endpoint: string, body?: unknown) {
      const url = `${apiUrl}${endpoint}`
      const headers: Record<string, string> = {
        'Content-Type': method === 'post' ? 'text/plain' : 'application/json',
      }

      try {
        const response = await fetch(url, {
          method: method.toUpperCase(),
          headers,
          body: method === 'post' ? (body as string) : undefined,
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const contentType = response.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
          return await response.json()
        }
        return await response.text()
      } catch (error) {
        throw new DataSourceError(
          `Mempool API error: ${error instanceof Error ? error.message : String(error)}`,
          'mempool',
          error instanceof Error ? error : undefined
        )
      }
    }

    const methods: BaseCapability = {
      async btcGetBalance(address: string): Promise<string> {
        const { data: utxos } = await methods.btcGetAddressUtxos(address)
        return utxos.reduce((acc, utxo) => acc + BigInt(utxo.value), 0n).toString()
      },

      async btcGetAddressUtxos(
        address: string,
        _pagination?: PaginationParams
      ): Promise<PaginatedResult<UTXO>> {
        if (address.startsWith('bcrt')) {
          return { data: [] }
        }
        const raw = await call('get', `/api/address/${address}/utxo`)
        const scriptPk = getAddressScriptPubKey(address, ctx.network)
        const mapped = (raw as UTXO[]).map(utxo => ({
          ...utxo,
          scriptPk: bytesToHex(scriptPk),
        })) as UTXO[]
        return { data: mapped }
      },

      async btcGetTransaction(txId: string): Promise<Transaction> {
        return (await call('get', `/api/tx/${txId}`)) as Transaction
      },

      async btcBroadcastTransaction(rawTx: string): Promise<string> {
        return (await call('post', '/api/tx', rawTx)) as string
      },

      async btcGetRecommendedFees(): Promise<FeeEstimate> {
        const response = await call('get', '/api/v1/fees/recommended')
        return {
          fastFee: (response as { fastestFee: number }).fastestFee,
          minFee: (response as { minimumFee: number }).minimumFee,
        }
      },

      async btcGetOutputValue(txId: string, vout: number): Promise<number | null> {
        const timeout = 60000
        const startTime = Date.now()
        while (true) {
          try {
            const tx = await methods.btcGetTransaction(txId)
            if (tx?.vout && tx.vout.length > 0) {
              return Math.floor(tx.vout[vout].value)
            }
            if (Date.now() - startTime > timeout) return null
            await new Promise(resolve => setTimeout(resolve, 5000))
          } catch {
            if (Date.now() - startTime > timeout) return null
            await new Promise(resolve => setTimeout(resolve, 5000))
          }
        }
      },

      async btcWaitForTransaction(txId: string): Promise<boolean> {
        const timeout = 60000
        const startTime = Date.now()
        while (true) {
          try {
            const tx = await methods.btcGetTransaction(txId)
            if (tx) return true
            if (Date.now() - startTime > timeout) return false
            await new Promise(resolve => setTimeout(resolve, 5000))
          } catch {
            if (Date.now() - startTime > timeout) return false
            await new Promise(resolve => setTimeout(resolve, 5000))
          }
        }
      },
    }

    return {
      group: 'btc',
      methods,
    }
  }
}
