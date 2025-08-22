# LaserEyes Core Documentation

## Overview

`@kevinoyl/lasereyes-core` is a framework-agnostic library designed to provide Bitcoin wallet integration for dApps. It abstracts wallet-specific interactions and offers a unified interface, enabling developers to interact with various Bitcoin wallets seamlessly.

This package is not tied to any specific framework and can be used in any TypeScript or JavaScript environment.

## Installation

```bash
# NPM
npm install @kevinoyl/lasereyes-core

# Yarn
yarn add @kevinoyl/lasereyes-core

# PNPM
pnpm install @kevinoyl/lasereyes-core

# Bun
bun install @kevinoyl/lasereyes-core
```

## Key Concepts

### Client

The `LaserEyesClient` is the main entry point for the library. It manages wallet connections, handles user authentication, and facilitates interactions with Bitcoin wallets. 

### Provider

Each supported Bitcoin wallet is implemented through a `WalletProvider` class. These providers handle the communication between your application and the specific wallet's API.

## Supported Wallets

LaserEyes Core supports the following Bitcoin wallets:

- **Leather**
- **Magic Eden**
- **OKX**
- **OP_NET**
- **Orange**
- **Oyl**
- **Phantom**
- **Sparrow**
- **UniSat**
- **Wizz**
- **Xverse**

## Supported Networks

LaserEyes Core supports multiple Bitcoin networks:

- **mainnet**
- **testnet3**
- **testnet4**
- **fractal**
- **fractal testnet**
- **signet**

## Quick Start

### Initializing the Client

```typescript
import { LaserEyesClient, createStores, createConfig, XVERSE } from '@kevinoyl/lasereyes-core';

// Create stores for state management
const stores = createStores();

// Optional: Create configuration with network setting
const config = createConfig({ network: 'mainnet' });

// Initialize the client
const client = new LaserEyesClient(stores, config);
client.initialize();

// Connect to a wallet (e.g., Xverse)
client.connect(XVERSE).then(() => {
  console.log('Connected to Xverse wallet');
});
```

### Basic Usage

```typescript
// Connect to a wallet
await client.connect(XVERSE);

// Request wallet accounts
const accounts = await client.requestAccounts();
console.log('Accounts:', accounts);

// Get wallet balance
const balance = await client.getBalance();
console.log('Balance:', balance.toString());

// Send Bitcoin
const txId = await client.sendBTC('recipient-address', 10000); // 10,000 satoshis
console.log('Transaction ID:', txId);

// Sign a message
const signature = await client.signMessage('Hello, LaserEyes!');
console.log('Signature:', signature);

// Disconnect
client.disconnect();
```

## API Reference

### LaserEyesClient

#### Constructor

```typescript
constructor(
  stores: {
    readonly $store: MapStore<LaserEyesStoreType>
    readonly $network: WritableAtom<NetworkType>
  },
  readonly config?: Config
)
```

#### Properties

- `$store`: A MapStore that tracks the application state
- `$network`: A WritableAtom that tracks the current network type

#### Methods

##### `initialize()`

Initializes the client and checks for wallet providers.

```typescript
client.initialize();
```

##### `connect(defaultWallet: ProviderType)`

Connects to the specified wallet provider.

```typescript
await client.connect(XVERSE);
```

##### `disconnect()`

Disconnects from the currently connected wallet provider.

```typescript
client.disconnect();
```

##### `requestAccounts()`

Requests accounts from the connected wallet provider.

```typescript
const accounts = await client.requestAccounts();
```

##### `getNetwork()`

Gets the current network for the connected wallet provider.

```typescript
const network = await client.getNetwork();
```

##### `switchNetwork(network: NetworkType)`

Switches the network for the connected wallet provider.

```typescript
await client.switchNetwork('testnet');
```

##### `getBalance()`

Gets the balance of the connected wallet.

```typescript
const balance = await client.getBalance();
```

##### `sendBTC(to: string, amount: number)`

Sends Bitcoin to the specified address.

```typescript
const txId = await client.sendBTC('recipientAddress', 10000); // 10,000 satoshis
```

##### `signMessage(message: string, toSignAddressOrOptions?: string | SignMessageOptions)`

Signs a message with the connected wallet.

```typescript
const signature = await client.signMessage('Hello, LaserEyes!');
```

##### `signPsbt(tx: string, finalize?: boolean, broadcast?: boolean)`

Signs a Partially Signed Bitcoin Transaction (PSBT).

```typescript
const result = await client.signPsbt(psbtHex, true, false);
```

##### `pushPsbt(tx: string)`

Pushes a PSBT to the network.

```typescript
const txId = await client.pushPsbt(psbtHex);
```

##### `getPublicKey()`

Gets the public key from the connected wallet.

```typescript
const publicKey = await client.getPublicKey();
```

##### `getInscriptions(offset?: number, limit?: number)`

Gets inscriptions (NFTs) associated with the connected wallet.

```typescript
const inscriptions = await client.getInscriptions();
```

##### `inscribe(content: string, mimeType: ContentType)`

Inscribes content onto the blockchain.

```typescript
import { TEXT_PLAIN } from '@kevinoyl/lasereyes-core';

const contentBase64 = Buffer.from('Hello, LaserEyes!').toString('base64');
const txId = await client.inscribe(contentBase64, TEXT_PLAIN);
```

##### `send(protocol: Protocol, sendArgs: BTCSendArgs | RuneSendArgs)`

Sends assets using the specified protocol.

```typescript
import { BTC } from '@kevinoyl/lasereyes-core';

const txId = await client.send(BTC, {
  fromAddress: 'senderAddress',
  toAddress: 'recipientAddress',
  amount: 10000,
  network: 'mainnet'
});
```

##### `dispose()`

Disposes of all wallet providers.

```typescript
client.dispose();
```

### Constants

#### Wallet Providers

```typescript
import {
  LEATHER,
  MAGIC_EDEN,
  OKX,
  OP_NET,
  ORANGE,
  OYL,
  PHANTOM,
  SPARROW,
  UNISAT,
  WIZZ,
  XVERSE
} from '@kevinoyl/lasereyes-core';
```

#### Networks

```typescript
import {
  MAINNET,
  TESTNET,
  TESTNET4,
  SIGNET,
  FRACTAL_MAINNET,
  FRACTAL_TESTNET
} from '@kevinoyl/lasereyes-core';
```

#### Content Types

```typescript
import {
  TEXT_HTML,
  TEXT_PLAIN,
  APPLICATION_JSON,
  IMAGE_JPEG,
  IMAGE_PNG
  // ... many more available
} from '@kevinoyl/lasereyes-core';
```

#### Protocols

```typescript
import {
  BTC,
  BRC20,
  RUNES,
  ALKANES
} from '@kevinoyl/lasereyes-core';
```

## Error Handling

LaserEyes Core throws appropriate errors when operations fail. Always wrap your wallet interactions in try-catch blocks:

```typescript
try {
  await client.connect(XVERSE);
  const balance = await client.getBalance();
  console.log('Balance:', balance.toString());
} catch (error) {
  console.error('Wallet error:', error);
}
```

## Advanced Usage

### Working with PSBTs

```typescript
// Sign a PSBT
const { signedPsbtHex, signedPsbtBase64, txId } = await client.signPsbt(
  psbtHex,   // PSBT in hex format
  true,      // finalize
  true       // broadcast
);

// If not broadcasting immediately, push the PSBT later
if (!txId) {
  const broadcastTxId = await client.pushPsbt(signedPsbtHex);
  console.log('Broadcast transaction ID:', broadcastTxId);
}
```

### Working with Inscriptions

```typescript
// Create an inscription
const content = Buffer.from('Hello, Ordinals!').toString('base64');
const txId = await client.inscribe(content, TEXT_PLAIN);
console.log('Inscription transaction ID:', txId);

// Get all inscriptions for the connected wallet
const inscriptions = await client.getInscriptions();
console.log('Inscriptions:', inscriptions);
```

### Working with Runes

```typescript
import { RUNES } from '@kevinoyl/lasereyes-core';

// Send runes
const txId = await client.send(RUNES, {
  runeId: '123456:78',
  fromAddress: 'senderAddress',
  toAddress: 'recipientAddress',
  amount: 100,
  network: 'mainnet'
});

// Get rune balances
const runeBalances = await client.getMetaBalances(RUNES);
```

## Best Practices

1. **Initialize once**: Create a single instance of `LaserEyesClient` and reuse it.
2. **Handle errors**: Wrap all wallet interactions in try-catch blocks.
3. **Clean up**: Call `dispose()` when you're done with the client to free resources.
4. **Network awareness**: Check the current network before performing transactions.
5. **User confirmation**: Always get user confirmation before signing transactions.

## Troubleshooting

### Wallet Not Connecting

- Check if the wallet extension is installed
- Verify the wallet is unlocked
- Check the console for specific error messages

### Transaction Failures

- Confirm sufficient balance
- Check network configuration
- Verify recipient address format

### Signing Issues

- Ensure the wallet has the appropriate permissions
- Check if the message format is correct

## Examples

### Basic Wallet Connection

```typescript
import { LaserEyesClient, createStores, UNISAT } from '@kevinoyl/lasereyes-core';

const client = new LaserEyesClient(createStores());
client.initialize();

document.getElementById('connect-button').addEventListener('click', async () => {
  try {
    await client.connect(UNISAT);
    const address = client.$store.get().address;
    document.getElementById('address-display').textContent = address;
  } catch (error) {
    console.error('Connection error:', error);
  }
});
```

### Sending Bitcoin

```typescript
document.getElementById('send-button').addEventListener('click', async () => {
  const recipient = document.getElementById('recipient').value;
  const amountSats = parseInt(document.getElementById('amount').value);
  
  try {
    const txId = await client.sendBTC(recipient, amountSats);
    document.getElementById('tx-display').textContent = `Transaction sent: ${txId}`;
  } catch (error) {
    console.error('Send error:', error);
  }
});
```

### Creating an Inscription

```typescript
document.getElementById('inscribe-button').addEventListener('click', async () => {
  const text = document.getElementById('inscription-text').value;
  const contentBase64 = Buffer.from(text).toString('base64');
  
  try {
    const txId = await client.inscribe(contentBase64, TEXT_PLAIN);
    document.getElementById('inscription-display').textContent = `Inscription created: ${txId}`;
  } catch (error) {
    console.error('Inscription error:', error);
  }
});
```

## Contributing

Contributions to LaserEyes Core are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

LaserEyes Core is MIT licensed.

wooooo