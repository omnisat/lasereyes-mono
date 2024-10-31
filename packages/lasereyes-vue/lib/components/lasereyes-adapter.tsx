import { useStore } from '@nanostores/vue'
import {
  LEATHER,
  LaserEyesClient,
  MAGIC_EDEN,
  MAINNET,
  NetworkType,
  OKX,
  OYL,
  PHANTOM,
  UNISAT,
  WIZZ,
  XVERSE,
  createConfig,
  createStores,
} from '@omnisat/lasereyes-core'
import { MapStore } from 'nanostores'
import {
  reactive,
  toRefs,
  getCurrentScope,
  onScopeDispose,
  Reactive,
  computed,
} from 'vue'

function useDeepStore<T extends object>(store: MapStore<T>): Reactive<T> {
  const state = reactive<T>(store.get())

  const unsubscribe = store.subscribe((current: any, old: any) => {
    for (const key of Object.keys(current)) {
      if (current[key] === old?.[key]) continue
      ;(state as Reactive<any>)[key] = current[key]
    }
  })

  getCurrentScope() && onScopeDispose(unsubscribe)

  return state
}

const client = new LaserEyesClient(
  createStores(),
  createConfig({ network: MAINNET })
)

export function useLaserEyes() {
  const {
    address,
    paymentAddress,
    publicKey,
    paymentPublicKey,
    accounts,
    balance,
    connected,
    hasProvider,
    isConnecting,
    isInitializing,
    provider,
  } = toRefs(useDeepStore(client.$store))

  const network = useStore(client.$network)

  getCurrentScope() && onScopeDispose(() => client.dispose())

  return {
    paymentAddress,
    address,
    publicKey,
    paymentPublicKey,
    network,
    accounts,
    balance: Number(balance),
    connected,
    isConnecting,
    isInitializing,
    provider,
    hasLeather: computed(() => hasProvider.value[LEATHER] ?? false),
    hasMagicEden: computed(() => hasProvider.value[MAGIC_EDEN] ?? false),
    hasOkx: computed(() => hasProvider.value[OKX] ?? false),
    hasOyl: computed(() => hasProvider.value[OYL] ?? false),
    hasPhantom: computed(() => hasProvider.value[PHANTOM] ?? false),
    hasUnisat: computed(() => hasProvider.value[UNISAT] ?? false),
    hasWizz: computed(() => hasProvider.value[WIZZ] ?? false),
    hasXverse: computed(() => hasProvider.value[XVERSE] ?? false),
    connect: client.connect.bind(client),
    disconnect: client.disconnect.bind(client),
    getBalance: async () =>
      ((await client.getBalance.call(client)) ?? '').toString(),
    getInscriptions: async () =>
      (await client.getInscriptions.call(client)) ?? [],
    getNetwork: client.getNetwork.bind(client),
    getPublicKey: async () => (await client.getPublicKey.call(client)) ?? '',
    pushPsbt: client.pushPsbt.bind(client),
    signMessage: async (message: string, toSignAddress?: string) =>
      (await client.signMessage.call(client, message, toSignAddress)) ?? '',
    requestAccounts: async () =>
      (await client.requestAccounts.call(client)) ?? [],
    sendBTC: async (to: string, amount: number) =>
      (await client.sendBTC.call(client, to, amount)) ?? '',
    signPsbt: async (psbt: string, finalize = false, broadcast = false) =>
      (await client.signPsbt.call(client, psbt, finalize, broadcast)) ?? {
        signedPsbtBase64: '',
        signedPsbtHex: '',
      },
    switchNetwork: async (network: NetworkType) => {
      await client.switchNetwork.call(client, network)
    },
  }
}
