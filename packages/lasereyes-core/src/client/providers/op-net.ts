import * as bitcoin from 'bitcoinjs-lib'
import { WalletProvider } from '.'
import { getNetworkForUnisat, getUnisatNetwork } from '../../constants/networks'
import { Config, NetworkType, ProviderType } from '../../types'
import { OP_NET } from '../../constants/wallets'
import { listenKeys, MapStore, WritableAtom } from 'nanostores'
import { LaserEyesStoreType, SignMessageOptions, WalletProviderSignPsbtOptions } from '../types'
import { BIP322, BIP322_SIMPLE } from '../../constants'
import { LaserEyesClient } from '..'
import { omitUndefined } from '../../lib/utils'

export default class OpNetProvider extends WalletProvider {
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
    return (window as any)?.opnet
  }

  public get network(): NetworkType {
    return this.$network.get()
  }
  observer?: MutationObserver

  initialize() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      this.observer = new window.MutationObserver(() => {
        if (this.library) {
          this.$store.setKey('hasProvider', {
            ...this.$store.get().hasProvider,
            [OP_NET]: true,
          })
          this.observer?.disconnect()
        }
      })

      this.observer.observe(document, { childList: true, subtree: true })
    }
    listenKeys(this.$store, ['provider'], (newStore) => {
      if (newStore.provider !== OP_NET) {
        this.removeListeners()
        return
      }
      this.library.getAccounts().then((accounts: string[]) => {
        this.handleAccountsChanged(accounts)
      })
      this.addListeners()
    })
  }

  addListeners() {
    this.library.on('accountsChanged', this.handleAccountsChanged.bind(this))
    this.library.on('networkChanged', this.handleNetworkChanged.bind(this))
  }

  removeListeners() {
    if (!this.library) return
    this.library?.removeListener(
      'accountsChanged',
      this.handleAccountsChanged.bind(this)
    )
    this.library?.removeListener(
      'networkChanged',
      this.handleNetworkChanged.bind(this)
    )
  }

  dispose() {
    this.observer?.disconnect()
    this.removeListeners()
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
    if (accounts.length > 0) {
      this.parent.connect(OP_NET)
    } else {
      this.parent.disconnect()
    }
  }
  private handleNetworkChanged(network: NetworkType) {
    const foundNetwork = getNetworkForUnisat(network)
    if (this.network !== foundNetwork) {
      this.switchNetwork(foundNetwork)
    }
    this.parent.connect(OP_NET)
  }

  async connect(_: ProviderType, _forceReconnect = false): Promise<void> {
    if (!this.library) throw new Error("OP_NET isn't installed")
    const opNetAccounts = await this.library.requestAccounts()
    if (!opNetAccounts) throw new Error('No accounts found')
    const opNetPubKey = await this.library.getPublicKey()
    if (!opNetPubKey) throw new Error('No public key found')
    this.$store.setKey('accounts', opNetAccounts)
    this.$store.setKey('address', opNetAccounts[0])
    this.$store.setKey('paymentAddress', opNetAccounts[0])
    this.$store.setKey('publicKey', opNetPubKey)
    this.$store.setKey('paymentPublicKey', opNetPubKey)
    this.$store.setKey('provider', OP_NET)
    await this.getNetwork().then((network) => {
      if (this.config?.network !== network) {
        this.switchNetwork(network)
      }
    })

    this.$store.setKey('connected', true)
  }

  async getNetwork() {
    const opNetNetwork = (await this.library?.getChain()) as {
      enum: string
      name: string
      network: string
    }
    if (!opNetNetwork) {
      return this.network
    }
    return getNetworkForUnisat(opNetNetwork.enum) as NetworkType
  }

  async sendBTC(to: string, amount: number): Promise<string> {
    const txId = await this.library?.sendBitcoin(to, amount)
    if (!txId) throw new Error('Transaction failed')
    return txId
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
    { psbtHex, broadcast, finalize, inputsToSign }: WalletProviderSignPsbtOptions
  ): Promise<
    | {
      signedPsbtHex: string | undefined
      signedPsbtBase64: string | undefined
      txId?: string | undefined
    }
    | undefined
  > {
    const signedPsbt = await this.library?.signPsbt(psbtHex, omitUndefined({
      autoFinalized: finalize,
      toSignInputs: inputsToSign,
    }))

    const psbtSignedPsbt = bitcoin.Psbt.fromHex(signedPsbt)

    if (finalize && broadcast) {
      const txId = await this.pushPsbt(signedPsbt)
      return {
        signedPsbtHex: psbtSignedPsbt.toHex(),
        signedPsbtBase64: psbtSignedPsbt.toBase64(),
        txId,
      }
    }

    return {
      signedPsbtHex: psbtSignedPsbt.toHex(),
      signedPsbtBase64: psbtSignedPsbt.toBase64(),
      txId: undefined,
    }
  }

  async getPublicKey() {
    return await this.library?.getPublicKey()
  }

  async getBalance() {
    const bal = await this.library.getBalance()
    return bal.total
  }

  async getInscriptions(offset: number, limit: number): Promise<any[]> {
    return await this.library.getInscriptions(offset, limit)
  }

  async requestAccounts(): Promise<string[]> {
    return await this.library.requestAccounts()
  }

  async switchNetwork(network: NetworkType): Promise<void> {
    const wantedNetwork = getUnisatNetwork(network)
    await this.library?.switchChain(wantedNetwork)
    this.$network.set(network)
  }
}
