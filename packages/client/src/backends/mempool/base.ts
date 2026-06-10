import type { NetworkId } from '../../chains'
import { ChainBackendError } from '../../errors'
import { bytesToHex } from '../../lib/bytes'
import { getAddressScriptPubKey } from '../../lib/get-address-script-pub-key'
import type {
  BaseCapability,
  ChainBackendContext,
  FeeEstimate,
  PaginatedResult,
  PaginationParams,
  Transaction,
  UTXO,
} from '../../types'
import type { MempoolConfig } from './config'

const MEMPOOL_SPACE_URL = 'https://mempool.space'
const MEMPOOL_SPACE_URL_TESTNET = 'https://mempool.space/testnet'
const MEMPOOL_SPACE_URL_TESTNET4 = 'https://mempool.space/testnet4'
const MEMPOOL_SPACE_URL_SIGNET = 'https://mempool.space/signet'
const MEMPOOL_SPACE_URL_FRACTAL_MAINNET = 'https://mempool.fractalbitcoin.io'
const MEMPOOL_SPACE_URL_FRACTAL_TESTNET = 'https://mempool-testnet.fractalbitcoin.io'

const getMempoolSpaceUrl = (network: NetworkId) => {
  switch (network) {
    case 'testnet':
      return MEMPOOL_SPACE_URL_TESTNET
    case 'testnet4':
      return MEMPOOL_SPACE_URL_TESTNET4
    case 'signet':
      return MEMPOOL_SPACE_URL_SIGNET
    case 'fractal-mainnet':
      return MEMPOOL_SPACE_URL_FRACTAL_MAINNET
    case 'fractal-testnet':
      return MEMPOOL_SPACE_URL_FRACTAL_TESTNET
    default:
      return MEMPOOL_SPACE_URL
  }
}

export function baseCapabilities(
  vendorConfig?: MempoolConfig
): (ctx: ChainBackendContext) => BaseCapability {
  return (ctx: ChainBackendContext) => {
    const networkUrls: Record<string, string> = {
      mainnet: getMempoolSpaceUrl('mainnet'),
      testnet: getMempoolSpaceUrl('testnet'),
      testnet4: getMempoolSpaceUrl('testnet4'),
      signet: getMempoolSpaceUrl('signet'),
      'fractal-mainnet': getMempoolSpaceUrl('fractal-mainnet'),
      'fractal-testnet': getMempoolSpaceUrl('fractal-testnet'),
    }

    if (vendorConfig?.networks) {
      for (const [net, conf] of Object.entries(vendorConfig.networks)) {
        networkUrls[net] = conf.apiUrl
      }
    }

    const apiUrl = networkUrls[ctx.network.id] || getMempoolSpaceUrl(ctx.network.id)

    async function call(method: 'get' | 'post', endpoint: string, body?: unknown) {
      const url = `${apiUrl}${endpoint}`
      // Only POSTs carry a body and need a Content-Type. Setting one on a
      // body-less GET makes the request non-simple and triggers a CORS
      // preflight that mempool.space doesn't answer — so omit it for GETs.
      const headers: Record<string, string> =
        method === 'post' ? { 'Content-Type': 'text/plain' } : {}

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
        throw new ChainBackendError(
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
        const scriptPk = getAddressScriptPubKey(address, ctx.network.type)
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

    return methods
  }
}
