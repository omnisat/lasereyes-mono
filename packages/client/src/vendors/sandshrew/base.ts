import { getAddressScriptPubKey } from '../../lib/btc'
import { bytesToHex } from '../../lib/bytes'
import { getSandshrewUrl, SANDSHREW_LASEREYES_KEY } from '../../lib/urls'
import type {
  BaseCapability,
  CapabilityGroup,
  DataSourceContext,
  FeeEstimate,
  Transaction,
  UTXO,
} from '../../types'
import { BaseNetwork } from '../../types/network'
import type { SandshrewConfig } from './config'
import { SandshrewRpcClient } from './rpc'

function resolveUrl(network: string, config?: SandshrewConfig): { url: string; key: string } {
  if (config?.networks?.[network]) {
    return {
      url: config.networks[network].apiUrl,
      key: config.networks[network].apiKey,
    }
  }
  const isTestnet =
    network === BaseNetwork.TESTNET ||
    network === BaseNetwork.TESTNET4 ||
    network === BaseNetwork.SIGNET ||
    network === BaseNetwork.FRACTAL_TESTNET
  const fallbackNet = isTestnet ? BaseNetwork.SIGNET : BaseNetwork.MAINNET
  if (config?.networks?.[fallbackNet]) {
    return {
      url: config.networks[fallbackNet].apiUrl,
      key: config.networks[fallbackNet].apiKey,
    }
  }
  return {
    url: getSandshrewUrl(network),
    key: config?.apiKey || SANDSHREW_LASEREYES_KEY,
  }
}

export function baseCapabilities(
  vendorConfig?: SandshrewConfig
): (ctx: DataSourceContext) => CapabilityGroup<BaseCapability> {
  return (ctx: DataSourceContext) => {
    const { url, key } = resolveUrl(ctx.network, vendorConfig)
    const rpc = new SandshrewRpcClient(`${url}/${key}`)

    const methods: BaseCapability = {
      async getBalance(address: string): Promise<string> {
        const response = await rpc.call('esplora_address', [address])
        const result = response.result as {
          chain_stats: { funded_txo_sum: string; spent_txo_sum: string }
        }
        return (
          BigInt(result.chain_stats.funded_txo_sum) - BigInt(result.chain_stats.spent_txo_sum)
        ).toString()
      },

      async getUtxos(address: string): Promise<UTXO[]> {
        const response = await rpc.call('esplora_address::utxo', [address])
        const scriptPk = getAddressScriptPubKey(address, ctx.network)
        return (response.result as UTXO[]).map(utxo => ({
          ...utxo,
          scriptPk: bytesToHex(scriptPk),
        })) as UTXO[]
      },

      async getTransaction(txId: string): Promise<Transaction> {
        const response = await rpc.call('esplora_tx', [txId])
        return response.result as Transaction
      },

      async broadcastTransaction(rawTx: string): Promise<string> {
        const response = await rpc.call('broadcast_tx', [rawTx])
        return response as unknown as string
      },

      async getRecommendedFees(): Promise<FeeEstimate> {
        const response = await rpc.call('esplora_fee-estimates', [])
        const feeEstimates = response.result as Record<string, number>
        const fastFee = feeEstimates['1'] || 0
        const minFee = Math.min(...Object.values(feeEstimates))
        return { fastFee: Math.round(fastFee), minFee: Math.round(minFee) }
      },

      async getOutputValue(txId: string, vout: number): Promise<number | null> {
        const response = await rpc.call('esplora_tx', [txId])
        const result = response.result as {
          vout: { value: number }[]
        }
        return result.vout[vout]?.value ?? null
      },

      async waitForTransaction(txId: string): Promise<boolean> {
        const timeout = 60000
        const startTime = Date.now()
        while (true) {
          try {
            const tx = await methods.getTransaction(txId)
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

    return { group: 'base', methods }
  }
}
