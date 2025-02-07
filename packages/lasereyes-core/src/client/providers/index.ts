import { MapStore, WritableAtom } from 'nanostores'
import { LaserEyesStoreType } from '../types'
import { BTCSendArgs, Config, ContentType, NetworkType, Protocol, ProviderType, RuneSendArgs } from '../../types'
import { LaserEyesClient } from '..'
import { inscribeContent } from '../../lib/inscribe'
import { broadcastTx, getBTCBalance } from '../../lib/helpers'
import * as bitcoin from 'bitcoinjs-lib'
import {
  FRACTAL_TESTNET,
  MAINNET,
  SIGNET,
  TESTNET,
  TESTNET4,
} from '../../constants'
import { BTC, RUNES } from '../../constants/protocols'
import { sendRune } from '../../lib/runes/psbt'
import { getAddressRunesBalances } from '../../lib/sandshrew'

export const UNSUPPORTED_PROVIDER_METHOD_ERROR = new Error(
  "The connected wallet doesn't support this method..."
)
export const WALLET_NOT_INSTALLED_ERROR = new Error('Wallet is not installed')
export abstract class WalletProvider {
  readonly $store: MapStore<LaserEyesStoreType>
  readonly $network: WritableAtom<NetworkType>

  constructor(
    stores: {
      readonly $store: MapStore<LaserEyesStoreType>
      readonly $network: WritableAtom<NetworkType>
    },
    readonly parent: LaserEyesClient,
    readonly config?: Config
  ) {
    this.$store = stores.$store
    this.$network = stores.$network

    this.initialize()
  }

  disconnect(): void { }

  abstract initialize(): void

  abstract dispose(): void

  abstract connect(defaultWallet: ProviderType): Promise<void>

  async requestAccounts(): Promise<string[]> {
    return [this.$store.get().address, this.$store.get().paymentAddress]
  }

  async switchNetwork(_network: NetworkType): Promise<void> {
    this.parent.disconnect()
    throw UNSUPPORTED_PROVIDER_METHOD_ERROR
  }

  async getNetwork(): Promise<NetworkType | undefined> {
    const { address } = this.$store.get()
    if (
      address.slice(0, 1) === 't' &&
      [TESTNET, TESTNET4, SIGNET, FRACTAL_TESTNET].includes(this.$network.get())
    ) {
      return this.$network.get()
    }

    return MAINNET
  }

  async getPublicKey(): Promise<string | undefined> {
    return this.$store.get().publicKey
  }

  async getBalance(): Promise<string | number | bigint> {
    const { paymentAddress } = this.$store.get()
    return await getBTCBalance(paymentAddress, this.$network.get())
  }

  async getMetaBalances(protocol: Protocol): Promise<any> {
    switch (protocol) {
      case BTC:
        return await this.getBalance()
      case RUNES:
        const network = this.$network.get()
        if (network !== MAINNET) {
          throw new Error('Unsupported network')
        }

        return await getAddressRunesBalances(this.$store.get().address)
      default:
        throw new Error('Unsupported protocol')
    }
  }

  async getInscriptions(offset?: number, limit?: number): Promise<any[]> {
    console.log('getInscriptions not implemented', offset, limit)
    throw UNSUPPORTED_PROVIDER_METHOD_ERROR
  }

  abstract sendBTC(to: string, amount: number): Promise<string>

  abstract signMessage(message: string, toSignAddress?: string): Promise<string>

  abstract signPsbt(
    tx: string,
    psbtHex: string,
    psbtBase64: string,
    finalize?: boolean,
    broadcast?: boolean
  ): Promise<
    | {
      signedPsbtHex: string | undefined
      signedPsbtBase64: string | undefined
      txId?: string
    }
    | undefined
  >

  async pushPsbt(_tx: string): Promise<string | undefined> {
    let payload = _tx
    if (!payload.startsWith('02')) {
      const psbtObj = bitcoin.Psbt.fromHex(payload)
      payload = psbtObj.extractTransaction().toHex()
    }

    return await broadcastTx(payload, this.$network.get())
  }

  async inscribe(
    contentBase64: string,
    mimeType: ContentType
  ): Promise<string | string[]> {
    return await inscribeContent({
      contentBase64,
      mimeType,
      ordinalAddress: this.$store.get().address,
      paymentAddress: this.$store.get().paymentAddress,
      paymentPublicKey: this.$store.get().paymentPublicKey,
      signPsbt: this.signPsbt.bind(this),
      network: this.$network.get(),
    })
  }

  async send(protocol: Protocol, sendArgs: BTCSendArgs | RuneSendArgs) {
    switch (protocol) {
      case BTC:
        return await this.sendBTC(sendArgs.toAddress, sendArgs.amount)
      case RUNES:
        const network = this.$network.get()
        if (network !== MAINNET) {
          throw new Error('Unsupported network')
        }

        const runeArgs = sendArgs as RuneSendArgs;
        if (!runeArgs.runeId || !runeArgs.amount || !runeArgs.toAddress) {
          throw new Error('Missing required parameters')
        }

        return await sendRune({
          runeId: runeArgs.runeId,
          amount: runeArgs.amount,
          ordinalAddress: this.$store.get().address,
          ordinalPublicKey: this.$store.get().publicKey,
          paymentAddress: this.$store.get().paymentAddress,
          paymentPublicKey: this.$store.get().paymentPublicKey,
          toAddress: runeArgs.toAddress,
          signPsbt: this.signPsbt.bind(this),
          network
        })
      default:
        throw new Error('Unsupported protocol')
    }
  }
}
