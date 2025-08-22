# lasereyes-react

`@kevinoyl/lasereyes-react` is a React-specific package built on top of `lasereyes-core`. It provides React hooks, context providers, and wallet icon components to make it easy to integrate Bitcoin wallet support into React applications.

This package simplifies the interaction between your React app and various Bitcoin wallets, allowing you to focus on building dApps with a seamless user experience.

## Key Concepts

### Provider

The `@kevinoyl/lasereyes-react` package exports a `Provider` component that wraps your React application, providing access to wallet functionality throughout your app via React context.

Example of setting up the provider:

```typescript
import { LaserEyesProvider } from '@kevinoyl/lasereyes-react';

function App() {
  return (
    <LaserEyesProvider network="mainnet">
      {/* Rest of your application */}
    </LaserEyesProvider>
  );
}
```

### Hooks

`@kevinoyl/lasereyes-react` provides hooks to interact with wallets within your React components. The most commonly used hook is `useLaserEyes`, which allows you to access the connected wallet and its state.

Example of using the `useLaserEyes` hook:

```typescript
// must be a child of a component that is wrapped with LaserEyesProvider

import { useLaserEyes } from '@kevinoyl/lasereyes-react';

function WalletInfo() {
  const { address, connect } = useLaserEyes();

  return (
    <div>
      {address ? (
        <p>Connected: {address}</p>
      ) : (
        <button onClick={connect}>Connect Wallet</button>
      )}
    </div>
  );
}
```

### Icons

`@kevinoyl/lasereyes-react` also exports SVG wallet icons as React components, making it easy to include visual wallet indicators in your app.

Example of using a wallet icon:

```typescript
import { UnisatLogo } from '@kevinoyl/lasereyes-react';

function WalletDisplay() {
  return <UnisatLogo size={size} className={className} variant={variant} />;
}
```

or you could use the `WalletIcon` component to display a wallet icon based on the wallet's name:

```jsx
import { WalletIcon, UNISAT, XVERSE } from '@kevinoyl/lasereyes-react';

const WalletConnectPage = () => {
  return (
    <div>
      {[UNISAT, XVERSE].map((walletName) => (
        <WalletIcon key={walletName} walletName={walletName} size={45} className={"mx-4"} />
      ))
    </div>
  );
};
```

## Features

- **React Hooks**: Easily manage wallet connections and state in your components.
- **Provider Component**: Wrap your app with the `LaserEyesProvider` to enable wallet access across your React tree with `useLaserEyes`.
- **Wallet Icons**: Use pre-built wallet icons as React components for visual integration.

## Usage

Set up `@kevinoyl/lasereyes-react` by wrapping your app with the `LaserEyesProvider` and using the provided hooks (like `useWallet`) to interact with wallets.

## Contributing

Contributions are welcome! Feel free to submit pull requests or open issues in the GitHub repository.

## License

`@kevinoyl/lasereyes-react` is MIT licensed.


