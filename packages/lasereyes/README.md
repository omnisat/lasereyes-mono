![lasereyes_logo](../../lasereyes.png)
# lasereyes 

`@omnisat/lasereyes` is the main package that bundles both `lasereyes-core` and `lasereyes-react`, offering a unified interface for Bitcoin wallet integration in both framework-agnostic and React-based environments. This package simplifies wallet interactions across various Bitcoin wallets, making it easy for developers to build dApps with Bitcoin support.

## Key Features

- **Unified Wallet Interface**: Simplifies Bitcoin wallet integration by providing a common interface for multiple wallet providers.
- **Framework-Agnostic**: `lasereyes-core` can be used in any JavaScript or TypeScript environment, not tied to any specific framework.
- **React Support**: `lasereyes-react` offers React hooks, context providers, and wallet icons for seamless integration into React applications.

## Packages

This package exports two core packages:

1. **[lasereyes-core](../lasereyes-core/README.md)**: The framework-agnostic core logic for wallet interactions.
2. **[lasereyes-react](../lasereyes-react/README.md)**: React-specific components, including hooks, providers, and wallet icons.

## Installation

To install the `@omnisat/lasereyes` package:

```bash
pnpm add @omnisat/lasereyes
```

## Usage

`@omnisat/lasereyes` provides both framework-agnostic and React-specific integrations. You can use it in either environment based on your app’s requirements.

### Example Usage (React)

```typescript
import { LaserEyesProvider, useWallet } from '@omnisat/lasereyes-react';

function App() {
  return (
    <LaserEyesProvider network="mainnet">
      <WalletInfo />
    </LaserEyesProvider>
  );
}

function WalletInfo() {
  const { wallet, connect } = useWallet();

  return (
    <div>
      {wallet ? (
        <p>Connected: {wallet.address}</p>
      ) : (
        <button onClick={connect}>Connect Wallet</button>
      )}
    </div>
  );
}
```

## Development

To develop the `@omnisat/lasereyes` package within the monorepo:

1. Clone the repository and navigate to the monorepo root.
2. Install dependencies:

```bash
pnpm install
```

3. Run the development build:

```bash
pnpm dev
```

## Contributing

Contributions are welcome! Feel free to submit pull requests or open issues for bug fixes, feature enhancements, or documentation improvements.

## License

`@omnisat/lasereyes` is MIT licensed.
