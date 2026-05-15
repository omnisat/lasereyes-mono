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

/**
 * The shape of values that can be passed to a `.extend()` factory without
 * shadowing reserved members of the receiving type.
 *
 * @remarks
 * Mirrors viem's `Extended` / anti-clobber pattern. The `Reserved` type
 * parameter is the union of property keys the receiver wants to protect.
 * Any key in `Reserved` must resolve to `undefined` (i.e. cannot be
 * redeclared with a real value); any other string key is permitted with
 * any value type.
 *
 * **Primary purpose: protect base members from being silently clobbered.**
 * Permitting arbitrary values on non-reserved keys is a deliberate
 * concession that lets users attach state, caches, or auxiliary data
 * alongside method extensions. Per-action *call-site* type safety is
 * enforced separately by action-function generic constraints.
 *
 * @example
 * ```ts
 * extend<TNew extends Extension<'config' | 'extend'>>(
 *   factory: (client: Client<...>) => TNew
 * ): Client<..., Prettify<clientActions & TNew>>
 * ```
 */
export type Extension<Reserved extends PropertyKey> = Prettify<
  { [K in Reserved]?: undefined } & {
    [key: string]: unknown
  }
>

/**
 * Strip an index signature from an object type — only declared keys remain.
 *
 * @remarks
 * When two types that each carry a `[k: string]: AnyFn` index signature
 * (e.g. capability interfaces that `extend ActionGroup`) are intersected,
 * the index signature flows through every position of the resulting type.
 * That makes any string-keyed access return `AnyFn` even if no concrete
 * capability declares the key — masking real precision.
 *
 * `WithoutIndexSig<T>` filters keys where `string extends K` or
 * `number extends K` (the index-signature keys), leaving only the
 * declared property keys behind. Apply it once at the boundary where you
 * need precise property-existence checks (e.g. `MergedCapabilities`).
 *
 * @example
 * ```ts
 * type Leaky = BaseCapability & RuneCapability
 * //   ^? has `[k: string]: AnyFn` so `Leaky['anything']` is `AnyFn`
 *
 * type Strict = WithoutIndexSig<Leaky>
 * //   ^? `'anything' extends keyof Strict` is `false` — only declared
 * //      capability methods remain.
 * ```
 */
export type WithoutIndexSig<T> = {
  [K in keyof T as string extends K ? never : number extends K ? never : K]: T[K]
}

/**
 * Every key of `T` made optional, including `undefined` in the value
 * type so the shape passes under `exactOptionalPropertyTypes`.
 *
 * @remarks
 * Mirrors viem's `ExactPartial`. Use to compose a "you may include any
 * of these keys, but if you do, the value must match" constraint —
 * the construction behind {@link Client.extend}'s shape validation
 * against {@link ExtendableProtectedActions}.
 */
export type ExactPartial<T> = {
  [K in keyof T]?: T[K] | undefined
}

