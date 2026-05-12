/**
 * Connectors for LaserEyes.
 *
 * @remarks
 * A connector is the lifecycle wrapper around a wallet adapter — it
 * handles connection, disconnection, state queries, network switching,
 * and event delegation. Pass connector factory functions (returned by
 * the helpers below) into {@link createLaserEyesConfig}.
 *
 * For window-injected wallets, prefer {@link injected} or one of the
 * preset factories. For wallets with non-standard discovery, write the
 * factory directly using {@link createConnector}.
 *
 * @module connectors
 */

export { createConnector } from './create'
export type { InjectedConnectorOptions } from './injected'
export { injected } from './injected'

// Per-wallet factories
export { keplr } from './keplr'
export { leather } from './leather'
export { magicEden } from './magic-eden'
export { okx } from './okx'
export { opNet } from './op-net'
export { orange } from './orange'
export { oyl } from './oyl'
export { phantom } from './phantom'
export { sparrow } from './sparrow'
export { tokeo } from './tokeo'
export { binance, unisat, unisatLike, wizz } from './unisat'
export { xverse } from './xverse'
