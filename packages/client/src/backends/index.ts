/**
 * Chain backends — composable primitives plus the bundled vendor factories.
 *
 * @remarks
 * This is the one-stop entry for assembling backends:
 * - The composable primitives ({@link createChainBackend},
 *   {@link mergeChainBackends}, {@link combineBackends}) and the capability
 *   contracts vendors implement.
 * - The bundled vendor factories — {@link mempool}, {@link sandshrew},
 *   {@link maestro} — lazy {@link ChainBackendFactory}s for use in
 *   `createLaserEyesConfig({ backends })`.
 *
 * Each vendor's eager `createBackend` and per-capability factories are not
 * re-exported here; they live on the vendor's own subpath
 * (`@omnisat/lasereyes-client/backends/<name>`).
 *
 * @module backends
 */

export type { MaestroConfig } from './maestro'
export { maestro } from './maestro'
export type { MempoolConfig } from './mempool'
// Bundled vendor backends — lazy, network-parameterized factories.
export { mempool } from './mempool'
// Composable primitives + capability contracts.
export * from './primitives'
export type { SandshrewConfig } from './sandshrew'
export { sandshrew } from './sandshrew'
