# lasereyes-core

`@omnisat/lasereyes-core` is the framework-agnostic core library of the lasereyes suite, designed to provide the core logic for Bitcoin wallet integration into dApps. It abstracts wallet-specific interactions and offers a unified interface, enabling developers to interact with various Bitcoin wallets seamlessly.

This package is not tied to any specific framework and can be used in any TypeScript or JavaScript environment.

## Key Concepts

### Client

The `Client` in `@omnisat/lasereyes-core` manages wallet connections, facilitates communication with different Bitcoin wallets, and handles user authentication and transactions. It serves as the entry point for initializing and interacting with wallet providers.

Example of initializing the LaserEyesClient on a web page:

We'll create a LaserEyesClient instance and connect it to the XVERSE wallet when a button is clicked.

```typescript
// src/index.ts
import { LaserEyesClient, createStores, XVERSE } from '@omnisat/lasereyes-core'

const client = new LaserEyesClient(createStores())

const button = document.getElementById('click-me')

button?.addEventListener('click', () => {
  client.connect(XVERSE).then(() => {
    console.log('Wallet address:')
  })
})
```

### Provider

Each wallet supported by `@omnisat/lasereyes-core` is implemented through a `WalletProvider` class. The `WalletProvider` is responsible for interacting with the underlying wallet's API, such as sending transactions, signing messages, and querying balances.

Providers are modular, making it easy to add support for additional wallets. Current supported wallets include:

- **Leather**
- **Magic Eden**
- **OKX**
- **Orange**
- **Oyl**
- **Phantom**
- **UniSat**
- **Wizz**
- **Xverse**

## Installation

To install `@omnisat/lasereyes-core`, choose one of the following package managers and run the command below:

```bash
npm install @omnisat/lasereyes-core
```

```bash
yarn add @omnisat/lasereyes-core
```

```bash
pnpm install @omnisat/lasereyes-core
```

```bash
bun install @omnisat/lasereyes-core
```

## Features

- **Unified Wallet Interface**: Interact with multiple Bitcoin wallets through a single interface.
- **Modular Providers**: Easily extend the library by adding new wallet providers.
- **Network Support**: Supports multiple Bitcoin networks such as **mainnet**, **testnet3**, **testnet4**, **fractal**, **fractal testnet**, **signet**.

## Documentation

### LaserEyesClient

The `LaserEyesClient` class is a core component for managing interactions with multiple Bitcoin wallet providers in a unified way. It utilizes the `nanostores` library for reactive state management and supports various wallet providers such as Leather, Unisat, and XVerse, among others.

This client handles connection management, account requests, network switching, and common wallet-related actions like sending BTC and signing messages. Additionally, it allows interaction with Partially Signed Bitcoin Transactions (PSBTs).

---

## Constructor

```ts
constructor(
  stores: {
    readonly $store: MapStore<LaserEyesStoreType>
    readonly $network: WritableAtom<NetworkType>
  },
  readonly config?: Config
)
```

- **Parameters:**

  - `stores`: An object containing the following:
    - `$store`: A `MapStore<LaserEyesStoreType>` that stores the application state.
    - `$network`: A `WritableAtom<NetworkType>` that tracks the current network type.
  - `config`: An optional `Config` object for initial configuration, such as the network setting.

- **Initialization:**
  - The constructor initializes the wallet provider map and subscribes to network and initialization-related changes.
  - It triggers a check for default wallet setup and network configuration if provided in the `config`.

---

## Methods


### `connect(defaultWallet: ProviderType)`

Connects to the specified wallet provider and updates the store accordingly.

```ts
async connect(defaultWallet: ProviderType): Promise<void>
```

- **Parameters:**

  - `defaultWallet`: The wallet provider to connect to.

- **Error Handling:** Throws an error if the wallet provider is unsupported or the connection fails.

### `disconnect()`

Disconnects the currently connected wallet provider and resets the store values related to the connection.

```ts
disconnect(): void
```

### `requestAccounts()`

Requests accounts from the connected wallet provider.

```ts
async requestAccounts(): Promise<string[]>
```

- **Returns:** A promise resolving to an array of account addresses.

### `switchNetwork(network: NetworkType)`

Switches the network for the connected wallet provider.

```ts
switchNetwork(network: NetworkType): void
```

- **Parameters:**
  - `network`: The new network to switch to.

### `sendBTC(to: string, amount: number)`

Sends Bitcoin to the specified address using the connected wallet provider.

```ts
async sendBTC(to: string, amount: number): Promise<string>
```

- **Parameters:**

  - `to`: The recipient's Bitcoin address.
  - `amount`: The amount of Bitcoin to send (in satoshis).

- **Error Handling:** Throws errors if no wallet is connected or the provider does not support the operation.

### `signMessage(message: string, toSignAddress?: string)`

Signs a message using the connected wallet provider.

```ts
async signMessage(message: string, toSignAddress?: string): Promise<string>
```

- **Parameters:**
  - `message`: The message to sign.
  - `toSignAddress`: Optional. The address to sign the message with.

### `signPsbt(tx: string, finalize = false, broadcast = false)`

Signs a Partially Signed Bitcoin Transaction (PSBT).

```ts
async signPsbt(tx: string, finalize?: boolean, broadcast?: boolean): Promise<string>
```

- **Parameters:**
  - `tx`: The PSBT in base64 or hex format.
  - `finalize`: Whether to finalize the PSBT.
  - `broadcast`: Whether to broadcast the PSBT after signing.

### `pushPsbt(tx: string)`

Pushes a PSBT to the network using the connected wallet provider.

```ts
async pushPsbt(tx: string): Promise<void>
```

- **Parameters:**
  - `tx`: The PSBT in base64 or hex format.

### `inscribe(content: string, mimeType: ContentType)`

```ts
async inscribe(content: string, mimeType: ContentType): Promise<string | string[]>
```

Inscribe content onto the blockchain.

**Parameters:**
- `content` (string): The content to be inscribed, encoded in Base64.
- `mimeType` (ContentType): The MIME type of the content.

**Returns:**
- `Promise<string | string[]>`: A promise that resolves to the transaction ID(s) of the inscribed content.


### `getPublicKey()`

Retrieves the public key of the connected wallet provider.

```ts
async getPublicKey(): Promise<string>
```

### `getBalance()`

Fetches the balance of the connected wallet.

```ts
async getBalance(): Promise<bigint>
```

### `getInscriptions()`

Fetches any inscriptions (NFTs) associated with the connected wallet.

```ts
async getInscriptions(): Promise<any[]>
```

### `dispose()`

Disposes of all wallet providers by calling their respective `dispose()` methods.

```ts
dispose(): void
```

---

## Private Methods

### `handleIsInitializingChanged(value: boolean)`

Handles the change in the `isInitializing` state, automatically connecting the default wallet if one is set in local storage.

### `watchNetworkChange()`

Resets the wallet balance when a network change is detected.

### `checkInitializationComplete()`

Checks if the initialization process is complete by ensuring all providers are loaded.

---

## Provider Map

The `$providerMap` is a record of supported wallet providers that includes instances of `WalletProvider`-extended classes such as:

- `LeatherProvider`
- `UnisatProvider`
- `XVerseProvider`
- `MagicEdenProvider`
- `PhantomProvider`
- ...and others.

---

## Example Usage

```ts
import { LaserEyesClient, createStores, XVERSE } from '@omnisat/lasereyes-core'

const client = new LaserEyesClient(createStores())

// Connect to Unisat wallet
await client.connect(XVERSE)

// Send 1000 satoshis to a recipient
await client.sendBTC('recipient-address', 1000)

// Sign a message
const signature = await client.signMessage('Hello, Laser Eyes!')
```


## Usage

### Importing the Library

```typescript
import { LaserEyesClient, createStores, createConfig } from 'lasereyes-core'
```

### Initializing the Client

First, create the necessary stores and configuration:

```typescript
const stores = createStores()
const config = createConfig({ network: 'mainnet' }) // or 'testnet', 'signet', etc.
```

Then, initialize the `LaserEyesClient`:

```typescript
const client = new LaserEyesClient(stores, config)
```

### Connecting to a Wallet

Connect to a wallet provider (e.g., 'unisat'):

```typescript
await client.connect('unisat') // Replace 'unisat' with your desired wallet provider
```

### Requesting Accounts

Request the accounts from the connected wallet:

```typescript
const accounts = await client.requestAccounts()
console.log(accounts)
```

### Sending BTC

Send BTC to a recipient address:

```typescript
await client.sendBTC('recipientAddress', amount)
```

### Signing a Message

Sign a message with the connected wallet:

```typescript
const signedMessage = await client.signMessage('message to sign')
console.log(signedMessage)
```

### Signing a PSBT

Sign a Partially Signed Bitcoin Transaction (PSBT):

```typescript
const signedPsbt = await client.signPsbt('psbtHex')
console.log(signedPsbt)
```


### Getting the Public Key

Retrieve the public key from the connected wallet:

```typescript
const publicKey = await client.getPublicKey()
console.log(publicKey)
```

### Getting the Balance

Get the balance of the connected wallet:

```typescript
const balance = await client.getBalance()
console.log(balance)
```

### Getting Inscriptions

Retrieve inscriptions from the connected wallet:

```typescript
const inscriptions = await client.getInscriptions()
console.log(inscriptions)
```

### Disconnecting

Disconnect from the wallet:

```typescript
client.disconnect()
```


### Inscribing Content

To inscribe content using the `inscribe` method, follow these steps:

1. **Initialize the Client**: Ensure you have initialized the `LaserEyesClient` with the necessary stores and configuration.
2. **Connect to a Wallet**: Connect to a wallet provider.
3. **Inscribe Content**: Use the `inscribe` method to inscribe content.

#### Example

```typescript
import { LaserEyesClient, createStores, createConfig } from '@omnisat/lasereyes-core';
import { TEXT_PLAIN } from '@omnisat/lasereyes-core';

const stores = createStores();
const config = createConfig({ network: 'mainnet' });
const client = new LaserEyesClient(stores, config);

client.connect('unisat').then(async () => {
  const contentBase64 = Buffer.from('Hello, LaserEyes!').toString('base64');
  const mimeType = TEXT_PLAIN;
  try {
    const txId = await client.inscribe(contentBase64, mimeType);
    console.log('Inscription txId:', txId);
  } catch (error) {
    console.error('Error inscribing content:', error);
  }
});
```

## Network Configuration

The network configuration can be set to different Bitcoin networks such as 'mainnet', 'testnet', 'signet', etc. These are exported as consts from the `@omnisat/lasereyes-core` package.

## Extending the Library

### Adding a New Wallet Provider

To add a new wallet provider, extend the `WalletProvider` abstract class and implement the required methods.:

```typescript
export abstract class WalletProvider {
  // Constructor and properties

  abstract initialize(): void
  abstract dispose(): void
  abstract connect(defaultWallet: ProviderType): Promise<void>
  abstract requestAccounts(): Promise<string[]>
  abstract getNetwork(): Promise<NetworkType | undefined>
  abstract getPublicKey(): Promise<string | undefined>
  abstract getBalance(): Promise<bigint | string | number>
  abstract getInscriptions(): Promise<any[]>
  abstract sendBTC(to: string, amount: number): Promise<string>
  abstract signMessage(message: string, toSignAddress?: string): Promise<string>
  abstract signPsbt(
    tx: string,
    psbtHex: string,
    psbtBase64: string,
    finalize?: boolean,
    broadcast?: boolean
  ): Promise<{
    signedPsbtHex: string | undefined
    signedPsbtBase64: string | undefined
    txId?: string
  } | undefined>
  abstract pushPsbt(tx: string): Promise<string | undefined>
}
```

---

This documentation provides an overview of the `LaserEyesClient` class, its constructor, and the main methods it offers for interacting with various Bitcoin wallet providers.

## Contributing

If you'd like to contribute to `@omnisat/lasereyes-core`, feel free to submit pull requests or open issues on the GitHub repository.

## License

`@omnisat/lasereyes-core` is MIT licensed

## Conclusion

LaserEyes Core provides a robust and flexible interface for interacting with various Bitcoin wallet providers. By following the above documentation, you can easily integrate LaserEyes Core into your project and extend its functionality as needed.
