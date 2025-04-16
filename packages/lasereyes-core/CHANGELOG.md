# @omnisat/lasereyes-core

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
