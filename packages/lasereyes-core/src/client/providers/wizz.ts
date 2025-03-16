import { WALLET_NOT_INSTALLED_ERROR, WalletProvider } from '.'
import {
  NetworkType,
  WizzBalanceResponse,
  FRACTAL_TESTNET,
  FRACTAL_MAINNET,
  WIZZ,
  SignMessageOptions,
  BIP322,
  BIP322_SIMPLE,
  LaserEyesClient,
  Config,
  LaserEyesStoreType,
} from '../..'
import * as bitcoin from 'bitcoinjs-lib'
import { listenKeys, MapStore, WritableAtom } from 'nanostores'
import { getNetworkForWizz } from '../../constants/networks'
import { WizzNetwork } from '../../types/network'
import { normalizeInscription } from '../../lib/data-sources/normalizations'
import { UnisatInscription } from './unisat'

export class WizzProvider extends WalletProvider {
  constructor(stores: {
    $store: MapStore<LaserEyesStoreType>
    $network: WritableAtom<NetworkType>
  },
    parent: LaserEyesClient,
    config?: Config
  ) {
    super(stores, parent, config)
  }

  public get library(): any | undefined {
    return (window as any).wizz
  }

  public get network(): string {
    return this.$network.get()
  }

  observer?: MutationObserver

  private handleNetworkChanged(_network: NetworkType) {
    this.parent.connect(WIZZ)
  }

  private handleAccountsChanged(accounts: string[]) {
    if (!accounts.length) {
      this.parent.disconnect()
      return
    }

    if (this.$store.get().accounts[0] === accounts[0]) {
      return
    }

    this.$store.setKey('accounts', accounts)
  }

  initialize(): void {
    listenKeys(this.$store, ['provider'], (value) => {
      if (value.provider === WIZZ) {
        this.addLibraryListeners()
      } else {
        this.removeLibraryListeners()
      }
    })

    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      this.observer = new window.MutationObserver(() => {
        if (this.library) {
          this.$store.setKey('hasProvider', {
            ...this.$store.get().hasProvider,
            [WIZZ]: true,
          })
          this.observer?.disconnect()
        }
      })
      this.observer.observe(document, { childList: true, subtree: true })
    }
  }
  private removeLibraryListeners() {
    this.library?.removeListener(
      'networkChanged',
      this.handleNetworkChanged.bind(this)
    )
    this.library?.removeListener(
      'accountsChanged',
      this.handleAccountsChanged.bind(this)
    )
  }

  private addLibraryListeners() {
    this.library?.on('networkChanged', this.handleNetworkChanged.bind(this))
    this.library?.on('accountsChanged', this.handleAccountsChanged.bind(this))
  }

  dispose(): void {
    this.observer?.disconnect()
    this.removeLibraryListeners()
  }
  async connect(): Promise<void> {
    if (!this.library) throw WALLET_NOT_INSTALLED_ERROR
    const wizzAccounts = await this.library.requestAccounts()
    if (!wizzAccounts) throw new Error('No accounts found')
    const wizzPubKey = await this.library.getPublicKey()
    if (!wizzPubKey) throw new Error('No public key found')
    this.$store.setKey('accounts', wizzAccounts)
    this.$store.setKey('address', wizzAccounts[0])
    this.$store.setKey('paymentAddress', wizzAccounts[0])
    this.$store.setKey('publicKey', wizzPubKey)
    this.$store.setKey('paymentPublicKey', wizzPubKey)
    this.$store.setKey('provider', WIZZ)
    await this.getNetwork().then((network) => {
      if (network && this.config?.network !== network) {
        this.parent.switchNetwork(network)
      }
    })
    this.$store.setKey('connected', true)
  }

  async requestAccounts(): Promise<string[]> {
    return await this.library.requestAccounts()
  }

  async getNetwork(): Promise<NetworkType | undefined> {
    const wizzNetwork = await this.library?.getNetwork()
    return wizzNetwork ? getNetworkForWizz(wizzNetwork) : undefined
  }

  async switchNetwork(_network: NetworkType): Promise<void> {
    if (_network === FRACTAL_TESTNET || _network === FRACTAL_MAINNET) {
      return await this.library.switchNetwork(WizzNetwork.MAINNET)
    }

    const wantedNetwork = getNetworkForWizz(_network)
    await this.library?.switchNetwork(wantedNetwork)
    this.$network.set(_network)
    await this.parent.getBalance()
  }
  async getPublicKey(): Promise<string | undefined> {
    return await this.library?.getPublicKey()
  }

  async getBalance(): Promise<string | number | bigint> {
    const balanceResponse: WizzBalanceResponse = await this.library.getBalance()
    return balanceResponse.total
  }

  async getInscriptions(offset?: number, limit?: number): Promise<any[]> {
    const offsetValue = offset || 0
    const limitValue = limit || 10
    const response = await this.library.getInscriptions(offsetValue, limitValue)
    const inscriptions = response.list.map((insc: UnisatInscription) => {
      return normalizeInscription(insc, undefined, this.network as NetworkType)
    })

    return inscriptions
  }

  async sendBTC(to: string, amount: number): Promise<string> {
    const txId = await this.library?.sendBitcoin(to, amount)
    if (txId) {
      return txId
    } else {
      throw new Error('Error sending BTC')
    }
  }

  async signMessage(
    message: string,
    options?: SignMessageOptions
  ): Promise<string> {
    const protocol =
      options?.protocol === BIP322 ? BIP322_SIMPLE : options?.protocol
    return await this.library?.signMessage(message, protocol)
  }

  async signPsbt(
    _: string,
    psbtHex: string,
    __: string,
    finalize?: boolean | undefined,
    broadcast?: boolean | undefined
  ): Promise<
    | {
      signedPsbtHex: string | undefined
      signedPsbtBase64: string | undefined
      txId?: string | undefined
    }
    | undefined
  > {
    const signedPsbt = await this.library?.signPsbt(psbtHex, {
      autoFinalized: finalize,
      broadcast: false,
    })

    const psbtSignedPsbt = bitcoin.Psbt.fromHex(signedPsbt)

    let txId
    if (finalize && broadcast) {
      txId = await this.pushPsbt(signedPsbt)
    }

    return {
      signedPsbtHex: psbtSignedPsbt.toHex(),
      signedPsbtBase64: psbtSignedPsbt.toBase64(),
      txId: txId,
    }
  }
}
