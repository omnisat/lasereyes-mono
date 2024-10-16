# lasereyes-core 

`@omnisat/lasereyes-core` is the framework-agnostic core library of the LaserEyes suite, designed to provide the core logic for Bitcoin wallet integration into dApps. It abstracts wallet-specific interactions and offers a unified interface, enabling developers to interact with various Bitcoin wallets seamlessly.

This package is not tied to any specific framework and can be used in any TypeScript or JavaScript environment.

## Key Concepts

### Client
The `Client` in `@omnisat/lasereyes-core` manages wallet connections, facilitates communication with different Bitcoin wallets, and handles user authentication and transactions. It serves as the entry point for initializing and interacting with wallet providers.

Example of initializing the Client:

```typescript
import { Client } from 'lasereyes-core';

const client = new Client({
  network: 'mainnet',  // Choose the Bitcoin network (e.g., 'mainnet', 'testnet')
  provider: 'unisat',  // Specify the wallet provider
});

// Example: Request wallet connection
client.connect().then(wallet => {
  console.log('Wallet address:', wallet.address);
});
```

### Provider
Each wallet supported by `@omnisat/lasereyes-core` is implemented through a `Provider` class. The `Provider` is responsible for interacting with the underlying wallet's API, such as sending transactions, signing messages, and querying balances.

Providers are modular, making it easy to add support for additional wallets. Current supported wallets include:
- **UniSat**
- **Xverse**
- **Phantom**
- And more...

Example of using a Provider:

```typescript
import { UnisatProvider } from 'lasereyes-core/providers/unisat';

const provider = new UnisatProvider();

provider.connect().then(wallet => {
  console.log('Connected to UniSat wallet:', wallet.address);
});
```

## Installation

To install `@omnisat/lasereyes-core`, use:

```bash
pnpm add @omnisat/lasereyes-core
```

## Features
- **Unified Wallet Interface**: Interact with multiple Bitcoin wallets through a single interface.
- **Modular Providers**: Easily extend the library by adding new wallet providers.
- **Network Support**: Supports multiple Bitcoin networks such as mainnet and testnet.

## Usage

You can configure and use `@omnisat/lasereyes-core` by setting up the `Client` and selecting the desired wallet provider. This core package allows you to connect wallets, sign messages, and manage transactions with ease.

## Contributing
If you'd like to contribute to `@omnisat/lasereyes-core`, feel free to submit pull requests or open issues on the GitHub repository.

## License
`@omnisat/lasereyes-core` is MIT licensed.
