/**
 * Wallet adapters for normalizing non-conforming providers.
 *
 * @remarks
 * Each adapter translates a wallet's native API to the
 * {@link BitcoinProvider} standard. They're temporary: when a wallet
 * implements the standard natively, its adapter file can be deleted and
 * only its connector remains.
 *
 * @module adapters
 */

export * from './base'
export * from './keplr'
export * from './leather'
export * from './magic-eden'
export * from './okx'
export * from './op-net'
export * from './orange'
export * from './oyl'
export * from './phantom'
export * from './sparrow'
export * from './tokeo'
export * from './unisat'
export * from './xverse'
