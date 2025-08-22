# @kevinoyl/lasereyes-core

## 0.0.84

### Patch Changes

- opreturn opcode

## 0.0.83

### Patch Changes

- 6a0ad55: integrate tokeo wallet with deep-linking into app if possible
- d39bb4a: re-add config setting in WalletProvider
- 3293c46: Fix Oyl network issues.
- 286bffc: add integration test for maestro
- 16111da: sieve for oylnet
- 0ec77d8: fix unisat logo
- 21f1ab5: fix get inscriptions for maestro with cursor / count
- opreturn fix
- 1bc4f34: ---
- f227c55: new newwwww
- 2271bd8: fix network initialization, thanks jon
- 6421b55: Added UTXO formatting to datasource manager
- 8cb3dd8: Integrate Keplr wallet (browser extension)
- f9e9121: fix oylnet
- 922c161: fix oylnet

## 0.0.72

### Patch Changes

- 2450f0b: Integrate Alkanes and add oylnet

## 0.0.72-next.0

### Patch Changes

- bd6058e: test
- Integrate Alkanes and add oylnet

## 0.0.69-next.5

### Patch Changes

- e61e794: testing
- e8bf235: buildn
- 8902f2a: changes test
- 897d3d3: test changesets

## 0.0.69-next.1

### Patch Changes

- 6c0eb50: testing

## 0.0.69-next.0

### Patch Changes

- 4546fa5: testing

## 0.0.0-next-20250417121819

### Patch Changes

- 6fbc528: release testing

## 0.0.0-next-20250417120840

### Patch Changes

- a19fea3: release testing

## 0.0.0-next-20250417115249

### Patch Changes

- 4ed5339: working through changesets

## 0.0.69

### Patch Changes

- bbbc320: Patch release for development version (maintaining 0.0.x versioning)

## 0.2.1

### Patch Changes

- 9ebd105: Patch release for development version

## 0.2.0

### Minor Changes

- 55417a2: Development updates for next release

### Patch Changes

- Patch updates for stable release

## 0.2.0-next.0

### Minor Changes

- Development updates for next release

## 0.1.0

### Minor Changes

- Update packages with latest development changes

## 0.0.66

### Patch Changes

- 2c5f480: disable xverse inscription fetch
- b7cc8e8: fix errors related to lagging state
- 70db360: bump to publish xverse bypass to fight problems w inscription fetching.

## 0.0.66-next.7

### Patch Changes

- 2c5f480: disable xverse inscription fetch
- 70db360: bump to publish xverse bypass to fight problems w inscription fetching.

## 0.0.66-next.6

### Patch Changes

- 70db360: bump to publish xverse bypass to fight problems w inscription fetching.

## 0.0.66-next.5

### Patch Changes

- 2c5f480: disable xverse inscription fetch

## 0.0.66-next.4

### Patch Changes

- 46cdbd4: bump to trigger deployment

## 0.0.66-next.3

### Patch Changes

- fix errors related to lagging state

## 0.0.66-next.2

### Patch Changes

- Export `MaestroDataSource`, `MempoolSpaceDataSource`, `DataSourceManager`, and `SandshrewDataSource` from `lasereyes-core`.

## 0.0.66-next.1

### Patch Changes

- d76e9f1: chore: update dependencies and refactor input handling in signPsbt method

  - Upgrade `sats-connect` to version 3.3.0
  - Modify `inputsToSign` to accept an array of objects for better structure
  - Refactor various provider implementations to accommodate new input structure
  - Adjust React peer dependencies to support versions >=17

## 0.0.66-next.0

### Patch Changes

- 4ec0930: - add `inputsToSign` to signPsbt method as an option
  - use stored data in leather provider rather than repeated pop-ups

## 0.0.65

### Patch Changes

- 13a6ff9: bug fix, config
