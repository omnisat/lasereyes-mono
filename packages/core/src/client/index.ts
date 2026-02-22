import * as bitcoin from 'bitcoinjs-lib'
import { keepMount, listenKeys, type MapStore, type WritableAtom } from 'nanostores'
import type { ALKANES, BRC20, BTC, RUNES } from '../constants/protocols'
import { LOCAL_STORAGE_DEFAULT_WALLET } from '../constants/settings'
import {
  BINANCE,
  KEPLR,
  LEATHER,
  MAGIC_EDEN,
  OKX,
  OP_NET,
  ORANGE,
  OYL,
  PHANTOM,
  SPARROW,
  TOKEO,
  UNISAT,
  WIZZ,
  XVERSE,
} from '../constants/wallets'
import { DataSourceManager } from '../lib/data-sources/manager'
import { isBase64, isHex } from '../lib/utils'
import type {
  AlkaneSendArgs,
  Brc20SendArgs,
  BTCSendArgs,
  Config,
  ContentType,
  NetworkType,
  Protocol,
  ProviderType,
  RuneSendArgs,
} from '../types'
import AlkanesModule from './modules/alkanes'
import type { WalletProvider } from './providers'
import BinanceProvider from './providers/binance'
import KeplrProvider from './providers/keplr'
import LeatherProvider from './providers/leather'
import MagicEdenProvider from './providers/magic-eden'
import OkxProvider from './providers/okx'
import OpNetProvider from './providers/op-net'
import OrangeProvider from './providers/orange'
import OylProvider from './providers/oyl'
import PhantomProvider from './providers/phantom'
import SparrowProvider from './providers/sparrow'
import TokeoProvider from './providers/tokeo'
import UnisatProvider from './providers/unisat'
import { WizzProvider } from './providers/wizz'
import XVerseProvider from './providers/xverse'
import type {
  LaserEyesSignPsbtOptions,
  LaserEyesSignPsbtsOptions,
  LaserEyesStoreType,
  SignMessageOptions,
  SignPsbtResponse,
  SignPsbtsResponse,
} from './types'
import { triggerDOMShakeHack } from './utils'

/**
 * The main LaserEyes client for managing Bitcoin wallet connections and operations.
 *
 * @remarks
 * Supports 14 wallet providers (Unisat, Xverse, OYL, Magic Eden, OKX, Leather,
 * Phantom, Wizz, Orange, OpNet, Sparrow, Tokeo, Keplr, Binance) and provides a
 * unified API for connecting wallets, signing transactions, sending BTC and
 * meta-protocol tokens, and querying balances.
 *
 * Uses nanostores for reactive state management. Subscribe to `$store` for wallet
 * state changes and `$network` for network changes.
 *
 * @example
 * ```ts
 * const stores = createStores()
 * const config = createConfig({ network: MAINNET })
 * const client = new LaserEyesClient(stores, config)
 * client.initialize()
 * await client.connect(UNISAT)
 * const balance = await client.getBalance()
 * ```
 */
export class LaserEyesClient {
  /** Reactive store holding the current wallet connection state. */
  readonly $store: MapStore<LaserEyesStoreType>
  /** Reactive atom holding the current Bitcoin network. */
  readonly $network: WritableAtom<NetworkType>
  /** Map of wallet provider type to its implementation instance. */
  readonly $providerMap: Partial<Record<ProviderType, WalletProvider>>
  private disposed = false

  /** The data source manager used for blockchain queries (balances, UTXOs, fees, etc.). */
  readonly dataSourceManager: DataSourceManager
  /** Protocol-specific modules for extended functionality. */
  readonly modules: {
    readonly alkanes: AlkanesModule
  }

  /**
   * Disposes the client and all wallet provider instances.
   *
   * @remarks
   * After disposal, the client will refuse new connections. Call this when
   * the client is no longer needed to clean up resources.
   */
  dispose() {
    this.disposed = true
    for (const provider of Object.values(this.$providerMap)) {
      provider.dispose()
    }
  }

  /**
   * Creates a new LaserEyesClient instance.
   *
   * @param stores - The reactive stores created by {@link createStores}.
   * @param stores.$store - The MapStore holding wallet connection state.
   * @param stores.$network - The WritableAtom holding the current network.
   * @param config - Optional configuration for network and data source settings.
   */
  constructor(
    stores: {
      readonly $store: MapStore<LaserEyesStoreType>
      readonly $network: WritableAtom<NetworkType>
    },
    readonly config?: Config
  ) {
    this.$store = stores.$store
    this.$network = stores.$network
    keepMount(this.$store)
    this.$providerMap = {
      [LEATHER]: new LeatherProvider(stores, this, config),
      [MAGIC_EDEN]: new MagicEdenProvider(stores, this, config),
      [OKX]: new OkxProvider(stores, this, config),
      [OP_NET]: new OpNetProvider(stores, this, config),
      [ORANGE]: new OrangeProvider(stores, this, config),
      [OYL]: new OylProvider(stores, this, config),
      [PHANTOM]: new PhantomProvider(stores, this, config),
      [SPARROW]: new SparrowProvider(stores, this, config),
      [TOKEO]: new TokeoProvider(stores, this, config),
      [UNISAT]: new UnisatProvider(stores, this, config),
      [XVERSE]: new XVerseProvider(stores, this, config),
      [WIZZ]: new WizzProvider(stores, this, config),
      [KEPLR]: new KeplrProvider(stores, this, config),
      [BINANCE]: new BinanceProvider(stores, this, config),
    }

    this.modules = {
      alkanes: new AlkanesModule(this),
    }

    try {
      this.dataSourceManager = DataSourceManager.getInstance()
    } catch {
      DataSourceManager.init(config)
      this.dataSourceManager = DataSourceManager.getInstance()
    }
  }

  /**
   * Initializes the client by setting up network listeners and wallet provider detection.
   *
   * @remarks
   * Must be called after construction to begin listening for network changes
   * and to detect available wallet providers via a DOM mutation hack.
   * Automatically reconnects to a previously connected wallet stored in localStorage.
   */
  initialize() {
    this.$network.listen(this.watchNetworkChange.bind(this))

    listenKeys(this.$store, ['isInitializing'], (v, oldValue) => {
      if (this.disposed) {
        return
      }

      if (v.isInitializing !== oldValue.isInitializing)
        return this.handleIsInitializingChanged(v.isInitializing)
    })

    // subscribeKeys(
    //   this.$store,
    //   ['hasProvider'],
    //   this.checkInitializationComplete.bind(this)
    // )

    // Hack to trigger check for wallet providers
    triggerDOMShakeHack(() => {
      this.$store.setKey('isInitializing', false)
      void this.checkNetwork()
    })
  }

  private async checkNetwork() {
    const { provider, isInitializing } = this.$store.get()
    if (!provider || isInitializing) return

    const foundNetwork = await this.getNetwork()
    if (foundNetwork) {
      this.dataSourceManager.updateNetwork(foundNetwork)
      this.$network.set(foundNetwork)
    }
    try {
      if (this.config?.network && this.config.network !== foundNetwork) {
        await this.switchNetwork(this.config.network)
      }
    } catch (e) {
      console.error("Couldn't enforce config network", e)
      this.disconnect()
    }
  }

  private handleIsInitializingChanged(value: boolean) {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      if (!value) {
        const defaultWallet = localStorage?.getItem(LOCAL_STORAGE_DEFAULT_WALLET) as
          | ProviderType
          | undefined
        if (defaultWallet) {
          this.connect(defaultWallet)
        }
      }
    }
  }

  /**
   * Connects to a Bitcoin wallet provider.
   *
   * @remarks
   * Stores the selected wallet in localStorage for automatic reconnection.
   * After connecting, verifies the network matches the configured network and
   * switches if necessary.
   *
   * @param defaultWallet - The wallet provider to connect to (e.g., `UNISAT`, `XVERSE`).
   * @throws Error if the wallet provider is unsupported or the connection fails.
   *
   * @example
   * ```ts
   * await client.connect(UNISAT)
   * console.log(client.$store.get().address) // 'bc1p...'
   * ```
   */
  async connect(defaultWallet: ProviderType) {
    if (this.disposed) {
      console.warn('Client disposed, cannot connect')
      return
    }

    this.$store.setKey('isConnecting', true)
    try {
      localStorage?.setItem(LOCAL_STORAGE_DEFAULT_WALLET, defaultWallet)
      if (!this.$providerMap[defaultWallet]) {
        throw new Error('Unsupported wallet provider')
      }
      const provider = this.$providerMap[defaultWallet]
      const connected = await provider?.connect(defaultWallet)
      if (connected === false) {
        this.$store.setKey('isConnecting', false)
        this.disconnect()
        return
      }
      this.$store.setKey('provider', defaultWallet)
      await this.checkNetwork()
      this.$store.setKey('connected', true)
    } catch (error) {
      console.error('Error during connect:', error)
      this.$store.setKey('isConnecting', false)
      this.disconnect()
      throw error
    } finally {
      this.$store.setKey('isConnecting', false)
    }
  }

  /**
   * Requests account addresses from the connected wallet provider.
   *
   * @returns An array of account addresses, or `undefined` if no provider is connected.
   * @throws Error if no wallet is connected or the wallet does not support this method.
   */
  async requestAccounts() {
    const provider = this.$store.get().provider
    if (!provider) {
      throw new Error('No wallet provider connected')
    }

    // if (!this.$providerMap[this.$store.get().provider!]) {
    //   throw new Error("The connected wallet doesn't support request accounts")
    // }

    try {
      return await this.$providerMap[provider]?.requestAccounts()
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.toLowerCase().includes('not implemented')) {
          throw new Error("The connected wallet doesn't support this method")
        }
      }
      throw error
    }
  }

  /**
   * Disconnects the current wallet and resets all connection state.
   *
   * @remarks
   * Clears address, public key, balance, and connection status from the store.
   * Removes the saved wallet preference from localStorage.
   */
  disconnect() {
    this.$store.set({
      provider: undefined,
      address: '',
      paymentAddress: '',
      publicKey: '',
      paymentPublicKey: '',
      balance: undefined,
      accounts: [],
      connected: false,
      isConnecting: false,
      isInitializing: false,
      hasProvider: this.$store.get().hasProvider,
    })
    localStorage?.removeItem(LOCAL_STORAGE_DEFAULT_WALLET)
  }

  /**
   * Switches the connected wallet to a different Bitcoin network.
   *
   * @param network - The target network to switch to (e.g., `MAINNET`, `TESTNET4`).
   * @throws Error if the connected wallet does not support programmatic network changes.
   *
   * @example
   * ```ts
   * await client.switchNetwork(TESTNET4)
   * ```
   */
  async switchNetwork(network: NetworkType): Promise<void> {
    try {
      const provider = this.$store.get().provider
      if (provider) {
        console.log('switchNetwork', network)
        await this.$providerMap[provider]?.switchNetwork(network)
        this.dataSourceManager.updateNetwork(network)
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.toLowerCase().includes('not implemented')) {
          this.disconnect()
          throw new Error("The connected wallet doesn't support programmatic network changes..")
        }
      }
      throw error
    }
  }

  private watchNetworkChange() {
    this.$store.setKey('balance', undefined)
    this.getBalance()
  }

  /**
   * Returns the current network from the connected wallet provider, or the local network atom value.
   *
   * @returns The current {@link NetworkType}, or `undefined` if the provider cannot determine it.
   */
  async getNetwork() {
    const provider = this.$store.get().provider
    if (provider && this.$providerMap[provider]) {
      return await this.$providerMap[provider]?.getNetwork()
    }

    return this.$network.get()
  }

  /**
   * Sends BTC to a recipient address.
   *
   * @param to - The recipient's Bitcoin address.
   * @param amount - The amount to send in satoshis. Must be a positive integer.
   * @returns The transaction ID string, or `undefined`.
   * @throws Error if amount is invalid, no wallet is connected, or the wallet does not support sending BTC.
   *
   * @example
   * ```ts
   * const txId = await client.sendBTC('bc1q...', 50000)
   * ```
   */
  async sendBTC(to: string, amount: number) {
    if (amount <= 0) throw new Error('Amount must be greater than 0')
    if (!Number.isInteger(amount)) throw new Error('Amount must be an integer')
    const provider = this.$store.get().provider
    if (!provider) throw new Error('No wallet connected')
    if (provider && this.$providerMap[provider]) {
      try {
        return await this.$providerMap[provider]?.sendBTC(to, amount)
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.toLowerCase().includes('not implemented')) {
            throw new Error("The connected wallet doesn't support sending BTC...")
          }
        }
        throw error
      }
    }
    throw new Error('Something went wrong')
  }

  /**
   * Signs a message with the connected wallet.
   *
   * @param message - The message string to sign.
   * @param toSignAddressOrOptions - Either a specific address string to sign with,
   *   or a {@link SignMessageOptions} object for more control (address and signing protocol).
   * @returns The signature string.
   * @throws Error if no wallet is connected or the wallet does not support message signing.
   *
   * @example
   * ```ts
   * const signature = await client.signMessage('Hello, Bitcoin!')
   * ```
   */
  async signMessage(message: string, toSignAddressOrOptions?: string | SignMessageOptions) {
    let options: SignMessageOptions = {}
    if (typeof toSignAddressOrOptions === 'string') {
      options = { toSignAddress: toSignAddressOrOptions }
    } else if (toSignAddressOrOptions) {
      options = toSignAddressOrOptions
    }

    const provider = this.$store.get().provider
    if (!provider) throw new Error('No wallet connected')
    if (provider && this.$providerMap[provider]) {
      try {
        return await this.$providerMap[provider].signMessage(message, options)
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.toLowerCase().includes('not implemented')) {
            throw new Error("The connected wallet doesn't support message signing...")
          }
        }
        throw error
      }
    }
    throw new Error('Something went wrong')
  }

  /**
   * Signs a PSBT (Partially Signed Bitcoin Transaction) with the connected wallet.
   *
   * @remarks
   * Accepts either an options object or positional arguments. The PSBT can be provided
   * as hex or base64 encoded string and will be normalized internally.
   *
   * @param options - A {@link LaserEyesSignPsbtOptions} object with the PSBT and signing options.
   * @returns The signed PSBT in both hex and base64 formats, plus an optional txId if broadcast.
   * @throws Error if no PSBT is provided, the format is invalid, or no wallet is connected.
   *
   * @example
   * ```ts
   * const result = await client.signPsbt({
   *   tx: psbtBase64,
   *   finalize: true,
   *   broadcast: true,
   * })
   * console.log(result?.txId)
   * ```
   */
  async signPsbt(options: LaserEyesSignPsbtOptions): Promise<SignPsbtResponse>
  /**
   * Signs a PSBT using positional arguments.
   *
   * @param tx - The PSBT as a hex or base64 encoded string.
   * @param finalize - Whether to finalize the PSBT after signing. Defaults to `false`.
   * @param broadcast - Whether to broadcast the transaction after signing. Defaults to `false`.
   * @returns The signed PSBT in both hex and base64 formats, plus an optional txId if broadcast.
   */
  async signPsbt(tx: string, finalize?: boolean, broadcast?: boolean): Promise<SignPsbtResponse>
  async signPsbt(arg1: string | LaserEyesSignPsbtOptions, arg2?: boolean, arg3?: boolean) {
    let tx: string
    let finalize: boolean
    let broadcast: boolean
    let inputsToSign: LaserEyesSignPsbtOptions['inputsToSign']

    if (typeof arg1 === 'string') {
      tx = arg1
      finalize = arg2 ?? false
      broadcast = arg3 ?? false
    } else {
      tx = arg1.tx
      finalize = arg1.finalize ?? false
      broadcast = arg1.broadcast ?? false
      inputsToSign = arg1.inputsToSign
    }

    let psbtHex: string
    let psbtBase64: string
    if (!tx) throw new Error('No PSBT provided')
    if (isHex(tx)) {
      psbtBase64 = bitcoin.Psbt.fromHex(tx).toBase64()
      psbtHex = tx
    } else if (isBase64(tx)) {
      psbtBase64 = tx
      psbtHex = bitcoin.Psbt.fromBase64(tx).toHex()
    } else {
      throw new Error('Invalid PSBT format')
    }

    const provider = this.$store.get().provider

    if (provider && this.$providerMap[provider]) {
      try {
        const signedPsbt = await this.$providerMap[provider]?.signPsbt({
          psbtHex,
          psbtBase64,
          tx,
          broadcast,
          finalize,
          inputsToSign,
        })
        return signedPsbt
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.toLowerCase().includes('not implemented')) {
            throw new Error("The connected wallet doesn't support PSBT signing...")
          }
        }
        throw error
      }
    } else {
      // !! Unsure
      throw new Error('No wallet provider connected')
    }
  }

  /**
   * Signs multiple PSBTs in a single batch operation.
   *
   * @param options - A {@link LaserEyesSignPsbtsOptions} object containing the PSBTs array and signing options.
   * @returns An object containing an array of signed PSBTs, each with hex and base64 representations.
   * @throws Error if no PSBTs are provided or no wallet is connected.
   *
   * @example
   * ```ts
   * const result = await client.signPsbts({
   *   psbts: [psbt1Hex, psbt2Hex],
   *   finalize: true,
   * })
   * ```
   */
  async signPsbts(options: LaserEyesSignPsbtsOptions): Promise<SignPsbtsResponse> {
    const { psbts, finalize = false, broadcast = false, inputsToSign } = options

    if (!psbts || psbts.length === 0) {
      throw new Error('No PSBTs provided')
    }

    const provider = this.$store.get().provider

    if (provider && this.$providerMap[provider]) {
      try {
        const result = await this.$providerMap[provider]?.signPsbts({
          psbts,
          finalize,
          broadcast,
          inputsToSign,
        })
        return result
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.toLowerCase().includes('not implemented')) {
            throw new Error("The connected wallet doesn't support PSBT signing...")
          }
        }
        throw error
      }
    } else {
      throw new Error('No wallet provider connected')
    }
  }

  /**
   * Broadcasts a signed PSBT to the Bitcoin network via the connected wallet.
   *
   * @param tx - The signed PSBT or raw transaction to broadcast.
   * @returns The transaction ID, or `undefined` if no wallet is connected.
   * @throws Error if the connected wallet does not support PSBT broadcasting.
   */
  async pushPsbt(tx: string) {
    const provider = this.$store.get().provider
    if (!provider) return
    if (provider && this.$providerMap[provider]) {
      try {
        return await this.$providerMap[provider]?.pushPsbt(tx)
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.toLowerCase().includes('not implemented')) {
            throw new Error("The connected wallet doesn't support PSBT signing...")
          }
        }
        throw error
      }
    }
  }

  /**
   * Creates an ordinal inscription on the Bitcoin blockchain.
   *
   * @param content - The content to inscribe (text, image data, etc.).
   * @param mimeType - The MIME type of the content (e.g., `TEXT_PLAIN`, `IMAGE_PNG`).
   * @param opReturn - Optional OP_RETURN data to include in the transaction.
   * @returns The inscription transaction ID, or `undefined` if no wallet is connected.
   * @throws Error if the connected wallet does not support inscribing.
   */
  async inscribe(content: string, mimeType: ContentType, opReturn?: string) {
    const provider = this.$store.get().provider
    if (!provider) return
    if (provider && this.$providerMap[provider]) {
      try {
        return await this.$providerMap[provider]?.inscribe(
          content,
          mimeType,
          this.dataSourceManager,
          opReturn
        )
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.toLowerCase().includes('not implemented')) {
            throw new Error("The connected wallet doesn't support inscribing...")
          }
        }
        throw error
      }
    }
  }

  /**
   * Sends tokens using a specified Bitcoin protocol (BTC, Runes, BRC-20, or Alkanes).
   *
   * @remarks
   * The `sendArgs` type is inferred from the `protocol` parameter using conditional types,
   * ensuring type-safe arguments for each protocol.
   *
   * @typeParam T - The protocol type, constrained to {@link Protocol}.
   * @param protocol - The protocol to use for the send operation (e.g., `BTC`, `RUNES`, `BRC20`, `ALKANES`).
   * @param sendArgs - Protocol-specific send arguments ({@link BTCSendArgs}, {@link RuneSendArgs},
   *   {@link Brc20SendArgs}, or {@link AlkaneSendArgs}).
   * @returns The transaction ID string, or `undefined` if no wallet is connected.
   * @throws Error if the connected wallet does not support the send operation.
   *
   * @example
   * ```ts
   * const txId = await client.send(RUNES, {
   *   runeId: '840000:1',
   *   fromAddress: 'bc1p...',
   *   toAddress: 'bc1q...',
   *   amount: 1000,
   *   network: MAINNET,
   * })
   * ```
   */
  async send<T extends Protocol>(
    protocol: T,
    sendArgs: T extends typeof BTC
      ? BTCSendArgs
      : T extends typeof RUNES
        ? RuneSendArgs
        : T extends typeof BRC20
          ? Brc20SendArgs
          : T extends typeof ALKANES
            ? AlkaneSendArgs
            : never
  ): Promise<string | undefined> {
    const provider = this.$store.get().provider
    if (!provider) return
    if (provider && this.$providerMap[provider]) {
      try {
        return await this.$providerMap[provider]?.send(protocol, sendArgs)
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.toLowerCase().includes('not implemented')) {
            throw new Error("The connected wallet doesn't support sending stuff...")
          }
        }
        throw error
      }
    }
  }

  /**
   * Retrieves the public key from the connected wallet provider.
   *
   * @returns The public key as a hex string, or `undefined` if no wallet is connected.
   * @throws Error if the connected wallet does not support this method.
   */
  async getPublicKey() {
    const provider = this.$store.get().provider
    if (!provider) return
    if (provider && this.$providerMap[provider]) {
      try {
        return await this.$providerMap[provider]?.getPublicKey()
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.toLowerCase().includes('not implemented')) {
            throw new Error("The connected wallet doesn't support getPublicKey")
          }
        }
        throw error
      }
    }
  }

  /**
   * Fetches the BTC balance from the connected wallet and updates the store.
   *
   * @remarks
   * The balance is also written to `$store.balance` as a `bigint` in satoshis.
   *
   * @returns The balance value, or `undefined` if no wallet is connected.
   * @throws Error if the connected wallet does not support this method.
   */
  async getBalance() {
    const provider = this.$store.get().provider
    if (!provider) return
    if (provider && this.$providerMap[provider]) {
      try {
        const bal = await this.$providerMap[provider].getBalance()
        this.$store.setKey('balance', BigInt(bal))
        return bal
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.toLowerCase().includes('not implemented')) {
            throw new Error("The connected wallet doesn't support getBalance")
          }
        }
        throw error
      }
    }
  }

  /**
   * Fetches meta-protocol token balances (Runes, BRC-20, or Alkanes) from the connected wallet.
   *
   * @param protocol - The meta-protocol to query balances for (e.g., `RUNES`, `BRC20`, `ALKANES`).
   * @returns The token balances, or `undefined` if no wallet is connected.
   * @throws Error if no protocol is provided or the wallet does not support this method.
   */
  async getMetaBalances(protocol: Protocol) {
    const provider = this.$store.get().provider
    if (!provider) return
    if (provider && this.$providerMap[provider]) {
      try {
        if (!protocol) {
          throw new Error('No protocol provided')
        }

        const balances = await this.$providerMap[provider].getMetaBalances(protocol)
        // TODO: Decide if we want to store these balances
        // this.$store.setKey(`${protocol}Balances`, JSON.stringify(balances))
        return balances
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.toLowerCase().includes('not implemented')) {
            throw new Error("The connected wallet doesn't support getBalance")
          }
        }
        throw error
      }
    }
  }

  /**
   * Fetches ordinal inscriptions owned by the connected wallet.
   *
   * @param offset - Optional pagination offset (zero-based).
   * @param limit - Optional maximum number of inscriptions to return.
   * @returns An array of inscriptions, or `undefined` if no wallet is connected.
   * @throws Error if the connected wallet does not support this method.
   */
  async getInscriptions(offset?: number, limit?: number) {
    const provider = this.$store.get().provider
    if (!provider) return
    if (provider && this.$providerMap[provider]) {
      try {
        return await this.$providerMap[provider]?.getInscriptions(offset, limit)
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.toLowerCase().includes('not implemented')) {
            throw new Error("The connected wallet doesn't support this method")
          }
        }
        throw error
      }
    }
  }

  /**
   * Sends one or more ordinal inscriptions to a recipient address.
   *
   * @param inscriptionIds - An array of inscription IDs to send.
   * @param toAddress - The recipient's Bitcoin address.
   * @returns The transaction ID, or `undefined` if no wallet is connected.
   * @throws Error if the connected wallet does not support this method.
   */
  async sendInscriptions(inscriptionIds: string[], toAddress: string) {
    const provider = this.$store.get().provider
    if (!provider) return
    if (provider && this.$providerMap[provider]) {
      try {
        return await this.$providerMap[provider]?.sendInscriptions(inscriptionIds, toAddress)
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.toLowerCase().includes('not implemented')) {
            throw new Error("The connected wallet doesn't support this method")
          }
        }
        throw error
      }
    }
  }
}

export * from './modules'
