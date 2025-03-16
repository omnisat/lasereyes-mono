import * as bitcoin from 'bitcoinjs-lib'
import { WalletProvider } from '.'
import { getNetworkForUnisat, getUnisatNetwork } from '../../constants/networks'
import { Config, NetworkType, ProviderType } from '../../types'
import { UNISAT } from '../../constants/wallets'
import { listenKeys, MapStore, WritableAtom } from 'nanostores'
import { LaserEyesStoreType, SignMessageOptions } from '../types'
import { BIP322, BIP322_SIMPLE } from '../../constants'
import { LaserEyesClient } from '..'
import { Inscription } from '../../types/lasereyes'
import { normalizeInscription } from '../../lib/data-sources/normalizations'

export default class UnisatProvider extends WalletProvider {
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
    return (window as any).unisat
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
            [UNISAT]: true,
          })
          this.observer?.disconnect()
        }
      })

      this.observer.observe(document, { childList: true, subtree: true })
    }

    listenKeys(this.$store, ['provider'], (newStore) => {
      if (newStore.provider !== UNISAT) {
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
      this.parent.connect(UNISAT)
    } else {
      this.parent.disconnect()
    }
  }
  private handleNetworkChanged(network: string) {
    const foundNetwork = getNetworkForUnisat(network)
    if (this.network !== foundNetwork) {
      this.switchNetwork(foundNetwork)
    }
    this.parent.connect(UNISAT)
  }

  async connect(_: ProviderType): Promise<void> {
    if (!this.library) throw new Error("Unisat isn't installed")
    const unisatAccounts = await this.library.requestAccounts()
    if (!unisatAccounts) throw new Error('No accounts found')
    await this.getNetwork().then((network) => {
      if (this.network !== network) {
        this.switchNetwork(this.network)
      }
    })
    const unisatPubKey = await this.library.getPublicKey()
    if (!unisatPubKey) throw new Error('No public key found')
    this.$store.setKey('accounts', unisatAccounts)
    this.$store.setKey('address', unisatAccounts[0])
    this.$store.setKey('paymentAddress', unisatAccounts[0])
    this.$store.setKey('publicKey', unisatPubKey)
    this.$store.setKey('paymentPublicKey', unisatPubKey)
  }

  async getNetwork() {
    const unisatNetwork = (await this.library?.getChain()) as {
      enum: string
      name: string
      network: string
    }
    if (!unisatNetwork) {
      return this.network
    }
    return getNetworkForUnisat(unisatNetwork.enum) as NetworkType
  }

  async sendBTC(to: string, amount: number): Promise<string> {
    const txId = await this.library?.sendBitcoin(to, amount)
    if (!txId) throw new Error('Transaction failed')
    return txId
  }

  override async signMessage(
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
    })

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

  async getInscriptions(offset?: number, limit?: number): Promise<Inscription[]> {
    const offsetValue = offset || 0
    const limitValue = limit || 10
    const response = await this.library.getInscriptions(offsetValue, limitValue)
    const inscriptions = response.list.map((insc: UnisatInscription) => {
      return normalizeInscription(insc, undefined, this.network)
    })

    return inscriptions
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

export type UnisatInscription = {
  inscriptionId: string
  inscriptionNumber: number
  address: string
  outputValue: number
  preview: string
  content: string
  contentLength: number
  contentType: string
  contentBody: string
  timestamp: number
  genesisTransaction: string
  location: string
  output: string
  offset: number
  utxoHeight: number
  utxoConfirmation: number
  parents: Array<any>
  children: Array<any>
}
