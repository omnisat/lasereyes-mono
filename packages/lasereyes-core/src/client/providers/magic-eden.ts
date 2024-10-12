import * as bitcoin from 'bitcoinjs-lib'
import {
  GetAddressOptions,
  getAddress,
  signMessage,
  sendBtcTransaction,
  BitcoinNetworkType,
  SendBtcTransactionOptions,
  MessageSigningProtocols,
} from 'sats-connect'
import { UNSUPPORTED_PROVIDER_METHOD_ERROR, WalletProvider } from '.'
import {
  ProviderType,
  NetworkType,
  MAGIC_EDEN,
  getSatsConnectNetwork,
  MAINNET,
  TESTNET,
  TESTNET4,
  SIGNET,
  FRACTAL_TESTNET,
  LaserEyesStoreType,
} from '../..'
import {
  findOrdinalsAddress,
  findPaymentAddress,
  getBTCBalance,
  getBitcoinNetwork,
} from '../../lib/helpers'
import { MapStore, listenKeys } from 'nanostores'
import { persistentMap } from '@nanostores/persistent'
import { fromOutputScript } from 'bitcoinjs-lib/src/address'
import axios from 'axios'
import { getMempoolSpaceUrl } from '../../lib/urls.ts'

const keysToPersist = [
  'address',
  'paymentAddress',
  'publicKey',
  'paymentPublicKey',
  'balance',
] as const

type PersistedKey = (typeof keysToPersist)[number]

const MAGIC_EDEN_WALLET_PERSISTENCE_KEY = 'MAGIC_EDEN_CONNECTED_WALLET_STATE'
export default class MagicEdenProvider extends WalletProvider {
  public get library(): any | undefined {
    return (window as any).magicEden.bitcoin
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
      this.$store.setKey(key, vals[key])
    }
  }

  watchStateChange(
    newState: LaserEyesStoreType,
    _: LaserEyesStoreType | undefined,
    changedKey: keyof LaserEyesStoreType | undefined
  ) {
    if (changedKey && newState.provider === MAGIC_EDEN) {
      if (changedKey === 'balance') {
        this.$valueStore.setKey('balance', newState.balance?.toString() ?? '')
      } else if ((keysToPersist as readonly string[]).includes(changedKey)) {
        this.$valueStore.setKey(
          changedKey as PersistedKey,
          newState[changedKey]?.toString() ?? ''
        )
      }
    }
  }

  initialize(): void {
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

    this.observer = new window.MutationObserver(() => {
      const xverseLib = (window as any)?.magicEden.bitcoin
      if (xverseLib) {
        this.$store.setKey('hasProvider', {
          ...this.$store.get().hasProvider,
          [MAGIC_EDEN]: true,
        })
        this.observer?.disconnect()
      }
    })
    this.observer.observe(document, { childList: true, subtree: true })
  }

  dispose() {
    this.observer?.disconnect()
  }

  async connect(_: ProviderType): Promise<void> {
    const { address, paymentAddress } = this.$valueStore!.get()

    try {
      if (address) {
        this.restorePersistedValues()
        getBTCBalance(paymentAddress, this.network).then((totalBalance) => {
          this.$store.setKey('balance', totalBalance)
        })
        return
      }
      let magicEdenNetwork = getSatsConnectNetwork(this.network || MAINNET)
      const getAddressOptions = {
        getProvider: async () => this.library,
        payload: {
          purposes: ['ordinals', 'payment'],
          message: 'Address for receiving Ordinals and payments',
          network: {
            type: magicEdenNetwork,
          },
        },
        onFinish: (response: any) => {
          const foundAddress = findOrdinalsAddress(response.addresses)
          const foundPaymentAddress = findPaymentAddress(response.addresses)
          if (foundAddress && foundPaymentAddress) {
            this.$store.setKey('provider', MAGIC_EDEN)
            this.$store.setKey('address', foundAddress.address)
            this.$store.setKey('paymentAddress', foundPaymentAddress.address)
          }
          this.$store.setKey(
            'publicKey',
            String(response.addresses[0].publicKey)
          )
          this.$store.setKey(
            'paymentPublicKey',
            String(response.addresses[1].publicKey)
          )

          getBTCBalance(foundPaymentAddress.address, this.network).then(
            (totalBalance) => {
              this.$store.setKey('balance', totalBalance)
            }
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
      this.$store.setKey('connected', true)
    } catch (e) {
      throw e
    }
  }

  async requestAccounts(): Promise<string[]> {
    return [this.$store.get().address, this.$store.get().paymentAddress]
  }

  async getNetwork(): Promise<NetworkType | undefined> {
    const { address } = this.$store.get()

    if (
      address.slice(0, 1) === 't' &&
      [TESTNET, TESTNET4, SIGNET, FRACTAL_TESTNET].includes(this.network)
    ) {
      return this.network
    }

    return MAINNET
  }

  getPublicKey(): Promise<string | undefined> {
    throw UNSUPPORTED_PROVIDER_METHOD_ERROR
  }

  async getBalance(): Promise<string | number | bigint> {
    const { paymentAddress } = this.$store.get()
    return await getBTCBalance(paymentAddress, this.network)
  }

  getInscriptions(): Promise<any[]> {
    throw UNSUPPORTED_PROVIDER_METHOD_ERROR
  }

  async sendBTC(to: string, amount: number): Promise<string> {
    let sendResponse: { txid: string }
    await sendBtcTransaction({
      getProvider: async () => this.library,
      payload: {
        network: {
          type: getSatsConnectNetwork(this.network) as BitcoinNetworkType,
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
      onCancel: () => alert('Canceled'),
    } as SendBtcTransactionOptions)
    // @ts-ignore
    if (!sendResponse) throw new Error('Error sending BTC')
    // @ts-ignore
    return sendResponse.txid
  }

  async signMessage(
    message: string,
    toSignAddress?: string | undefined
  ): Promise<string> {
    try {
      const tempAddy = toSignAddress || this.$store.get().paymentAddress
      let signedMessage: string = ''

      await signMessage({
        getProvider: async () => this.library,
        payload: {
          network: {
            type: BitcoinNetworkType.Mainnet,
          },
          address: tempAddy,
          message: message,
          protocol: MessageSigningProtocols.BIP322,
        },
        onFinish: (response) => {
          signedMessage = response
        },
        onCancel: () => {
          alert('Request canceled')
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
    const { address, paymentAddress } = this.$store.get()
    const toSignPsbt = bitcoin.Psbt.fromBase64(String(psbtBase64), {
      network: getBitcoinNetwork(this.network),
    })

    const inputs = toSignPsbt.data.inputs
    const inputsToSign = []
    const ordinalAddressData = {
      address: address,
      signingIndexes: [] as number[],
    }
    const paymentsAddressData = {
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
      } else if (addressFromScript === address) {
        ordinalAddressData.signingIndexes.push(Number(counter))
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
      onFinish: (response: { psbtBase64: string; txId: string }) => {
        if (response.psbtBase64) {
          const signedPsbt = bitcoin.Psbt.fromBase64(
            String(response.psbtBase64),
            {
              network: getBitcoinNetwork(this.network),
            }
          )

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
    if (broadcast) {
      const signed = bitcoin.Psbt.fromBase64(String(signedPsbtBase64))
      const finalized = signed.finalizeAllInputs()
      const extracted = finalized.extractTransaction()
      const txId = await this.pushPsbt(extracted.toHex())
      return {
        signedPsbtHex: extracted.toHex(),
        signedPsbtBase64: 'test',
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
  async pushPsbt(_tx: string): Promise<string | undefined> {
    return await axios
      .post(`${getMempoolSpaceUrl(this.network)}/api/tx`, _tx)
      .then((res) => res.data)
  }
}
