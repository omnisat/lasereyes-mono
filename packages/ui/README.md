# Lasereyes Modal

Lasereyes Modal makes it easy for developers to integrate Bitcoin wallet connection flows into their applications with minimal setup. It builds on top of the `@kevinoyl/lasereyes` library to provide a convenient modal-based UI.

![Version](https://img.shields.io/npm/v/@kevinoyl/lasereyes-modal)
![license](https://img.shields.io/github/license/omnisat/lasereyes-modal.svg?style=flat-square)

## Wallets Supported:

- Leather
- Magic Eden
- OKX
- Orange Wallet
- OYL
- Unisat
- Wizz
- Phantom
- Xverse
- Sparrow

## Installation

You could install the Lasereyes package which contains everything lasereyes:

```bash
npm install @kevinoyl/lasereyes
# OR
yarn add @kevinoyl/lasereyes
```

Or you could install the Lasereyes UI package which contains the modal and the styles:

```bash
npm install @kevinoyl/lasereyes-ui
# OR
yarn add @kevinoyl/lasereyes-ui
```

If you installed the lasereyes package, then you can access lasereyes-ui through `lasereyes/ui`

```tsx
import { LaserEyesModalProvider } from '@kevinoyl/lasereyes/ui';
```

Make sure your project uses React 18+.

## Usage

The simplest way to integrate this library is by wrapping your application with `<LaserEyesModalProvider>`. This automatically wraps your app with `<LaserEyesProvider>`, allowing all child components to access the wallet state.

You can then use:

- `<ConnectWalletButton>` — A pre-styled button to trigger the modal.
- `useLaserEyesModal` — A hook for manually controlling the modal.
- `<ConnectWalletModal>` — A component to manually render the modal.

### Example Usage

```tsx
import { ConnectWalletButton, LaserEyesModalProvider } from '@kevinoyl/lasereyes/ui';
import '@kevinoyl/lasereyes/ui/style.css';

function App() {
  return (
    <LaserEyesModalProvider>
      <div>
        <h1>Welcome</h1>
        <ConnectWalletButton />
      </div>
    </LaserEyesModalProvider>
  );
}

export default App;
```

### Using `useLaserEyesModal`

If you want to create a custom button to open the modal, use the `useLaserEyesModal` hook:

```tsx
import { useLaserEyesModal } from '@kevinoyl/lasereyes/ui';

function CustomWalletButton() {
  const { showModal } = useLaserEyesModal();

  return <button onClick={showModal}>Connect Wallet</button>;
}
```

### Controlling the Modal Directly

You can also use `<ConnectWalletModal>` directly:

```tsx
import { useState } from 'react';
import { ConnectWalletModal } from '@kevinoyl/lasereyes/ui';

function ManualModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Connect</button>
      <ConnectWalletModal open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
```

## API Reference

### `useLaserEyesModal`

```ts
interface LaserEyesModalContext {
  isOpen: boolean;
  isLoading: boolean;
  showModal: () => void;
  hideModal: () => void;
  config: LaserEyesModalConfig;
  setConfig: (config: LaserEyesModalConfig) => void;
}
```


### `<ConnectWalletModal>`

| Prop    | Type      | Description                             |
|---------|----------|-----------------------------------------|
| `open`  | boolean  | Controls whether the modal is visible. |
| `onClose` | function | Called when the modal should close.  |



## Community

For help, discussion about best practices, or any other conversation that would benefit from being searchable:

[Discuss Laser Eyes Modal on GitHub](https://github.com/omnisat/lasereyes-modal/discussions)

## Contributing

Contributions to Laser Eyes Modal are greatly appreciated! If you're interested in contributing to this open source project, please read the [Contributing Guide](https://www.lasereyes.build/docs/contributing) **before submitting a pull request**.

## Sponsors

If you find Laser Eyes Modal useful or use it for work, please consider [sponsoring Laser Eyes](https://github.com/sponsors/omnisat). Thank you 🙏

<br/>

<h2 style="text-align: center;">Ecosystem Partnerships</h2>
<p style="display: flex; justify-content: center; align-items: center; gap: 60px; flex-wrap: wrap;">
  <a href="https://www.utxo.management/">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./.github/assets/utxo.svg">
      <img alt="UTXO Management" src="./.github/assets/utxo.svg" width="auto" height="100">
    </picture>
  </a>
  <a href="https://ordinalsbot.com/">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./.github/assets/ordinals-bot.svg">
      <img alt="Ordinals Bot" src="./.github/assets/ordinals-bot.svg" width="auto" height="60">
    </picture>
  </a>
</p>
<p style="display: flex; justify-content: center; align-items: center; gap: 60px; flex-wrap: wrap;">
  <a href="https://l1f.io/">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./.github/assets/l1f.svg">
      <img alt="L1F" src="./.github/assets/l1f.svg" width="auto" height="60">
    </picture>
  </a>
  <a href="https://x.com/BLIFEProtocol">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./.github/assets/blife.svg">
      <img alt="BLIFE" src="./.github/assets/blife.svg" width="auto" height="120">
    </picture>
  </a>
</p>

<h2 style="text-align: center;">Start-Up Sponsors</h2>
<p style="display: flex; justify-content: center; align-items: center; gap: 40px; flex-wrap: wrap;">
  <a href="https://www.seizectrl.io/">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./.github/assets/ctrl.svg">
      <img alt="Seize CTRL" src="./.github/assets/ctrl.svg" width="auto" height="50">
    </picture>
  </a>
  <a href="https://satsventures.com/">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./.github/assets/sats-ventures.svg">
      <img alt="Sats Ventures" src="./.github/assets/sats-ventures.svg" width="auto" height="50">
    </picture>
  </a>
  <a href="https://leather.io/">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./.github/assets/leather.svg">
      <img alt="Leather" src="./.github/assets/leather.svg" width="auto" height="50">
    </picture>
  </a>
  <a href="https://www.orangecrypto.com/">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./.github/assets/orangewallet.svg">
      <img alt="Orange Wallet" src="./.github/assets/orangewallet.svg" width="auto" height="50">
    </picture>
  </a>
</p>
<br>

<h4 style="text-align: center; font-size: 1.5em; margin-top: 20px; margin-bottom: 20px;">
  <a href="https://github.com/sponsors/omnisat">Become A Sponsor</a>
</h4>


