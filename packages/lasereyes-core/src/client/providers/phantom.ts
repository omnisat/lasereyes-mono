import * as bitcoin from 'bitcoinjs-lib'
import { WalletProvider } from '.'
import { ECDSA, MAINNET, PHANTOM, TESTNET } from '../../constants'
import { ProviderType, NetworkType, Config } from '../../types'
import {
  createSendBtcPsbt,
  getBitcoinNetwork,
  isTestnetNetwork,
} from '../../lib/helpers'
import { listenKeys, MapStore, WritableAtom } from 'nanostores'
import { fromOutputScript } from 'bitcoinjs-lib/src/address'
import { fromHexString } from '../utils'
import { LaserEyesStoreType, SignMessageOptions, WalletProviderSignPsbtOptions } from '../types'
import { LaserEyesClient } from '..'

export default class PhantomProvider extends WalletProvider {
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
    return (window as any)?.phantom?.bitcoin
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
            [PHANTOM]: true,
          })
          this.observer?.disconnect()
        }
      })

      this.observer.observe(document, { childList: true, subtree: true })
    }

    listenKeys(this.$store, ['provider'], (newStore) => {
      if (newStore.provider !== PHANTOM) {
        // this.removeListeners()
        return
      }
      this.library.requestAccounts().then((accounts: string[]) => {
        this.handleAccountsChanged(accounts)
      })
      // this.addListeners()
    })
  }

  dispose() {
    this.observer?.disconnect()
    // this.removeListeners()
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
      this.parent.connect(PHANTOM)
    } else {
      this.parent.disconnect()
    }
  }

  async connect(_: ProviderType): Promise<void> {
    if (!this.library) throw new Error("Phantom isn't installed")
    if (isTestnetNetwork(this.network)) {
      throw new Error(`${this.network} is not supported by ${PHANTOM}`)
    }

    const phantomAccounts = await this.library.requestAccounts()
    if (!phantomAccounts) throw new Error('No accounts found')
    this.$store.setKey('accounts', phantomAccounts)

    const taproot = phantomAccounts.find(
      (account: { purpose: string }) => account.purpose === 'ordinals'
    )
    const payment = phantomAccounts.find(
      (account: { purpose: string }) => account.purpose === 'payment'
    )

    this.$store.setKey('address', taproot.address)
    this.$store.setKey('paymentAddress', payment.address)
    this.$store.setKey('publicKey', taproot.publicKey)
    this.$store.setKey('paymentPublicKey', payment.publicKey)
    this.$store.setKey('provider', PHANTOM)
    this.$store.setKey('connected', true)
  }

  async getNetwork() {
    if (this.$store.get().address.slice(0, 1) === 't') {
      return TESTNET
    }
    return MAINNET
  }

  async sendBTC(to: string, amount: number): Promise<string> {
    const { psbtHex, psbtBase64 } = await createSendBtcPsbt(
      this.$store.get().address,
      this.$store.get().paymentAddress,
      to,
      amount,
      this.$store.get().paymentPublicKey,
      this.network,
      7
    )
    const psbt = await this.signPsbt({ psbtBase64, psbtHex, tx: psbtHex, broadcast: true, finalize: true })
    if (!psbt) throw new Error('Error sending BTC')
    // @ts-ignore
    return psbt.txId
  }

  async signMessage(
    message: string,
    options?: SignMessageOptions
  ): Promise<string> {
    if (options?.protocol === ECDSA) {
      throw new Error('ECDSA signing is not supported by Phantom')
    }
    const utf8Bytes = new TextEncoder().encode(message)
    const uintArray = new Uint8Array(utf8Bytes)
    const tempAddy = options?.toSignAddress || this.$store.get().paymentAddress
    const response = await this.library?.signMessage(tempAddy, uintArray)
    const binaryString = String.fromCharCode(...response.signature)
    return btoa(binaryString)
  }

  async signPsbt(
    { psbtHex, broadcast, finalize, inputsToSign: inputsToSignProp }: WalletProviderSignPsbtOptions
  ): Promise<
    | {
      signedPsbtHex: string | undefined
      signedPsbtBase64: string | undefined
      txId?: string | undefined
    }
    | undefined
  > {
    const { address, paymentAddress } = this.$store.get()
    const toSignPsbt = bitcoin.Psbt.fromHex(String(psbtHex), {
      network: getBitcoinNetwork(this.network),
    })

    const inputs = toSignPsbt.data.inputs.filter((_, i) => inputsToSignProp ? inputsToSignProp.includes(i) : true)
    const inputsToSign = []
    const ordinalAddressData = {
      address: address,
      signingIndexes: [] as number[],
    }
    const paymentsAddressData = {
      address: paymentAddress,
      signingIndexes: [] as number[],
    }

    for (let counter of inputsToSignProp ?? inputs.keys()) {
      const input = inputs[counter]
      if (input.witnessUtxo === undefined || inputsToSignProp) {
        paymentsAddressData.signingIndexes.push(Number(counter))
        continue
      }
      const { script } = input.witnessUtxo!
      const addressFromScript = fromOutputScript(
        script,
        getBitcoinNetwork(this.network)
      )

      if (addressFromScript === paymentAddress) {
        paymentsAddressData.signingIndexes.push(Number(counter))
      } else if (addressFromScript === address) {
        ordinalAddressData.signingIndexes.push(Number(counter))
      }
    }

    if (ordinalAddressData.signingIndexes.length > 0) {
      inputsToSign.push(ordinalAddressData)
    }

    if (paymentsAddressData.signingIndexes.length > 0) {
      inputsToSign.push(paymentsAddressData)
    }

    const signedPsbt: Uint8Array = await this.library.signPSBT(
      fromHexString(psbtHex),
      {
        inputsToSign,
      }
    )

    const psbtSignedPsbt = bitcoin.Psbt.fromBuffer(signedPsbt)

    if (finalize) {
      inputsToSign.forEach((inputData) => {
        inputData.signingIndexes.forEach((index) => {
          psbtSignedPsbt.finalizeInput(index)
        })
      })
    }

    if (broadcast) {
      const txId = await this.pushPsbt(psbtSignedPsbt.toHex())
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

  async requestAccounts(): Promise<string[]> {
    return await this.library.requestAccounts()
  }
}
