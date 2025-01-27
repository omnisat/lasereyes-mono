import { NetworkType, SparrowWalletProvider } from '../..'

const pendingRequests: Record<string, Promise<string> | undefined> = {}

function waitForConsoleKey(key: string): Promise<string> {
  if (pendingRequests[key]) {
    console.warn(`Multiple requests for "${key}" detected`)
    return pendingRequests[key]
  }

  const p = new Promise<string>((resolve) => {
    const originalConsoleLog = console.log
    console.log = (...args: any[]) => {
      //   originalConsoleLog.apply(console, args)

      if (args.length > 0 && typeof args[0] === 'string') {
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
  async requestAccounts(): Promise<[string, string]> {
    const address = await waitForConsoleKey('address')
    if (!address) throw new Error('No address provided')

    const paymentAddress = await waitForConsoleKey('paymentAddress')
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

  async getPublicKey(): Promise<string> {
    const publicKey = await waitForConsoleKey('publicKey')
    if (!publicKey) throw new Error('No public key provided')
    return publicKey
  }

  // TODO: Implement network switching between mainnet and testnet
  async getNetwork(): Promise<NetworkType> {
    return 'mainnet'
  }

  async switchNetwork(_: NetworkType): Promise<void> {
    return
  }
}
