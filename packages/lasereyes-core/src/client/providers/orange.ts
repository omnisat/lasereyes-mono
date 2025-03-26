import * as bitcoin from 'bitcoinjs-lib'
import { fromOutputScript } from 'bitcoinjs-lib/src/address'
import orange, {
  AddressPurpose,
  BitcoinNetworkType as OrangeBitcoinNetworkType,
  GetAddressOptions,
  getAddress,
  SendBtcTransactionOptions,
  request,
  RpcErrorCode,
} from '@orangecrypto/orange-connect'

import { WalletProvider } from '.'
import {
  ProviderType,
  NetworkType,
  MAINNET,
  TESTNET,
  TESTNET4,
  SIGNET,
  FRACTAL_TESTNET,
  LaserEyesStoreType,
  ORANGE,
  SignMessageOptions,
  Config,
  LaserEyesClient,
  WalletProviderSignPsbtOptions,
} from '../..'
import {
  findOrdinalsAddress,
  findPaymentAddress,
  getBTCBalance,
  getBitcoinNetwork,
} from '../../lib/helpers'
import { getOrangeNetwork } from '../../constants/networks'
import { MapStore, WritableAtom, listenKeys } from 'nanostores'
import { persistentMap } from '@nanostores/persistent'

import {
  handleStateChangePersistence,
  keysToPersist,
  PersistedKey,
} from '../utils'

const { signMessage: signMessageOrange, sendBtcTransaction: sendBtcTxOrange } =
  orange

const ORANGE_WALLET_PERSISTENCE_KEY = 'ORANGE_CONNECTED_WALLET_STATE'
export default class OrangeProvider extends WalletProvider {
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
      if (key === 'balance') {
        this.$store.setKey(key, BigInt(vals[key]))
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
    handleStateChangePersistence(ORANGE, newState, changedKey, this.$valueStore)
  }

  initialize(): void {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      this.observer = new window.MutationObserver(() => {
        const orangeLib = (window as any)?.OrangeBitcoinProvider

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
    options?: SignMessageOptions
  ): Promise<string> {
    let signature = ''
    const tempAddy = options?.toSignAddress || this.$store.get().paymentAddress
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
    { psbtBase64, broadcast, finalize, inputsToSign: inputsToSignProp }: WalletProviderSignPsbtOptions
  ): Promise<
    | {
      signedPsbtHex: string | undefined
      signedPsbtBase64: string | undefined
      txId?: string | undefined
    }
    | undefined
  > {
    try {
      const toSignPsbt = bitcoin.Psbt.fromBase64(String(psbtBase64), {
        network: getBitcoinNetwork(this.network),
      })

      const address = this.$store.get().address
      const paymentAddress = this.$store.get().paymentAddress

      const inputs = toSignPsbt.data.inputs.filter((_, i) => inputsToSignProp ? inputsToSignProp.includes(i) : true)
      let inputsToSign: Record<string, number[]> = {}
      const ordinalAddressData: Record<string, number[]> = {
        [address]: [] as number[],
      }
      const paymentsAddressData: Record<string, number[]> = {
        [paymentAddress]: [] as number[],
      }

      let counter = 0
      for await (let input of inputs) {
        if (input.witnessUtxo === undefined) {
          paymentsAddressData[paymentAddress].push(Number(counter))
        } else {
          const { script } = input.witnessUtxo!
          const addressFromScript = fromOutputScript(
            script,
            getBitcoinNetwork(this.network)
          )
          if (addressFromScript === paymentAddress) {
            paymentsAddressData[paymentAddress].push(Number(counter))
          } else if (addressFromScript === address) {
            ordinalAddressData[address].push(Number(counter))
          }
        }

        counter++
      }

      if (ordinalAddressData[address].length > 0) {
        inputsToSign = { ...inputsToSign, ...ordinalAddressData }
      }

      if (paymentsAddressData[paymentAddress].length > 0) {
        inputsToSign = { ...inputsToSign, ...paymentsAddressData }
      }

      let txId, signedPsbtHex, signedPsbtBase64
      let signedPsbt: bitcoin.Psbt | undefined

      const response = await request('signPsbt', {
        psbt: psbtBase64,
        broadcast: !!broadcast,
        signInputs: inputsToSign,
      })

      if (response.status === 'success') {
        signedPsbt = bitcoin.Psbt.fromBase64(response.result.psbt, {
          network: getBitcoinNetwork(this.network),
        })
        txId = response.result.txid
      } else {
        if (response.error.code === RpcErrorCode.USER_REJECTION) {
          throw new Error('User canceled the request')
        } else {
          throw new Error('Error signing psbt')
        }
      }

      if (!signedPsbt) {
        throw new Error('Error signing psbt')
      }

      if (finalize && !txId) {
        signedPsbt!.finalizeAllInputs()
        signedPsbtHex = signedPsbt.toHex()
        signedPsbtBase64 = signedPsbt.toBase64()
      } else {
        signedPsbtHex = signedPsbt.toHex()
        signedPsbtBase64 = signedPsbt.toBase64()
      }

      return {
        signedPsbtHex,
        signedPsbtBase64,
        txId,
      }
    } catch (e) {
      console.error(e)
      throw e
    }
  }
}
