export type NetworkType = 'testnet' | 'testnet4' | 'livenet' | 'mainnet' | 'signet' | 'bitcoin';

export interface NetworkItem {
  type: string;
  network: NetworkType;
}

export const NETWORKS: { [key: string]: NetworkItem } = {
  mainnet: {
    type: 'livenet',
    network: 'bitcoin',
  },
  testnet: {
    type: 'testnet',
    network: 'testnet',
  },
  testnet4: {
    type: 'testnet4',
    network: 'testnet',
  },
  signet: {
    type: 'signet',
    network: 'testnet',
  },
};

export enum AddressType {
  P2PKH,
  P2WPKH,
  P2TR,
  P2SH_P2WPKH,
}

export function getAddressType(address: string): [AddressType, NetworkType] {
  if (address.startsWith('bc1q')) {
    return [AddressType.P2WPKH, 'mainnet'];
  } else if (address.startsWith('bc1p')) {
    return [AddressType.P2TR, 'mainnet'];
  } else if (address.startsWith('1')) {
    return [AddressType.P2PKH, 'mainnet'];
  } else if (address.startsWith('3')) {
    return [AddressType.P2SH_P2WPKH, 'mainnet'];
  }
  // testnet
  else if (address.startsWith('tb1q')) {
    return [AddressType.P2WPKH, 'testnet'];
  } else if (address.startsWith('m') || address.startsWith('n')) {
    return [AddressType.P2PKH, 'testnet'];
  } else if (address.startsWith('2')) {
    return [AddressType.P2SH_P2WPKH, 'testnet'];
  } else if (address.startsWith('tb1p')) {
    return [AddressType.P2TR, 'testnet'];
  }
  throw new Error(`Unknown address: ${address}`);
}
