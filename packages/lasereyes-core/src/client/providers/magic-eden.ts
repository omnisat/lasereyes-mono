import * as bitcoin from 'bitcoinjs-lib'
import {
  BitcoinNetworkType,
  getAddress,
  GetAddressOptions,
  MessageSigningProtocols,
  sendBtcTransaction,
  SendBtcTransactionOptions,
  signMessage,
  signTransaction,
} from 'sats-connect'
import { WalletProvider } from '.'
import {
  Config,
  ECDSA,
  LaserEyesClient,
  LaserEyesStoreType,
  MAGIC_EDEN,
  MAINNET,
  NetworkType,
  ProviderType,
  SignMessageOptions,
} from '../..'
import {
  findOrdinalsAddress,
  findPaymentAddress,
  getBitcoinNetwork,
  getBTCBalance,
  isMainnetNetwork,
  isTestnetNetwork,
} from '../../lib/helpers'
import { getSatsConnectNetwork } from '../../constants/networks'
import { listenKeys, MapStore, WritableAtom } from 'nanostores'
import { persistentMap } from '@nanostores/persistent'
import { fromOutputScript } from 'bitcoinjs-lib/src/address'
import {
  handleStateChangePersistence,
  keysToPersist,
  PersistedKey,
} from '../utils'

const MAGIC_EDEN_WALLET_PERSISTENCE_KEY = 'MAGIC_EDEN_CONNECTED_WALLET_STATE'

export default class MagicEdenProvider extends WalletProvider {
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
    return (window as any)?.magicEden?.bitcoin
  }

  public get network(): NetworkType {
    return this.$network.get()
  }

  observer?: MutationObserver
  $valueStore: MapStore<Record<PersistedKey, string>> = persistentMap(
    MAGIC_EDEN_WALLET_PERSISTENCE_KEY,
    {
      address: '',
      paymentAddress: '',
      paymentPublicKey: '',
      publicKey: '',
      balance: '',
    }
  )

  removeSubscriber?: Function

  restorePersistedValues() {
    const vals = this.$valueStore.get()
    for (const key of keysToPersist) {
      if (key === 'balance') {
        this.$store.setKey(key, BigInt(vals[key]))
        continue
      }
      this.$store.setKey(key, vals[key])
    }
    this.$store.setKey(
      'accounts',
      [vals.address, vals.paymentAddress].filter(Boolean)
    )
  }

  watchStateChange(
    newState: LaserEyesStoreType,
    _: LaserEyesStoreType | undefined,
    changedKey: keyof LaserEyesStoreType | undefined
  ) {
    handleStateChangePersistence(
      MAGIC_EDEN,
      newState,
      changedKey,
      this.$valueStore
    )
  }

  initialize(): void {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      this.observer = new window.MutationObserver(() => {
        const magicEdenLib = (window as any)?.magicEden?.bitcoin
        if (magicEdenLib) {
          this.$store.setKey('hasProvider', {
            ...this.$store.get().hasProvider,
            [MAGIC_EDEN]: true,
          })
          this.observer?.disconnect()
        }
      })
      this.observer.observe(document, { childList: true, subtree: true })
    }

    listenKeys(this.$store, ['provider'], (newVal) => {
      if (newVal.provider !== MAGIC_EDEN) {
        if (this.removeSubscriber) {
          this.$valueStore.set({
            address: '',
            paymentAddress: '',
            paymentPublicKey: '',
            publicKey: '',
            balance: '',
          })
          this.removeSubscriber()
          this.removeSubscriber = undefined
        }
      } else {
        this.removeSubscriber = this.$store.subscribe(
          this.watchStateChange.bind(this)
        )
      }
    })
  }

  dispose() {
    this.observer?.disconnect()
  }

  async connect(_: ProviderType): Promise<void> {
    const { address, paymentAddress } = this.$valueStore!.get()

    try {
      if (address) {
        if (address.startsWith('tb1') && isMainnetNetwork(this.network)) {
          this.disconnect()
        } else {
          getBTCBalance(paymentAddress, this.network).then((totalBalance) => {
            this.$store.setKey('balance', totalBalance)
          })
          this.restorePersistedValues()
          return
        }
      }

      if (isTestnetNetwork(this.network)) {
        throw new Error(`${this.network} is not supported by ${MAGIC_EDEN}`)
      }

      let magicEdenNetwork = getSatsConnectNetwork(this.network || MAINNET)
      const getAddressOptions = {
        getProvider: async () => this.library,
        payload: {
          purposes: ['ordinals', 'payment'],
          message: 'Connecting with lasereyes',
          network: {
            type: magicEdenNetwork as unknown as BitcoinNetworkType,
          },
        },
        onFinish: (response: any) => {
          const foundAddress = findOrdinalsAddress(response.addresses)
          const foundPaymentAddress = findPaymentAddress(response.addresses)
          if (!foundAddress || !foundPaymentAddress)
            throw new Error('No address found')
          if (foundAddress && foundPaymentAddress) {
            this.$store.setKey('address', foundAddress.address)
            this.$store.setKey('paymentAddress', foundPaymentAddress.address)
            this.$store.setKey('accounts', [
              foundAddress.address,
              foundPaymentAddress.address,
            ])
          }
          this.$store.setKey(
            'publicKey',
            String(response.addresses[0].publicKey)
          )
          this.$store.setKey(
            'paymentPublicKey',
            String(response.addresses[1].publicKey)
          )
        },
        onCancel: () => {
          throw new Error(`User canceled lasereyes to ${MAGIC_EDEN} wallet`)
        },
        onError: (_: any) => {
          throw new Error(`Can't lasereyes to ${MAGIC_EDEN} wallet`)
        },
      }
      await getAddress(getAddressOptions as GetAddressOptions)
    } catch (e) {
      throw e
    }
  }

  async sendBTC(to: string, amount: number): Promise<string> {
    let sendResponse: { txid: string }
    await sendBtcTransaction({
      getProvider: async () => this.library,
      payload: {
        network: {
          type: getSatsConnectNetwork(this.network) as unknown as BitcoinNetworkType,
        },
        recipients: [
          {
            address: to,
            amountSats: BigInt(amount),
          },
        ],
        senderAddress: this.$store.get().paymentAddress,
      },
      onFinish: (response) => {
        // @ts-ignore
        sendResponse = response
      },
      onCancel: () => {
        console.error('Request canceled')
        throw new Error('User canceled the request')
      },
    } as SendBtcTransactionOptions)
    // @ts-ignore
    if (!sendResponse) throw new Error('Error sending BTC')
    // @ts-ignore
    return sendResponse.txid
  }

  async signMessage(
    message: string,
    options?: SignMessageOptions
  ): Promise<string> {
    try {
      const tempAddy =
        options?.toSignAddress || this.$store.get().paymentAddress
      let signedMessage: string = ''

      await signMessage({
        getProvider: async () => this.library,
        payload: {
          network: {
            type: BitcoinNetworkType.Mainnet,
          },
          address: tempAddy,
          message: message,
          protocol:
            options?.protocol === ECDSA
              ? MessageSigningProtocols.ECDSA
              : MessageSigningProtocols.BIP322,
        },
        onFinish: (response) => {
          signedMessage = response
        },
        onCancel: () => {
          console.error('Request canceled')
          throw new Error('User canceled the request')
        },
      })

      return signedMessage
    } catch (e) {
      throw e
    }
  }

  async signPsbt(
    _: string,
    __: string,
    psbtBase64: string,
    _finalize?: boolean | undefined,
    broadcast?: boolean | undefined
  ): Promise<
    | {
      signedPsbtHex: string | undefined
      signedPsbtBase64: string | undefined
      txId?: string | undefined
    }
    | undefined
  > {
    console.log('signPsbt', psbtBase64, _finalize, broadcast)
    const { address, paymentAddress } = this.$store.get()
    const toSignPsbt = bitcoin.Psbt.fromBase64(String(psbtBase64), {
      network: getBitcoinNetwork(this.network),
    })

    const inputs = toSignPsbt.data.inputs
    const inputsToSign = []
    type InputAddressData = {
      address: string
      signingIndexes: number[]
      sigHash?: number
    }
    const ordinalAddressData: InputAddressData = {
      address: address,
      signingIndexes: [] as number[],
    }
    const paymentsAddressData: InputAddressData = {
      address: paymentAddress,
      signingIndexes: [] as number[],
    }

    let counter = 0
    for await (let input of inputs) {
      const { script } = input.witnessUtxo!
      const addressFromScript = fromOutputScript(
        script,
        getBitcoinNetwork(this.network)
      )

      if (addressFromScript === paymentAddress) {
        paymentsAddressData.signingIndexes.push(Number(counter))
        if (input.sighashType) {
          console.log('Updating sigHash for paymentsAddressData')
          paymentsAddressData.sigHash = input.sighashType
        }
      } else if (addressFromScript === address) {
        ordinalAddressData.signingIndexes.push(Number(counter))
        if (input.sighashType) {
          console.log('Updating sigHash for ordinalAddressData')
          ordinalAddressData.sigHash = input.sighashType
        }
      }
      counter++
    }

    if (ordinalAddressData.signingIndexes.length > 0) {
      inputsToSign.push(ordinalAddressData)
    }

    if (paymentsAddressData.signingIndexes.length > 0) {
      inputsToSign.push(paymentsAddressData)
    }

    let txId, signedPsbtHex, signedPsbtBase64
    let signedPsbt: bitcoin.Psbt | undefined
    const magicEdenNetwork = getSatsConnectNetwork(this.network)

    const signPsbtOptions = {
      getProvider: async () => this.library,
      payload: {
        network: {
          type: magicEdenNetwork,
        },
        message: 'Sign Transaction',
        psbtBase64: toSignPsbt.toBase64(),
        broadcast: broadcast,
        inputsToSign: inputsToSign,
      },
      onFinish: async (response: { psbtBase64: string; txId: string }) => {
        if (response.psbtBase64) {
          signedPsbt = bitcoin.Psbt.fromBase64(String(response.psbtBase64), {
            network: getBitcoinNetwork(this.network),
          })

          signedPsbtHex = signedPsbt.toHex()
          signedPsbtBase64 = signedPsbt.toBase64()
        }
      },
      onCancel: () => {
        console.log('Canceled')
        throw new Error('User canceled the request')
      },
      onError: (error: any) => {
        console.log('error', error)
        throw error
      },
    }

    // @ts-ignore
    await signTransaction(signPsbtOptions)

    if (!signedPsbt) {
      throw new Error('signature failed')
    }

    if (_finalize || broadcast) {
      signedPsbt.finalizeAllInputs()
      // const signedTx = signedPsbt.extractTransaction()
      // signedPsbtHex = signedTx.toHex()
      // if (broadcast) {
      //   txId = await this.pushPsbt(signedPsbtHex)
      //   return {
      //     signedPsbtHex,
      //     signedPsbtBase64,
      //     txId,
      //   }
      // }

      return {
        signedPsbtHex: signedPsbt.toHex(),
        signedPsbtBase64,
        txId,
      }
    } else {
      return {
        signedPsbtHex,
        signedPsbtBase64,
        txId,
      }
    }
  }
}
