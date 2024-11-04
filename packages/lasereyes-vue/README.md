# lasereyes-vue

Set up guide newer

`@omnisat/lasereyes-vue` is a Vue-specific package built on top of `lasereyes-core`. It provides Vue composables and wallet functionality to make it easy to integrate Bitcoin wallet support into Vue applications.

This package simplifies the interaction between your Vue app and various Bitcoin wallets, allowing you to focus on building dApps with a seamless user experience.

## Key Concepts

### Composables

`@omnisat/lasereyes-vue` provides the `useLaserEyes` composable to interact with wallets within your Vue components. This composable gives you access to the connected wallet and its state, leveraging Vue's reactive system.

Example of using the `useLaserEyes` composable:

```typescript
import { useLaserEyes } from '@omnisat/lasereyes-vue'

export default {
  setup() {
    const { address, connect } = useLaserEyes()

    return {
      address,
      connect,
    }
  },
}
```

Or in a `<script setup>` component:

```vue
<script setup>
import { useLaserEyes } from '@omnisat/lasereyes-vue'

const { address, connect } = useLaserEyes()
</script>

<template>
  <div>
    <template v-if="address">
      <p>Connected: {{ address }}</p>
    </template>
    <template v-else>
      <button @click="connect">Connect Wallet</button>
    </template>
  </div>
</template>
```

## Features

- **Vue Composables**: Use the `useLaserEyes` composable to manage wallet connections and state in your components
- **Reactive State**: Fully integrated with Vue's reactivity system
- **TypeScript Support**: Built with TypeScript for better type safety and developer experience
- **Wallet Integration**: Support for multiple Bitcoin wallets including Unisat, Xverse, OKX, and more

## API Reference

The `useLaserEyes` composable returns an object with the following properties and methods:

### State Properties

- `address`: Current wallet address
- `paymentAddress`: Payment address
- `publicKey`: Public key of the connected wallet
- `paymentPublicKey`: Payment public key
- `accounts`: Array of connected accounts
- `balance`: Current balance (as a number)
- `connected`: Boolean indicating if wallet is connected
- `isConnecting`: Boolean indicating if connection is in progress
- `isInitializing`: Boolean indicating if initialization is in progress
- `network`: Current network
- `provider`: Current wallet provider

### Wallet Detection

- `hasLeather`: Computed property for Leather wallet availability
- `hasMagicEden`: Computed property for Magic Eden wallet availability
- `hasOkx`: Computed property for OKX wallet availability
- `hasOyl`: Computed property for OYL wallet availability
- `hasPhantom`: Computed property for Phantom wallet availability
- `hasUnisat`: Computed property for Unisat wallet availability
- `hasWizz`: Computed property for Wizz wallet availability
- `hasXverse`: Computed property for Xverse wallet availability

### Methods

- `connect()`: Connect to a wallet
- `disconnect()`: Disconnect the current wallet
- `getBalance()`: Get the current balance
- `getInscriptions()`: Get inscriptions for the connected wallet
- `getNetwork()`: Get the current network
- `getPublicKey()`: Get the public key
- `pushPsbt(psbt: string)`: Push a PSBT transaction
- `signMessage(message: string, toSignAddress?: string)`: Sign a message
- `requestAccounts()`: Request connected accounts
- `sendBTC(to: string, amount: number)`: Send BTC to an address
- `signPsbt(psbt: string, finalize = false, broadcast = false)`: Sign a PSBT transaction
- `switchNetwork(network: NetworkType)`: Switch to a different network

## Installation

```bash
npm install @omnisat/lasereyes-vue
# or
yarn add @omnisat/lasereyes-vue
# or
pnpm add @omnisat/lasereyes-vue
```

## Contributing

Contributions are welcome! Feel free to submit pull requests or open issues in the GitHub repository.

## License

`@omnisat/lasereyes-vue` is MIT licensed.
