
import * as bitcoin from 'bitcoinjs-lib'
import { WalletProvider } from '.'
import { getNetworkForUnisat, getUnisatNetwork } from '../../constants/networks'
import { NetworkType, ProviderType } from '../../types'
import { SPARROW } from '../../constants/wallets'
import { listenKeys } from 'nanostores'

export default class SparrowProvider extends WalletProvider {
  public get network(): NetworkType {
    return this.$network.get()
  }
  observer?: MutationObserver

  initialize() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      this.observer = new window.MutationObserver(() => {
        this.$store.setKey('hasProvider', {
          ...this.$store.get().hasProvider,
          [SPARROW]: true,
        })
        this.observer?.disconnect()
      })

      this.observer.observe(document, { childList: true, subtree: true })
    }

    listenKeys(this.$store, ['provider'], (newStore) => {
      if (newStore.provider !== SPARROW) {
        return
      }
    })
  }

  dispose() {
    this.observer?.disconnect()
  }


  async connect(_: ProviderType): Promise<void> {

    this.$store.setKey('accounts', unisatAccounts)
    this.$store.setKey('address', unisatAccounts[0])
    this.$store.setKey('paymentAddress', unisatAccounts[0])
    this.$store.setKey('publicKey', unisatPubKey)
    this.$store.setKey('paymentPublicKey', unisatPubKey)
    this.$store.setKey('provider', UNISAT)
    this.$store.setKey('connected', true)
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

  async signMessage(message: string, _?: string | undefined): Promise<string> {
    return await this.library?.signMessage(message)
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

  async getInscriptions(): Promise<any[]> {
    return await this.library.getInscriptions(0, 10)
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
