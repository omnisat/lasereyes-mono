import { describe, expect, it } from 'vitest'
import { createReadOnlyAccount, createWalletAccount } from '../account'
import { AddressType } from '../types/psbt'

describe('createWalletAccount', () => {
  it('should create a wallet account with addresses and public keys', () => {
    const account = createWalletAccount({
      addresses: [
        { address: 'bc1qtest', purpose: 'payment', type: AddressType.P2WPKH },
        { address: 'bc1ptest', purpose: 'ordinals', type: AddressType.P2TR },
      ],
      publicKeys: {
        payment: '02abc',
        ordinals: '03def',
        taproot: '03def',
      },
    })

    expect(account.getAddress()).toBe('bc1qtest') // defaults to payment
    expect(account.getAddress('payment')).toBe('bc1qtest')
    expect(account.getAddress('ordinals')).toBe('bc1ptest')
    expect(account.getPublicKey()).toBe('02abc') // defaults to payment
    expect(account.getPublicKey('payment')).toBe('02abc')
    expect(account.getPublicKey('ordinals')).toBe('03def')
    expect(account.addresses).toHaveLength(2)
  })

  it('should throw if no payment address provided', () => {
    expect(() =>
      createWalletAccount({
        addresses: [{ address: 'bc1ptest', purpose: 'ordinals', type: AddressType.P2TR }],
        publicKeys: {
          payment: '02abc',
          ordinals: '03def',
          taproot: '03def',
        },
      })
    ).toThrow('must have a payment address')
  })

  it('should throw if public key missing for address purpose', () => {
    expect(() =>
      createWalletAccount({
        addresses: [{ address: 'bc1qtest', purpose: 'payment', type: AddressType.P2WPKH }],
        publicKeys: {
          ordinals: '03def',
          taproot: '03def',
        } as any,
      })
    ).toThrow('Missing public key for address purpose: payment')
  })

  it('should throw if requesting non-existent address purpose', () => {
    const account = createWalletAccount({
      addresses: [{ address: 'bc1qtest', purpose: 'payment', type: AddressType.P2WPKH }],
      publicKeys: {
        payment: '02abc',
        ordinals: '03def',
        taproot: '03def',
      },
    })

    expect(() => account.getAddress('ordinals')).toThrow('No address found for purpose: ordinals')
  })

  it('should return public key even if address not present', () => {
    // Public keys can exist without addresses (e.g., derivation from seed)
    const account = createWalletAccount({
      addresses: [{ address: 'bc1qtest', purpose: 'payment', type: AddressType.P2WPKH }],
      publicKeys: {
        payment: '02abc',
        ordinals: '03def',
        taproot: '03def',
      },
    })

    // Public key exists even though ordinals address isn't in addresses array
    expect(account.getPublicKey('ordinals')).toBe('03def')
  })
})

describe('createReadOnlyAccount', () => {
  it('should create a read-only account', () => {
    const account = createReadOnlyAccount({
      addresses: [{ address: 'bc1qtest', purpose: 'payment', type: AddressType.P2WPKH }],
    })

    expect(account.getAddress()).toBe('bc1qtest')
    expect(account.getAddress('payment')).toBe('bc1qtest')
    expect(account.readOnly).toBe(true)
    expect(account.addresses).toHaveLength(1)
  })

  it('should throw if no payment address provided', () => {
    expect(() =>
      createReadOnlyAccount({
        addresses: [{ address: 'bc1ptest', purpose: 'ordinals', type: AddressType.P2TR }],
      })
    ).toThrow('must have a payment address')
  })

  it('should throw if requesting non-existent address purpose', () => {
    const account = createReadOnlyAccount({
      addresses: [{ address: 'bc1qtest', purpose: 'payment', type: AddressType.P2WPKH }],
    })

    expect(() => account.getAddress('ordinals')).toThrow('No address found for purpose: ordinals')
  })
})
