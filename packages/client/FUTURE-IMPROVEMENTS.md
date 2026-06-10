# Future improvements — `@omnisat/lasereyes-client`

Tracking deferred work whose **type surface is already designed** but is held
back from the public API until the implementation lands. Nothing here is
exported from `package.json` today; each item is scaffolded under `src/` so the
types stay compiled and ready to re-export.

## Protocol actions (deferred)

The protocol action modules live under `src/actions/<proto>/`:

| Protocol      | Module                          | Reads                                             | Writes (stubbed, throw)                          |
| ------------- | ------------------------------- | ------------------------------------------------- | ------------------------------------------------ |
| Runes         | `src/actions/runes`             | `getRuneBalances`, `getRuneById`, `getRuneByName`, `getRuneOutpoints`, `batchGetRuneOutputs` | `sendRune`                                        |
| BRC-20        | `src/actions/brc20`             | `getBrc20Balances`, `getBrc20ByTicker`            | `deployBrc20`, `mintBrc20`, `transferBrc20`      |
| Inscriptions  | `src/actions/inscriptions`      | `getInscriptionsByAddress`, `getInscriptionInfo`, `batchGetInscriptionInfo` | `inscribe`, `sendInscription`                    |
| Alkanes       | `src/actions/alkanes`           | `getAlkaneBalances`, `getAlkanesByAddress`        | `sendAlkane`                                      |

Each module exposes a read factory (`<proto>Actions()`) and a write factory
(`<proto>WriteActions()`). The **read** paths are functional (they wrap backend
capabilities); the **write** paths intentionally `throw '<action>: not
implemented'` — the generic-typed signatures are locked, only the bodies are
pending.

### Why they're not exported yet

Shipping a `/runes`, `/brc20`, `/inscriptions`, or `/alkanes` subpath today
would publish mutation methods that throw at runtime. Rather than ship a
half-implemented surface, the whole protocol surface (reads included) is held
back so consumers don't wire up actions that only partly work.

### Re-introduction plan — **start with runes**

For each protocol, in order — **runes first**, then brc20, inscriptions,
alkanes:

1. Implement the stubbed write bodies in `src/actions/<proto>/index.ts`
   (select outpoints/UTXOs → build PSBT → `signPsbt({ finalize: true })` →
   broadcast). The `@todo` on each stub describes the intended flow.
2. Re-add a barrel `src/<proto>.ts` re-exporting the module (see git history
   for the previous barrels).
3. Re-add the `<proto>/index` entry to `vite.config.ts` `lib.entry`.
4. Re-add the `"./<proto>"` subpath to `package.json` `exports`.
5. Add `expectTypeOf` / `@ts-expect-error` coverage to
   `src/__tests__/type-inference.test-d.ts` per the maintenance discipline in
   the repo-root `MENTAL-MODEL.md` §8 — the read/write factories, ordering
   constraints, and capability/account/signer mismatches.
6. (When the React bindings grow protocol hooks) re-export the matching hooks
   from `@omnisat/lasereyes-react`.

## Notes

- The protocol **domain types** (`RuneBalance`, `Brc20Info`, `Inscription`,
  `AlkaneBalance`, …) and **capability interfaces** (`RuneCapability`, etc.)
  remain exported from the main entry — they're needed to type backends. Only
  the **action factories** are deferred.
