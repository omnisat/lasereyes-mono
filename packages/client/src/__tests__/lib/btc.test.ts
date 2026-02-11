import { describe, expect, it } from 'vitest'
import { getAddressScriptPubKey, getAddressType, getRedeemScript } from '../../lib/btc'
import { bytesToHex } from '../../lib/bytes'
import { AddressType } from '../../types/psbt'

describe('getAddressType', () => {
  it('detects P2WPKH address', () => {
    expect(getAddressType('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4')).toBe(AddressType.P2WPKH)
  })

  it('detects P2TR address', () => {
    expect(getAddressType('bc1p5cyxnuxmeuwuvkwfem96lqzszee2t0rnnn80pcp6e3sflg0dmpfql53df4')).toBe(
      AddressType.P2TR
    )
  })

  it('detects P2PKH address', () => {
    expect(getAddressType('1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2')).toBe(AddressType.P2PKH)
  })

  it('detects P2SH address', () => {
    expect(getAddressType('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy')).toBe(AddressType.P2SH_P2WPKH)
  })

  it('returns null for unknown address', () => {
    expect(getAddressType('notanaddress')).toBeNull()
  })
})

describe('getAddressScriptPubKey', () => {
  it('returns correct scriptPubKey for P2WPKH address', () => {
    const scriptPk = getAddressScriptPubKey('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4', 'mainnet')
    expect(bytesToHex(scriptPk)).toBe('0014751e76e8199196d454941c45d1b3a323f1433bd6')
  })
})

describe('getRedeemScript', () => {
  it('returns a Uint8Array for a known pubkey', () => {
    const pubkey = '0279BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798'
    const redeem = getRedeemScript(pubkey, 'mainnet')
    expect(redeem).toBeInstanceOf(Uint8Array)
    expect(redeem!.length).toBeGreaterThan(0)
  })
})
