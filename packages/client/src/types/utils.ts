/**
 * Internal type utilities.
 *
 * @module types/utils
 * @internal
 */

/**
 * Flattens an intersection of object types so hover-tooltips show the merged
 * record rather than `A & B & C`.
 *
 * @remarks
 * Pure cosmetic — semantically identical to `T`. Apply to any return type
 * that's the result of accumulating intersections via `.extend()`.
 *
 * @example
 * ```ts
 * type Merged = Prettify<{ a: 1 } & { b: 2 } & { c: 3 }>
 * //   ^? { a: 1; b: 2; c: 3 }   instead of { a: 1 } & { b: 2 } & { c: 3 }
 * ```
 */
export type Prettify<T> = { [K in keyof T]: T[K] } & {}
