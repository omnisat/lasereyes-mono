import { MapStore, WritableAtom } from 'nanostores'
import { LaserEyesStoreType, WalletProviderSignPsbtOptions } from '../types'
import {
  Brc20SendArgs,
  BTCSendArgs,
  Config,
  ContentType,
  NetworkType,
  Protocol,
  ProviderType,
  RuneSendArgs,
} from '../../types'
import { LaserEyesClient } from '..'
import { inscribeContent } from '../../lib/inscribe'
import { broadcastTx, } from '../../lib/helpers'
import * as bitcoin from 'bitcoinjs-lib'
import {
  FRACTAL_TESTNET,
  MAINNET,
  SIGNET,
  TESTNET,
  TESTNET4,
} from '../../constants'
import { BRC20, BTC, RUNES } from '../../constants/protocols'
import { sendRune } from '../../lib/runes/psbt'
import { DataSourceManager } from '../../lib/data-sources/manager'
import { sendBrc20 } from '../../lib/brc-20/psbt'
import { Inscription } from '../../types/lasereyes'
import { sendInscriptions } from '../../lib/inscriptions/psbt'

export const UNSUPPORTED_PROVIDER_METHOD_ERROR = new Error(
  "The connected wallet doesn't support this method..."
)
export const WALLET_NOT_INSTALLED_ERROR = new Error('Wallet is not installed')
export abstract class WalletProvider {
  readonly $store: MapStore<LaserEyesStoreType>
  readonly $network: WritableAtom<NetworkType>

  protected dataSourceManager: DataSourceManager;

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

    try {
      this.dataSourceManager = DataSourceManager.getInstance()
    } catch {
      DataSourceManager.init(config!)
      this.dataSourceManager = DataSourceManager.getInstance()
    }

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
    if (!this.dataSourceManager.getAddressBtcBalance) {
      throw new Error('Method not found on data source')
    }

    return await this.dataSourceManager.getAddressBtcBalance(this.$store.get().paymentAddress)
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

        if (!this.dataSourceManager.getAddressRunesBalances) {
          throw new Error('Method not found on data source')
        }

        return await this.dataSourceManager.getAddressRunesBalances(this.$store.get().address)
      case BRC20:
        if (!this.dataSourceManager.getAddressBrc20Balances) {
          throw new Error('Method not found on data source')
        }

        return await this.dataSourceManager.getAddressBrc20Balances(this.$store.get().address)
      default:
        throw new Error('Unsupported protocol')
    }
  }

  async getInscriptions(offset?: number, limit?: number): Promise<Inscription[]> {
    if (!this.dataSourceManager.getAddressInscriptions) {
      throw new Error('Method not found on data source')
    }

    return await this.dataSourceManager.getAddressInscriptions(this.$store.get().address, offset, limit)
  }

  abstract sendBTC(to: string, amount: number): Promise<string>

  abstract signMessage(
    message: string,
    options?: { toSignAddress?: string }
  ): Promise<string>

  abstract signPsbt(
    signPsbtOptions: WalletProviderSignPsbtOptions
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
    mimeType: ContentType,
    dataSourceManager?: DataSourceManager
  ): Promise<string | string[]> {
    return await inscribeContent({
      contentBase64,
      mimeType,
      ordinalAddress: this.$store.get().address,
      paymentAddress: this.$store.get().paymentAddress,
      paymentPublicKey: this.$store.get().paymentPublicKey,
      signPsbt: this.signPsbt.bind(this),
      dataSourceManager: dataSourceManager || this.dataSourceManager,
      network: this.$network.get(),
    })
  }

  async send(protocol: Protocol, sendArgs: BTCSendArgs | RuneSendArgs | Brc20SendArgs) {
    switch (protocol) {
      case BTC:
        return await this.sendBTC(sendArgs.toAddress, sendArgs.amount)
      case RUNES:
        if (this.$network.get() !== MAINNET) {
          throw new Error('Unsupported network')
        }

        const runeArgs = sendArgs as RuneSendArgs
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
          network: this.$network.get(),
        })
      case BRC20:
        if (this.$network.get() !== MAINNET) {
          throw new Error('Unsupported network')
        }

        const brcArgs = sendArgs as Brc20SendArgs
        if (!brcArgs.ticker || !brcArgs.amount || !brcArgs.toAddress) {
          throw new Error('Missing required parameters')
        }

        return await sendBrc20({
          ticker: brcArgs.ticker,
          amount: brcArgs.amount,
          ordinalAddress: this.$store.get().address,
          ordinalPublicKey: this.$store.get().publicKey,
          paymentAddress: this.$store.get().paymentAddress,
          paymentPublicKey: this.$store.get().paymentPublicKey,
          signPsbt: this.signPsbt.bind(this),
          toAddress: brcArgs.toAddress,
          dataSourceManager: this.dataSourceManager,
          network: this.$network.get(),
        })
      default:
        throw new Error('Unsupported protocol')
    }
  }

  async sendInscriptions(inscriptionIds: string[], toAddress: string): Promise<string> {
    const inscriptions = await this.getInscriptions()
    const inscriptionsToSend = inscriptions.filter(inscription =>
      inscriptionIds.includes(inscription.id)
    )
    if (inscriptionsToSend.length !== inscriptionIds.length) {
      throw new Error('Missing inscriptions')
    }

    return await sendInscriptions({
      inscriptionIds,
      ordinalAddress: this.$store.get().address,
      ordinalPublicKey: this.$store.get().publicKey,
      paymentAddress: this.$store.get().paymentAddress,
      paymentPublicKey: this.$store.get().paymentPublicKey,
      toAddress,
      signPsbt: this.signPsbt.bind(this),
      dataSourceManager: this.dataSourceManager,
      network: this.$network.get(),
    })
  }
}
