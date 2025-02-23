import * as bitcoin from 'bitcoinjs-lib'
import {
  GetAddressOptions,
  RpcErrorCode,
  getAddress,
  request,
  MessageSigningProtocols,
  BitcoinNetworkType,
} from 'sats-connect'
import { WalletProvider } from '.'
import {
  ProviderType,
  NetworkType,
  XVERSE,
  MAINNET,
  TESTNET,
  TESTNET4,
  SIGNET,
  FRACTAL_TESTNET,
  LaserEyesStoreType,
  SignMessageOptions,
  ECDSA,
  LaserEyesClient,
  Config,
} from '../..'
import {
  findOrdinalsAddress,
  findPaymentAddress,
  getBTCBalance,
  getBitcoinNetwork,
  isMainnetNetwork,
} from '../../lib/helpers'
import { getSatsConnectNetwork } from '../../constants/networks'
import { MapStore, WritableAtom, listenKeys } from 'nanostores'
import { persistentMap } from '@nanostores/persistent'
import {
  handleStateChangePersistence,
  keysToPersist,
  PersistedKey,
} from '../utils'
import { BaseNetwork } from '../../types/network'

const XVERSE_WALLET_PERSISTENCE_KEY = 'XVERSE_CONNECTED_WALLET_STATE'
export default class XVerseProvider extends WalletProvider {
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
    return (window as any)?.BitcoinProvider
  }

  public get network(): NetworkType {
    return this.$network.get()
  }

  observer?: MutationObserver
  $valueStore: MapStore<Record<PersistedKey, string>> = persistentMap(
    XVERSE_WALLET_PERSISTENCE_KEY,
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
    handleStateChangePersistence(XVERSE, newState, changedKey, this.$valueStore)
  }

  initialize(): void {
    listenKeys(this.$store, ['provider'], (newVal) => {
      if (newVal.provider !== XVERSE) {
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
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      this.observer = new window.MutationObserver(() => {
        const xverseLib = (window as any)?.XverseProviders?.BitcoinProvider
        if (xverseLib) {
          this.$store.setKey('hasProvider', {
            ...this.$store.get().hasProvider,
            [XVERSE]: true,
          })
          this.observer?.disconnect()
        }
      })
      this.observer.observe(document, { childList: true, subtree: true })
    }
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
          this.restorePersistedValues()
          getBTCBalance(paymentAddress, this.network).then((totalBalance) => {
            this.$store.setKey('balance', totalBalance)
          })
          return
        }
      }

      let xverseNetwork = getSatsConnectNetwork(this.network || BaseNetwork.MAINNET)
      const getAddressOptions = {
        payload: {
          purposes: ['ordinals', 'payment'],
          message: 'Connecting with lasereyes',
          network: {
            type: xverseNetwork as unknown as BitcoinNetworkType,
          },
        },
        onFinish: (response: any) => {
          const foundAddress = findOrdinalsAddress(response.addresses)
          const foundPaymentAddress = findPaymentAddress(response.addresses)
          if (!foundAddress || !foundPaymentAddress) {
            throw new Error('Could not find the addresses')
          }
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
          throw new Error(`User canceled lasereyes to ${XVERSE} wallet`)
        },
        onError: (_: any) => {
          throw new Error(`Can't lasereyes to ${XVERSE} wallet`)
        },
      }
      await getAddress(getAddressOptions as GetAddressOptions)
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
    const response = await request('sendTransfer', {
      recipients: [
        {
          address: to,
          amount: amount,
        },
      ],
    })
    if (response.status === 'success') {
      return response.result.txid
    } else {
      if (response.error.code === RpcErrorCode.USER_REJECTION) {
        throw new Error('User rejected the request')
      } else {
        throw new Error('Error sending BTC: ' + response.error.message)
      }
    }
  }

  async signMessage(
    message: string,
    { toSignAddress, protocol }: SignMessageOptions
  ): Promise<string> {
    const tempAddy = toSignAddress || this.$store.get().paymentAddress
    const response = await request('signMessage', {
      address: tempAddy,
      message,
      protocol:
        protocol === ECDSA
          ? MessageSigningProtocols.ECDSA
          : MessageSigningProtocols.BIP322,
    })

    if (response.status === 'success') {
      return response.result.signature as string
    } else {
      if (response.error.code === RpcErrorCode.USER_REJECTION) {
        throw new Error('User rejected the request')
      } else {
        throw new Error('Error signing message: ' + response.error.message)
      }
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
    try {
      const toSignPsbt = bitcoin.Psbt.fromBase64(String(psbtBase64), {
        network: getBitcoinNetwork(this.network),
      })

      const address = this.$store.get().address
      const paymentAddress = this.$store.get().paymentAddress

      const inputs = toSignPsbt.data.inputs
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
          const addressFromScript = bitcoin.address.fromOutputScript(
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

      if (_finalize && !txId) {
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

  async getInscriptions(offset?: number, limit?: number): Promise<any[]> {
    const offsetValue = offset || 0
    const limitValue = limit || 10
    const response = await request('ord_getInscriptions', {
      offset: offsetValue,
      limit: limitValue,
    })

    if (response.status === 'success') {
      console.log(response.result)
      return response.result.inscriptions
    } else {
      console.error(response.error)
      throw new Error('Error getting inscriptions')
    }
  }
}
