import * as bitcoin from 'bitcoinjs-lib'
import { fromOutputScript } from 'bitcoinjs-lib/src/address'
import orange, {
  AddressPurpose,
  BitcoinNetworkType as OrangeBitcoinNetworkType,
  SignTransactionOptions as OrangeSignTransactionOptions,
  GetAddressOptions,
  getAddress,
  SendBtcTransactionOptions,
} from '@orangecrypto/orange-connect'

import { UNSUPPORTED_PROVIDER_METHOD_ERROR, WalletProvider } from '.'
import {
  ProviderType,
  NetworkType,
  MAINNET,
  TESTNET,
  TESTNET4,
  SIGNET,
  FRACTAL_TESTNET,
  LaserEyesStoreType,
  getOrangeNetwork,
  ORANGE,
} from '../..'
import {
  findOrdinalsAddress,
  findPaymentAddress,
  getBTCBalance,
  getBitcoinNetwork,
} from '../../lib/helpers'
import { MapStore, listenKeys } from 'nanostores'
import { persistentMap } from '@nanostores/persistent'
import axios from 'axios'
import { getMempoolSpaceUrl } from '../../lib/urls'

const keysToPersist = [
  'address',
  'paymentAddress',
  'publicKey',
  'paymentPublicKey',
  'balance',
] as const

const {
  signMessage: signMessageOrange,
  sendBtcTransaction: sendBtcTxOrange,
  signTransaction: signPsbtOrange,
} = orange

type PersistedKey = (typeof keysToPersist)[number]

const ORANGE_WALLET_PERSISTENCE_KEY = 'ORANGE_CONNECTED_WALLET_STATE'
export default class OrangeProvider extends WalletProvider {
  public get library(): any | undefined {
    return (window as any)?.OrangeWalletProviders?.OrangeBitcoinProvider
  }

  public get network(): NetworkType {
    return this.$network.get()
  }

  observer?: MutationObserver
  $valueStore: MapStore<Record<PersistedKey, string>> = persistentMap(
    ORANGE_WALLET_PERSISTENCE_KEY,
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
    if (changedKey && newState.provider === ORANGE) {
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
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      this.observer = new window.MutationObserver(() => {
        const orangeLib = (window as any)?.OrangeWalletProviders
          ?.OrangeBitcoinProvider

        if (orangeLib) {
          this.$store.setKey('hasProvider', {
            ...this.$store.get().hasProvider,
            [ORANGE]: true,
          })
          this.observer?.disconnect()
        }
      })
      this.observer?.observe(document, { childList: true, subtree: true })
    }
    listenKeys(this.$store, ['provider'], (newVal) => {
      if (newVal.provider !== ORANGE) {
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
        this.restorePersistedValues()
        getBTCBalance(paymentAddress, this.network).then((totalBalance) => {
          this.$store.setKey('balance', totalBalance)
        })
        return
      }

      let orangeNetwork = getOrangeNetwork(this.network || MAINNET)
      const getAddressOptions = {
        payload: {
          purposes: ['ordinals', 'payment'] as AddressPurpose[],
          message: 'Address for receiving Ordinals and payments',
          network: {
            type: orangeNetwork,
          },
        },
        onFinish: (response: any) => {
          const foundAddress = findOrdinalsAddress(response.addresses)
          const foundPaymentAddress = findPaymentAddress(response.addresses)
          if (!foundAddress || !foundPaymentAddress?.address) {
            throw new Error('Could not find addresses')
          }

          if (foundAddress && foundPaymentAddress) {
            this.$store.setKey('provider', ORANGE)
            this.$store.setKey('address', foundAddress.address)
            this.$store.setKey('paymentAddress', foundPaymentAddress.address)
          }

          this.$store.setKey('publicKey', String(foundAddress.publicKey))
          this.$store.setKey(
            'paymentPublicKey',
            String(foundPaymentAddress.publicKey)
          )

          getBTCBalance(
            String(foundPaymentAddress?.address),
            this.network
          ).then((totalBalance) => {
            this.$store.setKey('balance', totalBalance)
          })
        },
        onCancel: () => {
          throw new Error(`User canceled lasereyes to ${ORANGE} wallet`)
        },
      } as GetAddressOptions

      await getAddress(getAddressOptions)
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
    let txId = ''
    const sendBtcOptions = {
      payload: {
        network: {
          type: getOrangeNetwork(this.network),
        },
        recipients: [
          {
            address: to,
            amountSats: BigInt(amount),
          },
        ],
        senderAddress: this.$store.get().paymentAddress,
      },
      onFinish: (response: any) => {
        txId = response
      },
      onCancel: () => {
        throw new Error('User canceled the request')
      },
    } as SendBtcTransactionOptions

    await sendBtcTxOrange(sendBtcOptions)
    return txId
  }

  async signMessage(
    message: string,
    toSignAddress?: string | undefined
  ): Promise<string> {
    let signature = ''
    const tempAddy = toSignAddress || this.$store.get().paymentAddress
    const signMessageOptions = {
      payload: {
        network: {
          type: getOrangeNetwork(this.network) as OrangeBitcoinNetworkType,
        },
        address: tempAddy,
        message: message,
      },
      onFinish: (response: string) => {
        signature = response
      },
      onCancel: () => {
        throw new Error('User canceled the request')
      },
    }

    await signMessageOrange(signMessageOptions)
    return signature
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
    const toSignPsbt = bitcoin.Psbt.fromBase64(String(psbtBase64), {
      network: getBitcoinNetwork(this.network),
    })

    const address = this.$store.get().address
    const paymentAddress = this.$store.get().paymentAddress

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
      if (input.witnessUtxo === undefined) {
        paymentsAddressData.signingIndexes.push(Number(counter))
      } else {
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

      counter++
    }

    if (ordinalAddressData.signingIndexes.length > 0) {
      inputsToSign.push(ordinalAddressData)
    }

    if (paymentsAddressData.signingIndexes.length > 0) {
      inputsToSign.push(paymentsAddressData)
    }

    let txId, signedPsbtHex, signedPsbtBase64
    const signPsbtOptions = {
      payload: {
        network: {
          type: getOrangeNetwork(this.network),
        },
        psbtBase64: toSignPsbt.toBase64(),
        message: toSignPsbt.toBase64(),
        broadcast: broadcast,
        inputsToSign: inputsToSign,
      },
      onFinish: (response: any) => {
        if (response.txId) {
          txId = response.txId
        } else if (response.psbtBase64) {
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
        console.error('Request canceled')
        throw new Error('User canceled the request')
      },
    } as OrangeSignTransactionOptions

    await signPsbtOrange(signPsbtOptions)
    return {
      signedPsbtHex,
      signedPsbtBase64,
      txId,
    }
  }

  async pushPsbt(_tx: string): Promise<string | undefined> {
    let payload = _tx
    if (!payload.startsWith('02')) {
      const psbtObj = bitcoin.Psbt.fromHex(payload)
      psbtObj.finalizeAllInputs()
      payload = psbtObj.extractTransaction().toHex()
    }

    return await axios
      .post(`${getMempoolSpaceUrl(this.network)}/api/tx`, payload)
      .then((res) => res.data)
  }

  async inscribe(
    content: string,
    mimeType: string
  ): Promise<string | string[]> {
    console.log(content, mimeType)
    throw UNSUPPORTED_PROVIDER_METHOD_ERROR
  }
}
