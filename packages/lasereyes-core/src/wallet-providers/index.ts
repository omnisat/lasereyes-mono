import {
  WALLET_NOT_CONNECTED_ERROR,
  WALLET_NOT_INSTALLED_ERROR,
} from './errors'

export type SignPSBTOptions = {
  transaction: string
  finalize?: boolean
  broadcast?: boolean
  psbtHex?: string
  psbtBase64?: string
}

export type SignPSBTResult = {
  signedPsbtHex: string | undefined
  signedPsbtBase64: string | undefined
  txId?: string | undefined
}

export abstract class WalletProvider {
  readonly label: string
  readonly id: string
  readonly url: string
  readonly icon: string

  constructor({
    label,
    id,
    url,
    icon,
  }: {
    label: string
    id: string
    url: string
    icon: string
  }) {
    this.label = label
    this.id = id
    this.url = url
    this.icon = icon
  }

  protected connected = false
  private _ensureConnected(): void {
    if (!this.connected) {
      throw {
        message: 'Wallet not connected',
        type: WALLET_NOT_CONNECTED_ERROR,
      }
    }
  }

  private _ensureInstalled(): void {
    if (!this.library) {
      throw {
        message: 'Wallet not installed',
        type: WALLET_NOT_INSTALLED_ERROR,
      }
    }
  }

  protected abstract readonly library: any

  readonly eventHandlers: { [event: string]: ((...args: any[]) => void)[] } = {}
  on(event: string, callback: (...args: any[]) => void): void {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = []
    }
    this.eventHandlers[event].push(callback)
  }

  protected emit(event: string, ...args: any[]): void {
    if (!this.eventHandlers[event]) return
    for (const handler of this.eventHandlers[event]) {
      handler(...args)
    }
  }

  off(event: string, callback: (...args: any[]) => void): void {
    if (!this.eventHandlers[event]) return
    this.eventHandlers[event] = this.eventHandlers[event].filter(
      (handler) => handler !== callback
    )
  }

  protected abstract _getNetwork(): Promise<string>
  protected abstract _getBalance(): Promise<bigint>
  protected abstract _getAddresses(): Promise<[string, string]>
  protected abstract _getPublicKeys(): Promise<[string, string]>
  getNetwork(): Promise<string> {
    this._ensureConnected()
    return this._getNetwork()
  }
  getBalance(): Promise<bigint> {
    this._ensureConnected()
    return this._getBalance()
  }
  getAddresses(): Promise<[string, string]> {
    this._ensureConnected()
    return this._getAddresses()
  }
  getPublicKeys(): Promise<[string, string]> {
    this._ensureConnected()
    return this._getPublicKeys()
  }

  private isConnectingPromise: Promise<void> | null = null
  protected abstract _connect(network?: string): Promise<void>
  connect(network?: string): Promise<void> {
    this._ensureInstalled()
    if (this.connected) return Promise.resolve()
    if (!this.isConnectingPromise) {
      this.isConnectingPromise = new Promise((resolve, reject) => {
        this._connect(network)
          .then(() => {
            this.connected = true
            this.isConnectingPromise = null
            resolve()
            this.emit('connect')
          })
          .catch((error) => {
            reject(error)
          })
          .finally(() => {
            this.isConnectingPromise = null
          })
      })
    }
    return this.isConnectingPromise
  }

  protected abstract _disconnect(): Promise<void>
  async disconnect(): Promise<void> {
    if (!this.connected) return
    await this._disconnect()
    this.connected = false
    this.isConnectingPromise = null
    this.emit('disconnect')
  }

  protected abstract _signMessage(
    message: string,
    toSignAddress?: string
  ): Promise<string>
  signMessage(message: string, toSignAddress?: string): Promise<string> {
    this._ensureConnected()
    return this._signMessage(message, toSignAddress)
  }

  protected abstract _signPsbt(
    options: SignPSBTOptions
  ): Promise<SignPSBTResult>
  signPsbt(options: SignPSBTOptions): Promise<SignPSBTResult> {
    this._ensureConnected()
    return this._signPsbt(options)
  }

  protected abstract _pushPsbt(psbt: string): Promise<string>
  pushPsbt(psbt: string): Promise<string> {
    this._ensureConnected()
    return this._pushPsbt(psbt)
  }

  protected abstract _sendBitcoin(to: string, amount: bigint): Promise<string>
  sendBitcoin(to: string, amount: bigint): Promise<string> {
    this._ensureConnected()
    return this._sendBitcoin(to, amount)
  }

  protected abstract _refreshBalance(): Promise<bigint>
  async refreshBalance(): Promise<void> {
    this._ensureConnected()
    const balance = await this._refreshBalance()
    this.emit('balanceChanged', balance)
  }

  protected abstract _switchNetwork(network: string): Promise<void>
  async switchNetwork(network: string): Promise<void> {
    this._ensureConnected()
    await this._switchNetwork(network)
    this.emit('networkChanged', network)
  }
}
