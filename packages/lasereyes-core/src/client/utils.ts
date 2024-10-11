import { MapStore, WritableAtom, atom, map } from "nanostores";
import {
  TESTNET,
  TESTNET4,
  SIGNET,
  FRACTAL_TESTNET,
  MAINNET,
  FRACTAL_MAINNET,
} from "../constants/networks";
import { LEATHER, MAGIC_EDEN, OKX, OYL, PHANTOM, UNISAT, WIZZ, XVERSE, ORANGE } from "../constants/wallets";
import { NetworkType, ProviderType } from "../types";
import { LaserEyesStoreType } from "./types";

export function triggerDOMShakeHack() {
  setTimeout(() => {
    const node = document.createTextNode(" ");
    document.body.appendChild(node);
    node.remove();
  }, 1500);
}

export function hasWallet(provider: ProviderType, network: NetworkType) {
  switch (provider) {
    case UNISAT:
      const unisatLib = (window as any)?.unisat;
      return !!unisatLib;
    case XVERSE:
      return !!(window as any)?.XverseProviders?.BitcoinProvider;
    case OYL:
      return !!(window as any)?.oyl;
    case MAGIC_EDEN:
      return !!(window as any)?.magicEden;
    case OKX:
      let foundOkx;
      if (
        network === TESTNET ||
        network === TESTNET4 ||
        network === SIGNET ||
        network === FRACTAL_TESTNET
      ) {
        foundOkx = (window as any)?.okxwallet?.bitcoinTestnet;
      } else if (network === MAINNET || network === FRACTAL_MAINNET) {
        foundOkx = (window as any)?.okxwallet?.bitcoin;
      }
      return foundOkx;
    case LEATHER:
      return !!(window as any)?.LeatherProvider;
    case PHANTOM:
      const phantomLib = (window as any)?.phantom?.bitcoin;
      return phantomLib && phantomLib.isPhantom;
    case WIZZ:
      return !!(window as any)?.wizz;
    default:
  }
  return false;
}

export function createStores(): {
  $store: MapStore<LaserEyesStoreType>;
  $network: WritableAtom<NetworkType>;
  $library: WritableAtom;
} {
  return {
    $store: map<LaserEyesStoreType>({
      provider: undefined,
      address: "",
      paymentAddress: "",
      publicKey: "",
      paymentPublicKey: "",
      connected: false,
      isConnecting: false,
      isInitializing: true,
      accounts: [],
      balance: undefined,
      hasProvider: {
        [UNISAT]: false,
        [XVERSE]: false,
        [OYL]: false,
        [MAGIC_EDEN]: false,
        [OKX]: false,
        [LEATHER]: false,
        [PHANTOM]: false,
        [WIZZ]: false,
        [ORANGE]: false,
      },
    }),
    $network: atom(MAINNET),
    $library: atom(undefined),
  };
}

export function createConfig({ network }: { network: NetworkType }) {
  return {
    network,
  };
}
