export const OYL = 'oyl'
export const UNISAT = 'unisat'
export const XVERSE = 'xverse'
export const PHANTOM = 'phantom'
export const LEATHER = 'leather'
export const MAGIC_EDEN = 'magic-eden'
export const OKX = 'okx'
export const WIZZ = 'wizz'
export const ORANGE = 'orange'
export const OP_NET = 'op_net'

export const P2TR = 'p2tr'
export const P2PKH = 'p2pkh'
export const P2SH_P2WPKH = 'p2sh-p2wpkh'

export const P2WPKH = 'p2wpkh'
export const P2PSH = 'p2psh'
export const P2WSH = 'p2wsh'
export const P2SH = 'p2sh'

enum ProviderEnumMap {
  LEATHER = 'leather',
  MAGIC_EDEN = 'magic-eden',
  OKX = 'okx',
  WIZZ = 'wizz',
  ORANGE = 'orange',
  OYL = 'oyl',
  PHANTOM = 'phantom',
  UNISAT = 'unisat',
  XVERSE = 'xverse',
}

type WalletInfo = {
  [key in ProviderEnumMap]: {
    name: ProviderEnumMap
    url: string
  }
}

export const SUPPORTED_WALLETS: WalletInfo = {
  [ProviderEnumMap.LEATHER]: {
    name: ProviderEnumMap.LEATHER,
    url: 'https://leather.io/install-extension',
  },
  [ProviderEnumMap.MAGIC_EDEN]: {
    name: ProviderEnumMap.MAGIC_EDEN,
    url: 'https://wallet.magiceden.io/',
  },
  [ProviderEnumMap.OKX]: {
    name: ProviderEnumMap.OKX,
    url: 'https://chromewebstore.google.com/detail/okx-wallet/mcohilncbfahbmgdjkbpemcciiolgcge',
  },
  [ProviderEnumMap.ORANGE]: {
    name: ProviderEnumMap.ORANGE,
    url: 'https://www.orangewallet.com/',
  },
  [ProviderEnumMap.OYL]: {
    name: ProviderEnumMap.OYL,
    url: 'https://www.oyl.io/#get-wallet',
  },
  [ProviderEnumMap.PHANTOM]: {
    name: ProviderEnumMap.PHANTOM,
    url: 'https://phantom.app/download',
  },
  [ProviderEnumMap.UNISAT]: {
    name: ProviderEnumMap.UNISAT,
    url: 'https://unisat.io/download',
  },
  [ProviderEnumMap.WIZZ]: {
    name: ProviderEnumMap.WIZZ,
    url: 'https://wizzwallet.io/#extension',
  },
  [ProviderEnumMap.XVERSE]: {
    name: ProviderEnumMap.XVERSE,
    url: 'https://www.xverse.app/download',
  },
}
