import * as bitcoin from 'bitcoinjs-lib'
import { map } from 'nanostores'
import { SignPSBTOptions, SignPSBTResult, WalletProvider } from '.'
import { NO_ACCOUNTS_ERROR } from './errors'
import { NetworkType } from '../types'
import { getNetworkForUnisat, getUnisatNetwork } from '../constants'

interface UnisatProviderState {
  address: string
  accounts: string[]
  publicKey: string
}

export class UnisatWalletProvider extends WalletProvider {
  private static instance: UnisatWalletProvider | null = null
  static getInstance() {
    if (this.instance === null) {
      this.instance = new UnisatWalletProvider()
    }
    return this.instance
  }
  private $store = map<UnisatProviderState>({
    address: '',
    publicKey: '',
    accounts: [],
  })

  private constructor() {
    super({
      label: 'Unisat Wallet',
      id: 'unisat',
      url: 'https://unisat.io',
      icon: 'https://unisat.io/favicon.ico',
    })
  }

  get library(): any | undefined {
    return (window as any).unisat
  }

  async _getNetwork(): Promise<string> {
    const unisatNetwork = await this.library.getChain()
    return getNetworkForUnisat(unisatNetwork.enum) as NetworkType
  }

  async _getBalance(): Promise<bigint> {
    const balance = await this.library.getBalance()
    return BigInt(balance.total)
  }

  async _getAddresses(): Promise<[string, string]> {
    const address = this.$store.get().address
    return [address, address]
  }

  async _getPublicKeys(): Promise<[string, string]> {
    const publicKey = this.$store.get().publicKey
    return [publicKey, publicKey]
  }

  async _connect(network?: string): Promise<void> {
    const accounts = await this.library.requestAccounts()
    const publicKey = await this.library.getPublicKey()
    if (!accounts || accounts.length === 0 || !publicKey) {
      throw { message: 'No Account found', type: NO_ACCOUNTS_ERROR }
    }

    const currentNetwork = await this.getNetwork()
    if (network && currentNetwork !== network) {
      await this.switchNetwork(network)
    }

    this.library.on('accountsChanged', this.handleAccountsChanged.bind(this))
    this.library.on('networkChanged', this.handleNetworkChanged.bind(this))

    this.$store.set({
      accounts,
      address: accounts[0],
      publicKey,
    })
  }

  async _disconnect(): Promise<void> {
    this.$store.set({ accounts: [], address: '', publicKey: '' })
    this.library.removeListener('accountsChanged', this.handleAccountsChanged)
    this.library.removeListener('networkChanged', this.handleNetworkChanged)
  }

  async _signMessage(message: string): Promise<string> {
    return await this.library?.signMessage(message)
  }

  protected async _signPsbt({
    psbtHex,
    finalize,
    broadcast,
  }: SignPSBTOptions): Promise<SignPSBTResult> {
    // TODO: Consider decoding the psbtHex or psbtBase64 then convert it into the required format
    const signedPsbt = await this.library.signPsbt(psbtHex, {
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

  protected async _pushPsbt(psbt: string): Promise<string> {
    return await this.library?.pushPsbt(psbt)
  }

  async _sendBitcoin(to: string, amount: bigint): Promise<string> {
    const txId = await this.library?.sendBitcoin(to, amount)
    if (!txId) throw new Error('Transaction failed')
    return txId
  }

  async _refreshBalance(): Promise<bigint> {
    return this._getBalance()
  }

  async _switchNetwork(network: string): Promise<void> {
    const wantedNetwork = getUnisatNetwork(network)
    await this.library.switchChain(wantedNetwork)
  }

  private async handleNetworkChanged(network: string) {
    const foundNetwork = getNetworkForUnisat(network)
    await this.connect()
    this.emit('networkChanged', foundNetwork)
  }
  private async handleAccountsChanged(accounts: string[]) {
    if (accounts.length === 0) return this.disconnect()

    await this.connect()
    this.emit('accountsChanged', accounts)
  }
}
