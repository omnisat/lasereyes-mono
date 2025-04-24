import * as bitcoin from 'bitcoinjs-lib'
import {
  RpcErrorCode,
  request,
  MessageSigningProtocols,
  AddressPurpose,
  BitcoinNetworkType,
  addListener,
} from 'sats-connect'
import { WalletProvider } from '.'
import {
  type ProviderType,
  type NetworkType,
  XVERSE,
  MAINNET,
  TESTNET,
  TESTNET4,
  SIGNET,
  FRACTAL_TESTNET,
  type SignMessageOptions,
  ECDSA,
  type WalletProviderSignPsbtOptions,
  getNetworkForXverse,
  FRACTAL_MAINNET,
} from '../..'
import {
  findOrdinalsAddress,
  findPaymentAddress,
  getBitcoinNetwork,
} from '../../lib/helpers'
// import { normalizeInscription } from '../../lib/data-sources/normalizations'
// import type { Inscription } from '../../types/lasereyes'

const getSatsConnectBitcoinNetwork = (network: NetworkType) => {
  if (network === MAINNET) return BitcoinNetworkType.Mainnet
  if (network === TESTNET) return BitcoinNetworkType.Testnet
  if (network === SIGNET) return BitcoinNetworkType.Signet
  if (network === FRACTAL_TESTNET) return BitcoinNetworkType.Testnet
  if (network === FRACTAL_MAINNET) return BitcoinNetworkType.Mainnet
  if (network === TESTNET4) return BitcoinNetworkType.Testnet4

  return BitcoinNetworkType.Mainnet
}
export default class XVerseProvider extends WalletProvider {
  public get network(): NetworkType {
    return this.$network.get()
  }

  observer?: MutationObserver

  initialize(): void {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      this.observer = new window.MutationObserver(() => {
        const xverseLib = (
          window as unknown as { XverseProviders: { BitcoinProvider: unknown } }
        )?.XverseProviders?.BitcoinProvider
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
    this.removeListeners()
  }

  addListeners() {
    addListener('accountChange', () => {})
    addListener('networkChange', (event) => {
      if (event.type === 'networkChange') {
        this.handleNetworkChanged(event.bitcoin.name)
      }
    })
  }

  removeListeners() {
    console.log('removeListeners')
  }

  // private handleAccountsChanged(accounts: string[]) {
  //   console.log('handleAccountsChanged', accounts)
  //   if (!accounts.length) {
  //     this.parent.disconnect()
  //     return
  //   }

  //   // if (this.$store.get().accounts[0] === accounts[0]) {
  //   //   return
  //   // }

  //   // this.$store.setKey('accounts', accounts)
  //   // if (accounts.length > 0) {
  //   //   this.parent.connect(XVERSE)
  //   // } else {
  //   //   this.parent.disconnect()
  //   // }
  // }
  private handleNetworkChanged(network: string) {
    const foundNetwork = getNetworkForXverse(network)
    this.$network.set(foundNetwork)
    this.parent.connect(XVERSE)
  }

  async connect(_: ProviderType, _forceReconnect = false): Promise<void> {
    // if (address) {
    //   if (address.startsWith('tb1') && isMainnetNetwork(this.network)) {
    //     this.disconnect()
    //   } else {
    //     this.restorePersistedValues()
    //     getBTCBalance(paymentAddress, this.network).then((totalBalance) => {
    //       this.$store.setKey('balance', totalBalance)
    //     })
    //     return
    //   }
    // }

    let foundAddress:
      | {
          purpose: string
          address: string
          publicKey: string
        }
      | undefined
    let foundPaymentAddress:
      | {
          purpose: string
          address: string
          publicKey: string
        }
      | undefined
    let network: string | undefined

    let response

    try {
      if (_forceReconnect) {
        throw new Error('force reconnect')
      }
      response = await request('wallet_getAccount', null)
    } catch (e) {
      if (
        e instanceof Error &&
        (e.message.toLowerCase().includes('failed to get') ||
          e.message.toLowerCase().includes('access denied') ||
          e.message.toLowerCase().includes('force reconnect'))
      ) {
        response = await request('wallet_connect', {
          addresses: [AddressPurpose.Ordinals, AddressPurpose.Payment],
          message: 'Connecting with lasereyes',
        })
      } else {
        console.error(e)
        throw new Error(`Error connecting to ${XVERSE} wallet`)
      }
    }

    if (response.status === 'success') {
      foundAddress = findOrdinalsAddress(response.result.addresses)
      foundPaymentAddress = findPaymentAddress(response.result.addresses)
      network = response.result.network.bitcoin.name
    } else {
      if (response.error.code === RpcErrorCode.USER_REJECTION) {
        throw new Error(`User canceled lasereyes to ${XVERSE} wallet`)
      }
      throw new Error(response.error.message)
    }

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
    if (network) {
      this.$network.set(getNetworkForXverse(network))
    }
  }

  async getNetwork(): Promise<NetworkType | undefined> {
    try {
      const response = await request('wallet_getNetwork', null)
      if (response.status === 'success') {
        return getNetworkForXverse(response.result.bitcoin.name)
      }
      throw new Error('Error getting network')
    } catch (e) {
      return this.network
    }
  }

  async switchNetwork(_network: NetworkType): Promise<void> {
    const response = await request('wallet_changeNetwork', {
      name: getSatsConnectBitcoinNetwork(_network),
    })
    if (response.status === 'success') {
      // TODO: Confirm if this is necessary
      this.handleNetworkChanged(_network)
    } else {
      throw new Error('Error switching network')
    }
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
    }
    if (response.error.code === RpcErrorCode.USER_REJECTION) {
      throw new Error('User rejected the request')
    }
    throw new Error(`Error sending BTC: ${response.error.message}`)
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
    }
    if (response.error.code === RpcErrorCode.USER_REJECTION) {
      throw new Error('User rejected the request')
    }
    throw new Error(`Error signing message: ${response.error.message}`)
  }

  async signPsbt({
    psbtBase64,
    broadcast,
    finalize,
    inputsToSign: inputsToSignProp,
  }: WalletProviderSignPsbtOptions): Promise<
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

      const inputs = toSignPsbt.data.inputs
      let inputsToSign: Record<string, number[]> = {}

      if (inputsToSignProp) {
        inputsToSign = inputsToSignProp.reduce(
          (acc: Record<string, number[]>, input) => ({
            ...acc,
            [input.address]: [...(acc[input.address] || []), input.index],
          }),
          {}
        )
      } else {
        const { address, paymentAddress } = this.$store.get()
        const ordinalAddressData: Record<string, number[]> = {
          [address]: [] as number[],
        }
        const paymentsAddressData: Record<string, number[]> = {
          [paymentAddress]: [] as number[],
        }
        for (const counter of inputs.keys()) {
          const input = inputs[counter]
          if (input.witnessUtxo === undefined) {
            paymentsAddressData[paymentAddress].push(Number(counter))
            continue
          }
          const { script } = input.witnessUtxo
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

        if (ordinalAddressData[address].length > 0) {
          inputsToSign = { ...inputsToSign, ...ordinalAddressData }
        }

        if (paymentsAddressData[paymentAddress].length > 0) {
          inputsToSign = { ...inputsToSign, ...paymentsAddressData }
        }
      }

      let txId: string | undefined
      let signedPsbtHex: string | undefined
      let signedPsbtBase64: string | undefined
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
        }
        throw new Error('Error signing psbt')
      }

      if (!signedPsbt) {
        throw new Error('Error signing psbt')
      }

      if (finalize && !txId) {
        signedPsbt.finalizeAllInputs()
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

  // this is not working
  // TODO: Fix this
  // async getInscriptions(
  //   offset?: number,
  //   limit?: number
  // ): Promise<Inscription[]> {
  //   const offsetValue = offset || 0
  //   const limitValue = limit || 10
  //   const response = await request('ord_getInscriptions', {
  //     offset: offsetValue,
  //     limit: limitValue,
  //   })

  //   if (response.status === 'success') {
  //     const inscriptions = response.result.inscriptions.map((insc) => {
  //       return normalizeInscription(insc, undefined, this.network)
  //     })

  //     console.log(inscriptions)

  //     return inscriptions as Inscription[]
  //   }
  //   console.error(response.error)
  //   throw new Error('Error getting inscriptions')
  // }
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
