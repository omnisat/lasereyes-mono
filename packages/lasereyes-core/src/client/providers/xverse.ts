import * as bitcoin from 'bitcoinjs-lib'
import {
  RpcErrorCode,
  request,
  MessageSigningProtocols,
  AddressPurpose,
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
import { MapStore, WritableAtom, listenKeys } from 'nanostores'
import { persistentMap } from '@nanostores/persistent'
import {
  handleStateChangePersistence,
  keysToPersist,
  PersistedKey,
} from '../utils'
import { normalizeInscription } from '../../lib/data-sources/normalizations'
import { Inscription } from '../../types/lasereyes'

const XVERSE_WALLET_PERSISTENCE_KEY = 'XVERSE_CONNECTED_WALLET_STATE'
export default class XVerseProvider extends WalletProvider {
  constructor(
    stores: {
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

      const response = await request('getAccounts', {
        purposes: [AddressPurpose.Ordinals, AddressPurpose.Payment],
        message: 'Connecting with lasereyes',
      })
      if (response.status === 'success') {
        const foundAddress = findOrdinalsAddress(response.result)
        const foundPaymentAddress = findPaymentAddress(response.result)
        if (!foundAddress || !foundPaymentAddress) {
          throw new Error('Could not find the addresses')
        }
        this.$store.setKey('address', foundAddress.address)
        this.$store.setKey('paymentAddress', foundPaymentAddress.address)
        this.$store.setKey('accounts', [
          foundAddress.address,
          foundPaymentAddress.address,
        ])
        this.$store.setKey('publicKey', String(foundAddress.publicKey))
        this.$store.setKey(
          'paymentPublicKey',
          String(foundPaymentAddress.publicKey)
        )
        if (
          foundAddress.address.startsWith('m') ||
          foundAddress.address.startsWith('n') ||
          foundAddress.address.startsWith('t') ||
          foundAddress.address.startsWith('2')
        ) {
          this.$network.set(TESTNET)
        } else if (
          foundAddress.address.startsWith('bc1') ||
          foundPaymentAddress.address.startsWith('3') ||
          foundPaymentAddress.address.startsWith('1')
        ) {
          this.$network.set(MAINNET)
        }
      } else {
        if (response.error.code === RpcErrorCode.USER_REJECTION) {
          throw new Error(`User canceled lasereyes to ${XVERSE} wallet`)
        } else {
          throw new Error(`Can't lasereyes to ${XVERSE} wallet`)
        }
      }
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

  async getInscriptions(
    offset?: number,
    limit?: number
  ): Promise<Inscription[]> {
    const offsetValue = offset || 0
    const limitValue = limit || 10
    const response = await request('ord_getInscriptions', {
      offset: offsetValue,
      limit: limitValue,
    })

    if (response.status === 'success') {
      const inscriptions = response.result.inscriptions.map((insc) => {
        return normalizeInscription(insc, undefined, this.network)
      })

      console.log(inscriptions)

      return inscriptions as Inscription[]
    } else {
      console.error(response.error)
      throw new Error('Error getting inscriptions')
    }
  }
}

// type XVerseInscription = {
//   inscriptionId: string
//   inscriptionNumber: string
//   collectionName: string
//   contentType: string
//   contentLength: string
//   address: string
//   output: string
//   offset: number
//   postage: number
//   genesisTransaction: string
//   timestamp: number
// }
