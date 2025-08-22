![lasereyes_logo](https://github.com/omnisat/lasereyes-mono/blob/main/.github/assets/lasereyes.png?raw=true)

# lasereyes

`@kevinoyl/lasereyes` is the main package that bundles both `lasereyes-core` and `lasereyes-react`, offering a unified interface for Bitcoin wallet integration in both framework-agnostic and React-based environments. This package simplifies wallet interactions across various Bitcoin wallets, making it easy for developers to build dApps with Bitcoin support.

## Key Features

- **Unified Wallet Interface**: Simplifies Bitcoin wallet integration by providing a common interface for multiple wallet providers.
- **Framework-Agnostic**: `lasereyes-core` can be used in any JavaScript or TypeScript environment, not tied to any specific framework.
- **React Support**: `lasereyes-react` offers React hooks, context providers, and wallet icons for seamless integration into React applications.
- **Vue Support** (coming soon): `lasereyes-vue` offers a Vue hook, context providers, and wallet icons for seamless integration into Vue applications.
- **Angular Support** (coming soon): `lasereyes-angular` offers a Angular hook, context providers, and wallet icons for seamless integration into Angular applications.

## Packages

This package exports two core packages:

1. **[lasereyes-core](https://github.com/omnisat/lasereyes-mono/tree/main/packages/core)**: The framework-agnostic core logic for wallet interactions.
2. **[lasereyes-react](https://github.com/omnisat/lasereyes-mono/tree/main/packages/react)**: React-specific components, including hooks, providers, and wallet icons.

## Installation

To install the `@kevinoyl/lasereyes` package:

```bash
yarn add @kevinoyl/lasereyes
```

## Usage

`@kevinoyl/lasereyes` provides both framework-agnostic and React-specific integrations. You can use it in either environment based on your app’s requirements.

### Example Usage (React)

```typescript
import { LaserEyesProvider, useLaserEyes, UNISAT, MAINNET } from '@kevinoyl/lasereyes-react';

function App() {
  return (
    <LaserEyesProvider config={{network: MAINNET}}>
      <WalletInfo />
    </LaserEyesProvider>
  );
}

function WalletInfo() {
  const { address, connect } = useLaserEyes();

  return (
    <div>
      {address ? (
        <p>Connected: {address}</p>
      ) : (
        <button onClick={() => connect(UNISAT)}>Connect Wallet</button>
      )}
    </div>
  );
}
```

## Development

To develop the `@kevinoyl/lasereyes` package within the monorepo:

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

`@kevinoyl/lasereyes` is MIT licensed.

If you find Laser Eyes useful or use it for work, please consider [sponsoring Laser Eyes](https://github.com/sponsors/omnisat). Thank you 🙏
