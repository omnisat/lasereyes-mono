import {
  WalletAPIClient,
  WindowMessageTransport,
} from '@ledgerhq/wallet-api-client'
import { WalletProvider } from '.'
import BigNumber from 'bignumber.js'
import AppClient, { DefaultWalletPolicy } from 'ledger-bitcoin'
import * as bitcoin from 'bitcoinjs-lib'

export function initializeWalletApiClient() {
  const windowMessageTransport = new WindowMessageTransport()
  windowMessageTransport.connect()

  const walletApiClient = new WalletAPIClient(windowMessageTransport)

  return walletApiClient
}

export default class LedgerWalletProvider extends WalletProvider {
  walletApiClient: WalletAPIClient | undefined
  accountId: string | undefined
  initialize(): void {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const client = initializeWalletApiClient()
      this.walletApiClient = client
    }
  }
  dispose(): void {
    throw new Error('Method not implemented.')
  }
  async connect(): Promise<void> {
    if (!this.walletApiClient) {
      throw new Error('WalletApiClient is not initialized')
    }
    const bitcoinAccounts = await this.walletApiClient.account.list({
      currencyIds: ['bitcoin'],
    })
    const account = await this.walletApiClient.account.request({
      currencyIds: ['bitcoin'],
    })
    this.accountId = account.id
    const xPub = await this.walletApiClient.bitcoin.getXPub(account.id)
    this.$store.setKey('address', account.address)
    this.$store.setKey('paymentAddress', account.address)
    this.$store.setKey('publicKey', xPub)
    this.$store.setKey('paymentPublicKey', xPub)
    this.$store.setKey(
      'accounts',
      bitcoinAccounts.map((a) => a.address)
    )
    this.$store.setKey('balance', BigInt(account.balance.toFixed(0)))
  }
  async sendBTC(to: string, amount: number): Promise<string> {
    if (!this.walletApiClient) {
      throw new Error('WalletApiClient is not initialized')
    }
    if (!this.accountId) {
      throw new Error('Account ID is not initialized')
    }

    const transactionHash =
      await this.walletApiClient.transaction.signAndBroadcast(this.accountId!, {
        family: 'bitcoin',
        recipient: to,
        amount: BigNumber(amount),
      })

    return transactionHash
  }
  async signMessage(
    message: string,
    options?: { toSignAddress?: string }
  ): Promise<string> {
    const accountId = options?.toSignAddress
      ? this.$store.get().accounts.find((a) => a === options?.toSignAddress)
      : this.accountId
    if (!accountId) {
      throw new Error('Account ID is not initialized')
    }
    const buffer = Buffer.from(message, 'utf-8')
    const sigBuffer = await this.walletApiClient!.message.sign(
      accountId,
      buffer
    )
    const signature = sigBuffer.toString('base64')
    return signature
  }
  async signPsbt(
    _: string,
    __: string,
    psbtBase64: string
  ): Promise<
    | {
        signedPsbtHex: string | undefined
        signedPsbtBase64: string | undefined
        txId?: string
      }
    | undefined
  > {
    const transport = await this.walletApiClient?.device.transport({})
    if (!transport) {
      throw new Error('Transport is not initialized')
    }
    const psbt = bitcoin.Psbt.fromBase64(psbtBase64)
    const app = new AppClient(transport)
    const fpr = await app.getMasterFingerprint()
    const firstTaprootAccountPubkey = await app.getExtendedPubkey("m/86'/1'/0'")
    const firstTaprootAccountPolicy = new DefaultWalletPolicy(
      'tr(@0/**)',
      `[${fpr}/86'/1'/0']${firstTaprootAccountPubkey}`
    )
    const signatures = await app.signPsbt(
      psbtBase64,
      firstTaprootAccountPolicy,
      null
    )

    for (let signature of signatures) {
      const index = signature[0]
      const partialSig = signature[1]
      if (partialSig.tapleafHash) {
        psbt.updateInput(index, {
          tapScriptSig: [
            {
              pubkey: partialSig.pubkey,
              signature: partialSig.signature,
              leafHash: partialSig.tapleafHash,
            },
          ],
        })
      } else {
        psbt.updateInput(index, {
          partialSig: [
            {
              pubkey: partialSig.pubkey,
              signature: partialSig.signature,
            },
          ],
        })
      }
    }

    return {
      signedPsbtBase64: psbt.toBase64(),
      signedPsbtHex: psbt.toHex(),
    }
  }
}
