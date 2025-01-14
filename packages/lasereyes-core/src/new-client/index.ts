import * as bitcoin from 'bitcoinjs-lib'
import { map, MapStore } from 'nanostores'
import { SignPSBTResult, WalletProvider } from '../wallet-providers'
import { isBase64 } from '../lib/utils'
import { isHex } from '../lib/utils'

export interface LaserEyesClientState {
  connected: boolean
  paymentAddress?: string
  address?: string
  publicKey?: string
  paymentPublicKey?: string
  accounts: string[]
  balance?: bigint

  network?: string

  isConnecting: boolean
}

const disconnectedState = {
  connected: false,
  isConnecting: false,
  address: undefined,
  paymentAddress: undefined,
  publicKey: undefined,
  paymentPublicKey: undefined,
  accounts: [],
  balance: undefined,
}
export class LaserEyesClient {
  provider: WalletProvider
  $stateStore: MapStore<LaserEyesClientState>

  constructor({
    provider,
    stateStore,
  }: {
    provider: WalletProvider
    stateStore?: MapStore<LaserEyesClientState>
  }) {
    this.provider = provider
    this.$stateStore =
      stateStore ||
      map<LaserEyesClientState>({
        connected: false,
        accounts: [],
        isConnecting: false,
      })
    this.provider.on('connected', this.handleConnectedEvent.bind(this))
    this.provider.on('disconnected', this.handleDisconnectedEvent.bind(this))
  }

  private async handleConnectedEvent() {
    const [address, paymentAddress] = await this.provider.getAddresses()
    const [publicKey, paymentPublicKey] = await this.provider.getPublicKeys()
    const balance = await this.provider.getBalance()
    const accounts = await this.provider.getAccounts()
    const network = await this.provider.getNetwork()
    this.$stateStore.set({
      connected: true,
      isConnecting: false,
      address,
      paymentAddress,
      publicKey,
      paymentPublicKey,
      accounts,
      balance,
      network,
    })
  }

  private async handleDisconnectedEvent() {
    if (!this.$stateStore.get().connected) {
      return
    }
    this.$stateStore.set(disconnectedState)
  }

  connectionLock: boolean = false
  async connect(network?: string) {
    if (this.connectionLock) {
      return
    }
    this.connectionLock = true
    try {
      this.$stateStore.setKey('isConnecting', true)
      await this.provider.connect(network)
      this.$stateStore.setKey('isConnecting', false)
    } catch (e) {
      this.connectionLock = false
      this.$stateStore.setKey('isConnecting', false)
      throw e
    }
  }

  async disconnect() {
    await this.provider.disconnect()
  }

  async sendBitcoin(to: string, amount: bigint): Promise<string> {
    return this.provider.sendBitcoin(to, amount)
  }

  async signMessage(message: string, toSignAddress?: string): Promise<string> {
    return this.provider.signMessage(message, toSignAddress)
  }

  async signPSBT(
    tx: string,
    finalize = false,
    broadcast = false
  ): Promise<SignPSBTResult> {
    if (!tx) throw new Error('No PSBT provided')

    let psbtBase64: string
    let psbtHex: string

    if (isHex(tx)) {
      psbtBase64 = bitcoin.Psbt.fromHex(tx).toBase64()
      psbtHex = tx
    } else if (isBase64(tx)) {
      psbtBase64 = tx
      psbtHex = bitcoin.Psbt.fromBase64(tx).toHex()
    } else {
      throw new Error('Invalid PSBT format')
    }
    return this.provider.signPsbt({
      finalize,
      broadcast,
      psbtBase64,
      psbtHex,
    })
  }

  async pushPSBT(psbt: string): Promise<string> {
    return this.provider.pushPsbt(psbt)
  }

  async getBalance() {
    return this.provider.getBalance()
  }

  async getAddresses() {
    return this.provider.getAddresses()
  }

  async getPublicKey() {
    return (await this.provider.getPublicKeys())[1]
  }

  async getNetwork() {
    return this.provider.getNetwork()
  }

  async switchNetwork(network: string) {
    return this.provider.switchNetwork(network)
  }

  async requestAccounts() {
    return this.provider.getAccounts()
  }

  // TODO: Implement inscription methods
}
