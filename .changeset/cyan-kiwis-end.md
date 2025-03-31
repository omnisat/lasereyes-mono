---
'@omnisat/lasereyes-core': patch
---

chore: update dependencies and refactor input handling in signPsbt method

- Upgrade `sats-connect` to version 3.3.0
- Modify `inputsToSign` to accept an array of objects for better structure
- Refactor various provider implementations to accommodate new input structure
- Adjust React peer dependencies to support versions >=17
