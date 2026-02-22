import { getSandshrewUrl, SANDSHREW_LASEREYES_KEY } from '../../lib/urls'
import type {
  CapabilityGroup,
  DataSourceContext,
  FormattedUTXO,
  OrdAddressInfo,
  OrdCapability,
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

export function ordCapabilities(
  vendorConfig?: SandshrewConfig
): (ctx: DataSourceContext) => CapabilityGroup<OrdCapability> {
  return (ctx: DataSourceContext) => {
    const { url, key } = resolveUrl(ctx.network, vendorConfig)
    const rpc = new SandshrewRpcClient(`${url}/${key}`)

    const methods: OrdCapability = {
      async ordGetAddress(address: string): Promise<OrdAddressInfo> {
        const response = await rpc.call('ord_address', [address])
        return response.result as OrdAddressInfo
      },

      async ordGetFormattedUtxos(
        address: string | string[],
        _pagination?: PaginationParams
      ): Promise<PaginatedResult<FormattedUTXO>> {
        const addresses = Array.isArray(address) ? address : [address]
        const multiCall = addresses.map(addr => ['sandshrew_balances', [{ address: addr }]])
        const results = await rpc.multicall(multiCall)

        const formatted: FormattedUTXO[] = []
        for (let i = 0; i < results.length; i++) {
          const balances = results[i].result as {
            spendable: Array<{ outpoint: string; value: number }>
            assets: Array<{
              outpoint: string
              value: number
              inscriptions?: string[]
              ord_runes?: Record<string, { amount: number; divisibility: number; symbol: string }>
              runes?: Array<{
                rune: { id: { block: string; tx: string }; name: string; symbol: string }
                balance: string
              }>
            }>
          }
          const addr = addresses[i]

          // Map spendable UTXOs
          for (const utxo of balances.spendable) {
            const [txHash, voutStr] = utxo.outpoint.split(':')
            formatted.push({
              txHash,
              txOutputIndex: Number(voutStr),
              btcValue: utxo.value,
              scriptPubKey: '',
              address: addr,
              hasRunes: false,
              runes: [],
              hasAlkanes: false,
              alkanes: [],
              hasInscriptions: false,
              inscriptions: [],
            })
          }

          // Map asset UTXOs
          for (const utxo of balances.assets) {
            const [txHash, voutStr] = utxo.outpoint.split(':')
            const hasInscriptions = (utxo.inscriptions?.length ?? 0) > 0
            const hasRunes = !!(utxo.ord_runes && Object.keys(utxo.ord_runes).length > 0)

            formatted.push({
              txHash,
              txOutputIndex: Number(voutStr),
              btcValue: utxo.value,
              scriptPubKey: '',
              address: addr,
              hasRunes,
              runes: utxo.ord_runes
                ? Object.entries(utxo.ord_runes).map(([, v]) => ({
                    runeId: '',
                    amount: v.amount,
                  }))
                : [],
              hasAlkanes: false,
              alkanes: [],
              hasInscriptions,
              inscriptions: utxo.inscriptions?.map(id => ({ inscriptionId: id })) ?? [],
            })
          }
        }
        return { data: formatted }
      },
    }

    return { group: 'ord', methods }
  }
}
