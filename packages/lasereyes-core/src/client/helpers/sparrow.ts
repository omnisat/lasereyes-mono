import { NetworkType, SparrowWalletProvider } from '../..'

const pendingRequests: Record<string, Promise<string> | undefined> = {}
const originalConsoleLog = console.log

function waitForConsoleKey(key: string): Promise<string> {
  if (pendingRequests[key]) {
    console.warn(`Multiple requests for "${key}" detected`)
    return pendingRequests[key]
  }

  const p = new Promise<string>((resolve, reject) => {
    const timeout = setTimeout(() => {
      console.log = originalConsoleLog
      pendingRequests[key] = undefined
      reject(new Error(`Timeout waiting for "${key}" value`))
    }, 60000) // 1 minute timeout

    console.log = (...args: any[]) => {
      //   originalConsoleLog.apply(console, args)

      if (args.length > 0 && typeof args[0] === 'string') {
        clearTimeout(timeout)
        console.log = originalConsoleLog
        pendingRequests[key] = undefined
        resolve(args[0])
      }
    }

    originalConsoleLog(
      `Please log a value for "${key}" using \n console.log('<your-value>') \n to continue.`
    )
  })
  pendingRequests[key] = p
  return p
}

export class DefaultSparrowWalletProvider implements SparrowWalletProvider {
  async requestAccounts(network?: NetworkType): Promise<[string, string]> {
    const address = await waitForConsoleKey('address_' + (network || 'mainnet'))
    if (!address) throw new Error('No address provided')

    const paymentAddress = await waitForConsoleKey('paymentAddress_' + (network || 'mainnet'))
    if (!paymentAddress) throw new Error('No payment address provided')

    return [address, paymentAddress]
  }

  async signMessage(message: string): Promise<string> {
    console.log(`sign this message in sparrow wallet:`)
    console.log('')
    console.log(`${message}`)
    console.log('')
    return await waitForConsoleKey('message to sign')
  }

  async signPsbt(psbtBase64: string): Promise<string> {
    console.log(`sign this in sparrow wallet:`)
    console.log('')
    console.log(`${psbtBase64}`)
    console.log('')
    return await waitForConsoleKey('signed psbt hex')
  }

  async getPublicKey(network?: NetworkType): Promise<string> {
    const publicKey = await waitForConsoleKey('publicKey_' + (network || 'mainnet'))
    if (!publicKey) throw new Error('No public key provided')
    return publicKey
  }

  // TODO: Implement network switching between mainnet and testnet
  async getNetwork(): Promise<NetworkType> {
    return 'mainnet' as NetworkType
  }

  async switchNetwork(_: NetworkType) {
    const [address, paymentAddress] = await this.requestAccounts()
    const publicKey = await this.getPublicKey()
    return { address, paymentAddress, publicKey }
  }
}
