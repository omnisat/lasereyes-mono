
import * as bitcoin from 'bitcoinjs-lib'
import { WalletProvider } from '.'
import { NetworkType, ProviderType } from '../../types'
import { SPARROW } from '../../constants/wallets'
import { listenKeys, MapStore } from 'nanostores'
import { createSendBtcPsbt, getBTCBalance, isMainnetNetwork } from '../../lib/helpers'
import { keysToPersist, PersistedKey } from '../utils'
import { persistentMap } from '@nanostores/persistent'
import { LaserEyesStoreType } from '../types'

let consoleOverridden = false;
function waitForConsoleKey(key: string): Promise<string> {
  return new Promise((resolve) => {
    if (consoleOverridden) {
      console.warn(`Already waiting for console input for "${key}"!`);
      return;
    }

    consoleOverridden = true;
    const originalConsoleLog = console.log;

    console.log = (...args: any[]) => {
      originalConsoleLog.apply(console, args);

      if (args.length > 0 && typeof args[0] === "string") {
        console.log = originalConsoleLog;
        consoleOverridden = false;
        resolve(args[0]);
      }
    };

    originalConsoleLog(`Please log a value for "${key}" using \n console.log('<your-value>') \n to continue.`);
  });
}

const SPARROW_WALLET_PERSISTENCE_KEY = 'SPARROW_CONNECTED_WALLET_STATE'

export default class SparrowProvider extends WalletProvider {
  public get network(): NetworkType {
    return this.$network.get()
  }
  observer?: MutationObserver
  $valueStore: MapStore<Record<PersistedKey, string>> = persistentMap(
    SPARROW_WALLET_PERSISTENCE_KEY,
    {
      address: '',
      paymentAddress: '',
      paymentPublicKey: '',
      publicKey: '',
      balance: '',
    }
  )

  initialize() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      this.observer = new window.MutationObserver(() => {
        this.$store.setKey('hasProvider', {
          ...this.$store.get().hasProvider,
          [SPARROW]: true,
        })
        this.observer?.disconnect()
      })

      this.observer.observe(document, { childList: true, subtree: true })
    }

    listenKeys(this.$store, ['provider'], (newVal) => {
      if (newVal.provider !== SPARROW) {
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


  removeSubscriber?: Function

  watchStateChange(
    newState: LaserEyesStoreType,
    _: LaserEyesStoreType | undefined,
    changedKey: keyof LaserEyesStoreType | undefined
  ) {
    if (changedKey && newState.provider === SPARROW) {
      if (changedKey === 'balance') {
        this.$valueStore.setKey('balance', newState.balance?.toString() ?? '')
      } else if ((keysToPersist as readonly string[]).includes(changedKey)) {
        this.$valueStore.setKey(
          changedKey as PersistedKey,
          newState[changedKey]?.toString() ?? ''
        )
      }
    }
  }

  restorePersistedValues() {
    const vals = this.$valueStore.get()
    for (const key of keysToPersist) {
      this.$store.setKey(key, vals[key])
    }
  }

  dispose() {
    this.observer?.disconnect()
  }


  async connect(_: ProviderType): Promise<void> {
    try {
      const { address: foundAddress, paymentAddress: foundPaymentAddress } = this.$valueStore!.get()
      if (foundAddress && foundPaymentAddress) {
        if (foundAddress.startsWith('tb1') && isMainnetNetwork(this.network)) {
          this.disconnect()
        } else {
          this.restorePersistedValues()
          return
        }
      }

      const address = await waitForConsoleKey("address");
      if (!address) throw new Error("No address provided");

      const paymentAddress = await waitForConsoleKey("paymentAddress");
      if (!paymentAddress) throw new Error("No payment address provided");

      const publicKey = await waitForConsoleKey("publicKey");
      if (!publicKey) throw new Error("No public key provided");

      const paymentPublicKey = await waitForConsoleKey("paymentPublicKey");
      if (!paymentPublicKey) throw new Error("No payment public key provided");

      this.$store.setKey("provider", SPARROW);
      this.$store.setKey("accounts", [address, paymentAddress]);
      this.$store.setKey("address", address);
      this.$store.setKey("paymentAddress", paymentAddress);
      this.$store.setKey("publicKey", publicKey);
      this.$store.setKey("paymentPublicKey", paymentPublicKey);
      this.$store.setKey("connected", true);
    } catch (error) {
      this.disconnect();
      console.error("Error during connect:", error);
    }
  }

  async getNetwork() {
    return this.network
  }

  async sendBTC(to: string, amount: number): Promise<string> {
    const { psbtBase64 } = await createSendBtcPsbt(
      this.$store.get().address,
      this.$store.get().paymentAddress,
      to,
      amount,
      this.$store.get().paymentPublicKey,
      this.network,
      7
    )

    console.log(`sign this send psbt in with sparrow wallet:`)
    console.log('')
    console.log(`${psbtBase64}`)
    console.log('')
    const signedAndFinalizedPsbt = await waitForConsoleKey("signedAndFinalizedPsbt")
    if (!signedAndFinalizedPsbt) throw new Error('No signed PSBT provided');
    const txId = await this.pushPsbt(signedAndFinalizedPsbt)
    if (!txId) throw new Error('send failed, no txid returned');
    return txId
  }

  async signMessage(message: string, _?: string | undefined): Promise<string> {
    console.log(`sign this message in sparrow wallet:`)
    console.log("")
    console.log(`${message}`)
    console.log("")
    return await waitForConsoleKey("message to sign")
  }

  async signPsbt(
    _: string,
    __: string,
    psbtBase64: string,
    finalize?: boolean | undefined,
    broadcast?: boolean | undefined
  ): Promise<
    | {
      signedPsbtHex: string | undefined
      signedPsbtBase64: string | undefined
      txId?: string | undefined
    }
    | undefined
  > {
    const preSigned = bitcoin.Psbt.fromBase64(psbtBase64)
    console.log(`sign this in sparrow wallet:`)
    console.log('')
    console.log(`${psbtBase64}`)
    console.log('')
    const signedPsbt = await waitForConsoleKey("signed psbt hex")

    if (finalize && broadcast) {
      const txId = await this.pushPsbt(signedPsbt)
      return {
        signedPsbtHex: signedPsbt,
        signedPsbtBase64: preSigned.toBase64(),
        txId,
      }
    }

    return {
      signedPsbtHex: signedPsbt,
      signedPsbtBase64: preSigned.toBase64(),
      txId: undefined,
    }
  }

  async getPublicKey() {
    const publicKey = await waitForConsoleKey("publicKey")
    this.$store.setKey('publicKey', publicKey)
    return publicKey
  }
  async getBalance() {
    const bal = await getBTCBalance(
      this.$store.get().paymentAddress,
      this.network
    )
    this.$store.setKey('balance', bal)
    return bal.toString()
  }

  async requestAccounts(): Promise<string[]> {
    await this.connect(SPARROW)
    return this.$store.get().accounts
  }
}
