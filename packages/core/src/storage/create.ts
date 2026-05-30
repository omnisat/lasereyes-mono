/**
 * Storage abstraction for persisting LaserEyes state across sessions.
 *
 * @remarks
 * The default storage wraps `localStorage`, but the abstraction lets you
 * plug in alternatives (Tauri, Electron, React Native, server-side
 * memory, …) without changing call sites.
 *
 * @module storage/create
 */

/**
 * The minimal storage contract LaserEyes requires.
 */
export interface Storage {
  /** Read a value by key. Returns `null` when the key is unset. */
  getItem(key: string): string | null
  /** Write a value. */
  setItem(key: string, value: string): void
  /** Remove a value. */
  removeItem(key: string): void
}

/**
 * Configuration for {@link createStorage}.
 */
export interface CreateStorageOptions {
  /**
   * Key prefix applied to every read/write. Defaults to `'lasereyes.'`.
   *
   * @remarks
   * Lets multiple LaserEyes instances coexist in one browser without
   * stomping each other's persisted state.
   */
  key?: string
  /**
   * The underlying storage implementation. Defaults to `globalThis.localStorage`
   * when available, otherwise an in-memory fallback (suitable for SSR and tests).
   */
  storage?: Storage
}

/**
 * In-memory storage shim — used when no `localStorage` is present (SSR, tests).
 */
function createMemoryStorage(): Storage {
  const data = new Map<string, string>()
  return {
    getItem: k => data.get(k) ?? null,
    setItem: (k, v) => {
      data.set(k, v)
    },
    removeItem: k => {
      data.delete(k)
    },
  }
}

/**
 * Build a key-prefixed {@link Storage} wrapper.
 *
 * @example
 * ```ts
 * const storage = createStorage({ key: 'my-app.lasereyes.' })
 * storage.setItem('lastConnector', 'unisat')
 * // → writes 'my-app.lasereyes.lastConnector' to localStorage
 * ```
 */
export function createStorage(options: CreateStorageOptions = {}): Storage {
  const prefix = options.key ?? 'lasereyes.'
  const inner =
    options.storage ??
    (typeof globalThis !== 'undefined' && 'localStorage' in globalThis
      ? (globalThis as { localStorage: Storage }).localStorage
      : createMemoryStorage())

  return {
    getItem: k => inner.getItem(prefix + k),
    setItem: (k, v) => inner.setItem(prefix + k, v),
    removeItem: k => inner.removeItem(prefix + k),
  }
}
