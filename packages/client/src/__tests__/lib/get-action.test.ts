/**
 * Tests for `getAction` — the dispatch primitive that backs every
 * composed action's override cascade.
 *
 * @remarks
 * Behaviors locked in here:
 *   1. Implicit lookup by `actionFn.name` succeeds when the client has
 *      a method under that key.
 *   2. Explicit `name` arg is the minifier-safe fallback when
 *      `actionFn.name` is mangled / empty.
 *   3. When the client has neither, dispatch falls through to the free
 *      function with `client` threaded as the first arg.
 *   4. Overrides receive the call args verbatim and their return is
 *      returned unchanged.
 *   5. Implicit-by-name resolution wins over explicit-by-string when
 *      both are present (defends against the "two actions sharing a
 *      string key" bug that motivated `ExtendableProtectedActions`).
 */

import { describe, expect, it, vi } from 'vitest'
import { getAction } from '../../lib/get-action'

describe('getAction', () => {
  it('resolves to client[actionFn.name] when present (implicit lookup)', () => {
    function getFoo(_client: any, x: number) {
      return `free:${x}`
    }
    const override = vi.fn((x: number) => `override:${x}`)
    const client = { getFoo: override, config: {} }

    const action = getAction(client as any, getFoo as any, 'getFoo')
    expect(action(42)).toBe('override:42')
    expect(override).toHaveBeenCalledTimes(1)
    expect(override).toHaveBeenCalledWith(42)
  })

  it('falls back to client[name] when actionFn.name is empty (minifier-safe)', () => {
    // Anonymous arrow → `.name === ''` — viem's minifier-resilience case.
    const anon: any = (_client: any, x: number) => `free:${x}`
    Object.defineProperty(anon, 'name', { value: '' })
    const override = vi.fn((x: number) => `byString:${x}`)
    const client = { signPsbt: override, config: {} }

    const action = getAction(client as any, anon, 'signPsbt')
    expect(action(7)).toBe('byString:7')
    expect(override).toHaveBeenCalledTimes(1)
    expect(override).toHaveBeenCalledWith(7)
  })

  it('falls through to the free function when client has neither key', () => {
    const free = vi.fn((_client: any, x: number) => `free:${x}`)
    const client = { config: {} } as any

    const action = getAction(client, free as any, 'getFoo')
    expect(action(1)).toBe('free:1')
    expect(free).toHaveBeenCalledTimes(1)
    expect(free).toHaveBeenCalledWith(client, 1)
  })

  it('returns the override result unchanged (Promise round-trip)', async () => {
    function getBalance(_c: any, _addr: string): Promise<string> {
      return Promise.resolve('free')
    }
    const client = { getBalance: vi.fn(async () => '12345'), config: {} }

    const action = getAction(client as any, getBalance, 'getBalance')
    await expect(action('bc1q')).resolves.toBe('12345')
  })

  it('forwards every positional arg verbatim to the override', () => {
    function foo(_c: any, _a: number, _b: string, _c2: { x: number }) {
      return 'free'
    }
    const override = vi.fn(() => 'override')
    const client = { foo: override, config: {} } as any

    const action = getAction(client, foo as any, 'foo')
    action(1, 'two', { x: 3 })
    expect(override).toHaveBeenCalledTimes(1)
    expect(override).toHaveBeenCalledWith(1, 'two', { x: 3 })
  })

  it('prefers implicit (actionFn.name) over explicit name when both keys exist', () => {
    // Defense-in-depth: two distinct slots, only the one matching
    // `actionFn.name` should fire. This protects against an old-style
    // accidental collision (two installed methods, dispatch wanting one).
    function getAddressBalance(_c: any, _addr: string) {
      return 'free'
    }
    const correct = vi.fn(() => 'by-name')
    const wrong = vi.fn(() => 'by-string')
    const client = {
      getAddressBalance: correct, // matches `actionFn.name`
      somethingElse: wrong, // matches the explicit `name` arg
      config: {},
    } as any

    const action = getAction(client, getAddressBalance, 'somethingElse')
    expect(action('bc1q')).toBe('by-name')
    expect(correct).toHaveBeenCalledTimes(1)
    expect(wrong).not.toHaveBeenCalled()
  })

  it('falls through to free fn when the slot exists but is not a function', () => {
    function foo(_c: any, x: number) {
      return `free:${x}`
    }
    const client = { foo: 'not a function', config: {} } as any

    const action = getAction(client, foo as any, 'foo')
    expect(action(9)).toBe('free:9')
  })
})
