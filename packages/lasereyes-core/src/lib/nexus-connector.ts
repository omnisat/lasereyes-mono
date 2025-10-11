/**
 * NexusConnector - Internal Bitcoin Wallet Connector
 * 
 * Replaces external sats-connect dependency for Xverse and Magic Eden wallets.
 * This implementation provides the exact same API as sats-connect but removes
 * the external dependency, reducing bundle size and improving reliability.
 * 
 * Supports:
 * - Xverse Wallet (via XverseProviders.BitcoinProvider)
 * - Magic Eden Wallet (via magicEden.bitcoin with JWT tokens)
 * 
 * @author LaserEyes Team
 * @version 1.0.0
 */

// ============= TYPES =============

export interface AddressPurposeType {
  Payment: 'payment'
  Ordinals: 'ordinals'
  Stacks: 'stacks'
}

export interface MessageSigningProtocolsType {
  BIP322: 'BIP322'
  ECDSA: 'ECDSA'
}

export interface BitcoinNetworkTypeType {
  Mainnet: 'Mainnet'
  Testnet: 'Testnet'
  Signet: 'Signet'
  Regtest: 'Regtest'
}

export interface RpcErrorCodeType {
  USER_REJECTION: 4001
  UNAUTHORIZED: 4100
  UNSUPPORTED_METHOD: 4200
  DISCONNECTED: 4900
  CHAIN_DISCONNECTED: 4901
}

// Magic Eden specific interfaces
export interface GetAddressOptions {
  purposes?: string[]
  message?: string
  onFinish?: (response: { addresses: any[] }) => void
  onError?: () => void
  onCancel?: () => void
}

export interface SignMessageOptions {
  payload?: {
    message: string
    address: string
    protocol?: string
  }
  onFinish?: (response: { signature: string }) => void
  onError?: () => void
  onCancel?: () => void
}

export interface SignTransactionOptions {
  payload?: {
    psbtBase64: string
    inputsToSign?: any[]
    broadcast?: boolean
  }
  onFinish?: (response: { psbtBase64: string; txid?: string }) => void
  onError?: () => void
  onCancel?: () => void
}

export interface SendBtcTransactionOptions {
  payload?: {
    recipients: any[]
  }
  onFinish?: (response: { txid: string }) => void
  onError?: () => void
  onCancel?: () => void
}

// ============= CONSTANTS =============

export const AddressPurpose: AddressPurposeType = {
  Payment: 'payment',
  Ordinals: 'ordinals',
  Stacks: 'stacks'
}

export const MessageSigningProtocols: MessageSigningProtocolsType = {
  BIP322: 'BIP322',
  ECDSA: 'ECDSA'
}

export const BitcoinNetworkType: BitcoinNetworkTypeType = {
  Mainnet: 'Mainnet',
  Testnet: 'Testnet',
  Signet: 'Signet',
  Regtest: 'Regtest'
}

export const RpcErrorCode: RpcErrorCodeType = {
  USER_REJECTION: 4001,
  UNAUTHORIZED: 4100,
  UNSUPPORTED_METHOD: 4200,
  DISCONNECTED: 4900,
  CHAIN_DISCONNECTED: 4901
}

// ============= JWT TOKEN UTILITIES =============

function base64URLEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

export function createUnsecuredToken(payload: any): string {
  const header = { alg: 'none', typ: 'JWT' }
  const encodedHeader = base64URLEncode(JSON.stringify(header))
  const encodedPayload = base64URLEncode(JSON.stringify(payload))
  return `${encodedHeader}.${encodedPayload}.`
}

// ============= WALLET DETECTION =============

declare global {
  interface Window {
    XverseProviders?: {
      BitcoinProvider: any
    }
    magicEden?: {
      bitcoin: any
    }
  }
}

// ============= CORE FUNCTIONS =============

/**
 * Make a request to the Xverse wallet
 * @param method - The RPC method to call
 * @param params - Parameters for the method
 * @returns Promise with the response
 */
export async function request(method: string, params?: any): Promise<any> {
  if (typeof window === 'undefined' || !window.XverseProviders?.BitcoinProvider) {
    throw new Error('Xverse wallet not found')
  }
  
  const provider = window.XverseProviders.BitcoinProvider
  
  try {
    const response = await provider.request(method, params)
    return response
  } catch (error: any) {
    throw new Error(`Xverse request failed: ${error.message}`)
  }
}

/**
 * Add an event listener to the Xverse wallet
 * @param event - Event name to listen for
 * @param callback - Callback function
 */
export function addListener(event: string, callback: Function): void {
  if (typeof window === 'undefined' || !window.XverseProviders?.BitcoinProvider) {
    console.warn('Xverse wallet not found for addListener')
    return
  }
  
  const provider = window.XverseProviders.BitcoinProvider
  if (provider.on) {
    provider.on(event, callback)
  }
}

/**
 * Get addresses from Magic Eden wallet
 * @param options - Configuration options
 * @returns Promise with addresses
 */
export async function getAddress(options: GetAddressOptions): Promise<any> {
  if (typeof window === 'undefined' || !window.magicEden?.bitcoin) {
    throw new Error('Magic Eden wallet not found')
  }
  
  const provider = window.magicEden.bitcoin
  
  const payload = {
    purposes: options.purposes || ['payment', 'ordinals'],
    message: options.message || 'Connect to view your Bitcoin addresses',
    network: { type: 'Mainnet' }
  }
  
  const token = createUnsecuredToken(payload)
  
  try {
    const response = await provider.connect(token)
    
    if (options.onFinish && response?.addresses) {
      options.onFinish({ addresses: response.addresses })
    }
    
    return response
  } catch (error) {
    if (options.onError) {
      options.onError()
    }
    throw error
  }
}

/**
 * Sign a message with either Xverse or Magic Eden wallet
 * @param options - Sign message options
 * @returns Promise with signature
 */
export async function signMessage(options: SignMessageOptions): Promise<any> {
  const { message, address, protocol = 'BIP322' } = options.payload || options
  
  // Try Magic Eden first
  if (typeof window !== 'undefined' && window.magicEden?.bitcoin) {
    const provider = window.magicEden.bitcoin
    const token = createUnsecuredToken({ message, address, protocol })
    
    try {
      const response = await provider.signMessage(token)
      if (options.onFinish) {
        options.onFinish(response)
      }
      return response
    } catch (error) {
      if (options.onError) {
        options.onError()
      }
      throw error
    }
  }
  
  // Try Xverse
  if (typeof window !== 'undefined' && window.XverseProviders?.BitcoinProvider) {
    const provider = window.XverseProviders.BitcoinProvider
    
    try {
      const response = await provider.request('signMessage', {
        address, 
        message, 
        protocol
      })
      
      if (options.onFinish && response.status === 'success') {
        options.onFinish({ signature: response.result.signature })
      }
      
      return response
    } catch (error) {
      if (options.onError) {
        options.onError()
      }
      throw error
    }
  }
  
  throw new Error('No compatible wallet found (Xverse or Magic Eden required)')
}

/**
 * Sign a transaction with either Xverse or Magic Eden wallet
 * @param options - Sign transaction options
 * @returns Promise with signed transaction
 */
export async function signTransaction(options: SignTransactionOptions): Promise<any> {
  const { psbtBase64, inputsToSign, broadcast = false } = options.payload || options
  
  // Try Magic Eden first
  if (typeof window !== 'undefined' && window.magicEden?.bitcoin) {
    const provider = window.magicEden.bitcoin
    const token = createUnsecuredToken({ psbtBase64, inputsToSign, broadcast })
    
    try {
      const response = await provider.signTransaction(token)
      if (options.onFinish) {
        options.onFinish(response)
      }
      return response
    } catch (error) {
      if (options.onError) {
        options.onError()
      }
      throw error
    }
  }
  
  // Try Xverse
  if (typeof window !== 'undefined' && window.XverseProviders?.BitcoinProvider) {
    const provider = window.XverseProviders.BitcoinProvider
    
    try {
      const response = await provider.request('signPsbt', {
        psbt: { psbtBase64, inputsToSign, broadcast }
      })
      
      if (options.onFinish && response.status === 'success') {
        options.onFinish({
          psbtBase64: response.result.psbtBase64,
          txid: response.result.txid
        })
      }
      
      return response
    } catch (error) {
      if (options.onError) {
        options.onError()
      }
      throw error
    }
  }
  
  throw new Error('No compatible wallet found (Xverse or Magic Eden required)')
}

/**
 * Send a Bitcoin transaction with either Xverse or Magic Eden wallet
 * @param options - Send transaction options
 * @returns Promise with transaction ID
 */
export async function sendBtcTransaction(options: SendBtcTransactionOptions): Promise<any> {
  const { recipients } = options.payload || options
  
  // Try Magic Eden first
  if (typeof window !== 'undefined' && window.magicEden?.bitcoin) {
    const provider = window.magicEden.bitcoin
    const token = createUnsecuredToken({ recipients })
    
    try {
      const response = await provider.sendBtcTransaction(token)
      if (options.onFinish) {
        options.onFinish(response)
      }
      return response
    } catch (error) {
      if (options.onError) {
        options.onError()
      }
      throw error
    }
  }
  
  // Try Xverse
  if (typeof window !== 'undefined' && window.XverseProviders?.BitcoinProvider) {
    const provider = window.XverseProviders.BitcoinProvider
    
    try {
      const response = await provider.request('sendTransfer', { recipients })
      
      if (options.onFinish && response.status === 'success') {
        options.onFinish({ txid: response.result.txid })
      }
      
      return response
    } catch (error) {
      if (options.onError) {
        options.onError()
      }
      throw error
    }
  }
  
  throw new Error('No compatible wallet found (Xverse or Magic Eden required)')
}

// ============= DEFAULT EXPORT =============

export default {
  createUnsecuredToken,
  request,
  addListener,
  getAddress,
  signMessage,
  signTransaction,
  sendBtcTransaction,
  AddressPurpose,
  MessageSigningProtocols,
  BitcoinNetworkType,
  RpcErrorCode
}