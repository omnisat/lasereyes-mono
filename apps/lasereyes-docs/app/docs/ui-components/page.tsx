"use client"

import { CodeBlock } from "@/components/code-block"
import Link from "next/link"
import { Heading } from "@/components/heading"

export default function UIComponentsPage() {
  return (
    <>
      <Heading level={1} className="text-3xl font-bold mb-6">
        UI Components
      </Heading>
      <p className="text-lg mb-4">
        LaserEyes provides a set of ready-to-use React components to help you quickly build Bitcoin wallet functionality
        into your application. These components are built on top of the LaserEyes hooks and provide a consistent,
        accessible user interface.
      </p>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Available Components
      </Heading>
      <p className="mb-6">The LaserEyes React package includes the following UI components:</p>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <div className="bg-card rounded-lg border p-6">
          <Heading level={3} className="text-xl font-bold mb-2">
            WalletConnectButton
          </Heading>
          <p className="text-muted-foreground">
            A button that handles wallet connection and displays the connection state.
          </p>
        </div>
        <div className="bg-card rounded-lg border p-6">
          <Heading level={3} className="text-xl font-bold mb-2">
            WalletSelector
          </Heading>
          <p className="text-muted-foreground">
            A dropdown or modal component that allows users to select from available wallet providers.
          </p>
        </div>
        <div className="bg-card rounded-lg border p-6">
          <Heading level={3} className="text-xl font-bold mb-2">
            WalletInfo
          </Heading>
          <p className="text-muted-foreground">
            A component that displays information about the connected wallet, such as address and balance.
          </p>
        </div>
        <div className="bg-card rounded-lg border p-6">
          <Heading level={3} className="text-xl font-bold mb-2">
            SendBTCForm
          </Heading>
          <p className="text-muted-foreground">
            A form for sending BTC, with input validation and transaction status feedback.
          </p>
        </div>
        <div className="bg-card rounded-lg border p-6">
          <Heading level={3} className="text-xl font-bold mb-2">
            InscriptionGallery
          </Heading>
          <p className="text-muted-foreground">
            A gallery component for displaying and selecting inscriptions owned by the connected wallet.
          </p>
        </div>
        <div className="bg-card rounded-lg border p-6">
          <Heading level={3} className="text-xl font-bold mb-2">
            TokenBalances
          </Heading>
          <p className="text-muted-foreground">
            A component that displays BRC-20 and Rune token balances for the connected wallet.
          </p>
        </div>
      </div>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        WalletConnectButton
      </Heading>
      <p className="mb-6">
        The <code>WalletConnectButton</code> is a simple button that handles wallet connection and displays the
        connection state:
      </p>
      <CodeBlock
        language="tsx"
        code={`import { WalletConnectButton } from '@omnisat/lasereyes-react'
import { UNISAT } from '@omnisat/lasereyes-core'

function MyApp() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Bitcoin App</h1>
      
      {/* Basic usage */}
      <WalletConnectButton />
      
      {/* With custom provider */}
      <WalletConnectButton provider={UNISAT} />
      
      {/* With custom styling */}
      <WalletConnectButton 
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        connectedClassName="bg-green-500 hover:bg-green-600"
      />
      
      {/* With custom labels */}
      <WalletConnectButton 
        connectLabel="Connect Bitcoin Wallet"
        connectedLabel="Connected: {address}"
        disconnectLabel="Disconnect"
      />
    </div>
  )
}`}
        fileName="wallet-connect-button.tsx"
        copyButton={true}
      />

      <Heading level={3} className="text-xl font-bold mt-6 mb-2">
        Props
      </Heading>
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted">
              <th className="border p-2 text-left">Prop</th>
              <th className="border p-2 text-left">Type</th>
              <th className="border p-2 text-left">Default</th>
              <th className="border p-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">
                <code>provider</code>
              </td>
              <td className="border p-2">
                <code>string</code>
              </td>
              <td className="border p-2">
                <code>undefined</code>
              </td>
              <td className="border p-2">Specific wallet provider to connect to</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>className</code>
              </td>
              <td className="border p-2">
                <code>string</code>
              </td>
              <td className="border p-2">
                <code>""</code>
              </td>
              <td className="border p-2">CSS class for the button</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>connectedClassName</code>
              </td>
              <td className="border p-2">
                <code>string</code>
              </td>
              <td className="border p-2">
                <code>""</code>
              </td>
              <td className="border p-2">CSS class applied when connected</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>connectLabel</code>
              </td>
              <td className="border p-2">
                <code>string</code>
              </td>
              <td className="border p-2">
                <code>"Connect Wallet"</code>
              </td>
              <td className="border p-2">Label for connect button</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>connectedLabel</code>
              </td>
              <td className="border p-2">
                <code>string</code>
              </td>
              <td className="border p-2">
                <code>
                  "{"{"}address{"}"}"
                </code>
              </td>
              <td className="border p-2">Label when connected (supports {"{address}"} template)</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>disconnectLabel</code>
              </td>
              <td className="border p-2">
                <code>string</code>
              </td>
              <td className="border p-2">
                <code>"Disconnect"</code>
              </td>
              <td className="border p-2">Label for disconnect button</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>onConnect</code>
              </td>
              <td className="border p-2">
                <code>() ={">"} void</code>
              </td>
              <td className="border p-2">
                <code>undefined</code>
              </td>
              <td className="border p-2">Callback when wallet is connected</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>onDisconnect</code>
              </td>
              <td className="border p-2">
                <code>() ={">"} void</code>
              </td>
              <td className="border p-2">
                <code>undefined</code>
              </td>
              <td className="border p-2">Callback when wallet is disconnected</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        WalletSelector
      </Heading>
      <p className="mb-6">
        The <code>WalletSelector</code> component provides a dropdown or modal interface for selecting from available
        wallet providers:
      </p>
      <CodeBlock
        language="tsx"
        code={`import { WalletSelector } from '@omnisat/lasereyes-react'
import { UNISAT, XVERSE, OYL, LEATHER } from '@omnisat/lasereyes-core'

function MyApp() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
      
      {/* Basic usage */}
      <WalletSelector />
      
      {/* With specific providers */}
      <WalletSelector 
        providers={[UNISAT, XVERSE, OYL, LEATHER]} 
      />
      
      {/* As a modal */}
      <WalletSelector 
        mode="modal"
        trigger={<button>Open Wallet Selector</button>}
      />
      
      {/* With custom styling */}
      <WalletSelector 
        className="bg-white p-4 rounded-lg shadow-lg"
        itemClassName="flex items-center p-2 hover:bg-gray-100 rounded"
      />
      
      {/* With callbacks */}
      <WalletSelector 
        onSelect={(provider) => console.log('Selected provider:', provider)}
        onConnect={(address) => console.log('Connected to address:', address)}
      />
    </div>
  )
}`}
        fileName="wallet-selector.tsx"
        copyButton={true}
      />

      <Heading level={3} className="text-xl font-bold mt-6 mb-2">
        Props
      </Heading>
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted">
              <th className="border p-2 text-left">Prop</th>
              <th className="border p-2 text-left">Type</th>
              <th className="border p-2 text-left">Default</th>
              <th className="border p-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">
                <code>providers</code>
              </td>
              <td className="border p-2">
                <code>string[]</code>
              </td>
              <td className="border p-2">
                <code>all supported</code>
              </td>
              <td className="border p-2">List of wallet providers to display</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>mode</code>
              </td>
              <td className="border p-2">
                <code>"inline" | "modal"</code>
              </td>
              <td className="border p-2">
                <code>"inline"</code>
              </td>
              <td className="border p-2">Display mode</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>trigger</code>
              </td>
              <td className="border p-2">
                <code>ReactNode</code>
              </td>
              <td className="border p-2">
                <code>undefined</code>
              </td>
              <td className="border p-2">Trigger element for modal mode</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>className</code>
              </td>
              <td className="border p-2">
                <code>string</code>
              </td>
              <td className="border p-2">
                <code>""</code>
              </td>
              <td className="border p-2">CSS class for the container</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>itemClassName</code>
              </td>
              <td className="border p-2">
                <code>string</code>
              </td>
              <td className="border p-2">
                <code>""</code>
              </td>
              <td className="border p-2">CSS class for each wallet item</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>title</code>
              </td>
              <td className="border p-2">
                <code>string</code>
              </td>
              <td className="border p-2">
                <code>"Select Wallet"</code>
              </td>
              <td className="border p-2">Title text</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>onSelect</code>
              </td>
              <td className="border p-2">
                <code>(provider: string) ={">"} void</code>
              </td>
              <td className="border p-2">
                <code>undefined</code>
              </td>
              <td className="border p-2">Callback when a wallet is selected</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>onConnect</code>
              </td>
              <td className="border p-2">
                <code>(address: string) ={">"} void</code>
              </td>
              <td className="border p-2">
                <code>undefined</code>
              </td>
              <td className="border p-2">Callback when a wallet is connected</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        WalletInfo
      </Heading>
      <p className="mb-6">
        The <code>WalletInfo</code> component displays information about the connected wallet:
      </p>
      <CodeBlock
        language="tsx"
        code={`import { WalletInfo } from '@omnisat/lasereyes-react'

function MyApp() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Wallet Information</h1>
      
      {/* Basic usage */}
      <WalletInfo />
      
      {/* With custom styling */}
      <WalletInfo 
        className="bg-white p-4 rounded-lg shadow-lg"
        addressClassName="font-mono text-sm"
        balanceClassName="text-green-600 font-bold"
      />
      
      {/* With custom display options */}
      <WalletInfo 
        showProvider={true}
        showBalance={true}
        showCopy={true}
        showDisconnect={true}
        truncateAddress={true}
      />
      
      {/* With BTC display format */}
      <WalletInfo 
        balanceFormat="btc"  // Display in BTC instead of satoshis
        balanceDecimals={8}  // Number of decimal places
      />
    </div>
  )
}`}
        fileName="wallet-info.tsx"
        copyButton={true}
      />

      <Heading level={3} className="text-xl font-bold mt-6 mb-2">
        Props
      </Heading>
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted">
              <th className="border p-2 text-left">Prop</th>
              <th className="border p-2 text-left">Type</th>
              <th className="border p-2 text-left">Default</th>
              <th className="border p-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">
                <code>className</code>
              </td>
              <td className="border p-2">
                <code>string</code>
              </td>
              <td className="border p-2">
                <code>""</code>
              </td>
              <td className="border p-2">CSS class for the container</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>addressClassName</code>
              </td>
              <td className="border p-2">
                <code>string</code>
              </td>
              <td className="border p-2">
                <code>""</code>
              </td>
              <td className="border p-2">CSS class for the address</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>balanceClassName</code>
              </td>
              <td className="border p-2">
                <code>string</code>
              </td>
              <td className="border p-2">
                <code>""</code>
              </td>
              <td className="border p-2">CSS class for the balance</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>showProvider</code>
              </td>
              <td className="border p-2">
                <code>boolean</code>
              </td>
              <td className="border p-2">
                <code>false</code>
              </td>
              <td className="border p-2">Show wallet provider name</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>showBalance</code>
              </td>
              <td className="border p-2">
                <code>boolean</code>
              </td>
              <td className="border p-2">
                <code>true</code>
              </td>
              <td className="border p-2">Show wallet balance</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>showCopy</code>
              </td>
              <td className="border p-2">
                <code>boolean</code>
              </td>
              <td className="border p-2">
                <code>true</code>
              </td>
              <td className="border p-2">Show copy address button</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>showDisconnect</code>
              </td>
              <td className="border p-2">
                <code>boolean</code>
              </td>
              <td className="border p-2">
                <code>false</code>
              </td>
              <td className="border p-2">Show disconnect button</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>truncateAddress</code>
              </td>
              <td className="border p-2">
                <code>boolean</code>
              </td>
              <td className="border p-2">
                <code>true</code>
              </td>
              <td className="border p-2">Truncate address for display</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>balanceFormat</code>
              </td>
              <td className="border p-2">
                <code>"sats" | "btc"</code>
              </td>
              <td className="border p-2">
                <code>"sats"</code>
              </td>
              <td className="border p-2">Display format for balance</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>balanceDecimals</code>
              </td>
              <td className="border p-2">
                <code>number</code>
              </td>
              <td className="border p-2">
                <code>0</code> or <code>8</code>
              </td>
              <td className="border p-2">Decimal places for balance</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        SendBTCForm
      </Heading>
      <p className="mb-6">
        The <code>SendBTCForm</code> component provides a form for sending BTC:
      </p>
      <CodeBlock
        language="tsx"
        code={`import { SendBTCForm } from '@omnisat/lasereyes-react'

function MyApp() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Send Bitcoin</h1>
      
      {/* Basic usage */}
      <SendBTCForm />
      
      {/* With custom styling */}
      <SendBTCForm 
        className="bg-white p-4 rounded-lg shadow-lg"
        inputClassName="border p-2 rounded w-full"
        buttonClassName="bg-blue-500 text-white p-2 rounded"
      />
      
      {/* With default values */}
      <SendBTCForm 
        defaultRecipient="bc1q..."
        defaultAmount="0.001"
      />
      
      {/* With callbacks */}
      <SendBTCForm 
        onSubmit={(recipient, amount) => {
          console.log('Sending', amount, 'to', recipient)
        }}
        onSuccess={(txid) => {
          console.log('Transaction sent:', txid)
        }}
        onError={(error) => {
          console.error('Transaction failed:', error)
        }}
      />
      
      {/* With fee options */}
      <SendBTCForm 
        showFeeOptions={true}
        defaultFeeRate={5}
      />
    </div>
  )
}`}
        fileName="send-btc-form.tsx"
        copyButton={true}
      />

      <Heading level={3} className="text-xl font-bold mt-6 mb-2">
        Props
      </Heading>
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted">
              <th className="border p-2 text-left">Prop</th>
              <th className="border p-2 text-left">Type</th>
              <th className="border p-2 text-left">Default</th>
              <th className="border p-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">
                <code>className</code>
              </td>
              <td className="border p-2">
                <code>string</code>
              </td>
              <td className="border p-2">
                <code>""</code>
              </td>
              <td className="border p-2">CSS class for the form</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>inputClassName</code>
              </td>
              <td className="border p-2">
                <code>string</code>
              </td>
              <td className="border p-2">
                <code>""</code>
              </td>
              <td className="border p-2">CSS class for input fields</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>buttonClassName</code>
              </td>
              <td className="border p-2">
                <code>string</code>
              </td>
              <td className="border p-2">
                <code>""</code>
              </td>
              <td className="border p-2">CSS class for the submit button</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>defaultRecipient</code>
              </td>
              <td className="border p-2">
                <code>string</code>
              </td>
              <td className="border p-2">
                <code>""</code>
              </td>
              <td className="border p-2">Default recipient address</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>defaultAmount</code>
              </td>
              <td className="border p-2">
                <code>string</code>
              </td>
              <td className="border p-2">
                <code>""</code>
              </td>
              <td className="border p-2">Default amount in BTC</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>showFeeOptions</code>
              </td>
              <td className="border p-2">
                <code>boolean</code>
              </td>
              <td className="border p-2">
                <code>false</code>
              </td>
              <td className="border p-2">Show fee rate options</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>defaultFeeRate</code>
              </td>
              <td className="border p-2">
                <code>number</code>
              </td>
              <td className="border p-2">
                <code>undefined</code>
              </td>
              <td className="border p-2">Default fee rate in sat/vB</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>onSubmit</code>
              </td>
              <td className="border p-2">
                <code>(recipient: string, amount: string) ={">"} void</code>
              </td>
              <td className="border p-2">
                <code>undefined</code>
              </td>
              <td className="border p-2">Callback when form is submitted</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>onSuccess</code>
              </td>
              <td className="border p-2">
                <code>(txid: string) ={">"} void</code>
              </td>
              <td className="border p-2">
                <code>undefined</code>
              </td>
              <td className="border p-2">Callback when transaction succeeds</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>onError</code>
              </td>
              <td className="border p-2">
                <code>(error: Error) ={">"} void</code>
              </td>
              <td className="border p-2">
                <code>undefined</code>
              </td>
              <td className="border p-2">Callback when transaction fails</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        InscriptionGallery
      </Heading>
      <p className="mb-6">
        The <code>InscriptionGallery</code> component displays inscriptions owned by the connected wallet:
      </p>
      <CodeBlock
        language="tsx"
        code={`import { InscriptionGallery } from '@omnisat/lasereyes-react'

function MyApp() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Inscriptions</h1>
      
      {/* Basic usage */}
      <InscriptionGallery />
      
      {/* With custom styling */}
      <InscriptionGallery 
        className="grid gri 
        className="grid grid-cols-3 gap-4"
        itemClassName="border rounded-lg overflow-hidden"
        imageClassName="w-full h-auto"
      />
      
      {/* With selection mode */}
      <InscriptionGallery 
        selectable={true}
        onSelect={(inscriptions) => {
          console.log('Selected inscriptions:', inscriptions)
        }}
      />
      
      {/* With filtering */}
      <InscriptionGallery 
        filter={(inscription) => inscription.contentType.startsWith('image/')}
      />
      
      {/* With pagination */}
      <InscriptionGallery 
        pageSize={12}
        showPagination={true}
      />
    </div>
  )
}`}
        fileName="inscription-gallery.tsx"
        copyButton={true}
      />

      <Heading level={3} className="text-xl font-bold mt-6 mb-2">
        Props
      </Heading>
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted">
              <th className="border p-2 text-left">Prop</th>
              <th className="border p-2 text-left">Type</th>
              <th className="border p-2 text-left">Default</th>
              <th className="border p-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">
                <code>className</code>
              </td>
              <td className="border p-2">
                <code>string</code>
              </td>
              <td className="border p-2">
                <code>""</code>
              </td>
              <td className="border p-2">CSS class for the gallery container</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>itemClassName</code>
              </td>
              <td className="border p-2">
                <code>string</code>
              </td>
              <td className="border p-2">
                <code>""</code>
              </td>
              <td className="border p-2">CSS class for each inscription item</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>imageClassName</code>
              </td>
              <td className="border p-2">
                <code>string</code>
              </td>
              <td className="border p-2">
                <code>""</code>
              </td>
              <td className="border p-2">CSS class for inscription images</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>selectable</code>
              </td>
              <td className="border p-2">
                <code>boolean</code>
              </td>
              <td className="border p-2">
                <code>false</code>
              </td>
              <td className="border p-2">Enable selection mode</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>filter</code>
              </td>
              <td className="border p-2">
                <code>(inscription: Inscription) ={">"} boolean</code>
              </td>
              <td className="border p-2">
                <code>undefined</code>
              </td>
              <td className="border p-2">Filter function for inscriptions</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>pageSize</code>
              </td>
              <td className="border p-2">
                <code>number</code>
              </td>
              <td className="border p-2">
                <code>20</code>
              </td>
              <td className="border p-2">Number of inscriptions per page</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>showPagination</code>
              </td>
              <td className="border p-2">
                <code>boolean</code>
              </td>
              <td className="border p-2">
                <code>false</code>
              </td>
              <td className="border p-2">Show pagination controls</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>onSelect</code>
              </td>
              <td className="border p-2">
                <code>(inscriptions: Inscription[]) ={">"} void</code>
              </td>
              <td className="border p-2">
                <code>undefined</code>
              </td>
              <td className="border p-2">Callback when inscriptions are selected</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        TokenBalances
      </Heading>
      <p className="mb-6">
        The <code>TokenBalances</code> component displays BRC-20 and Rune token balances:
      </p>
      <CodeBlock
        language="tsx"
        code={`import { TokenBalances } from '@omnisat/lasereyes-react'

function MyApp() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Tokens</h1>
      
      {/* Basic usage */}
      <TokenBalances />
      
      {/* With specific token type */}
      <TokenBalances type="brc20" />
      <TokenBalances type="runes" />
      
      {/* With custom styling */}
      <TokenBalances 
        className="bg-white p-4 rounded-lg shadow-lg"
        tokenClassName="flex justify-between p-2 border-b"
        tickerClassName="font-bold"
        balanceClassName="text-right"
      />
      
      {/* With selection */}
      <TokenBalances 
        selectable={true}
        onSelect={(token) => {
          console.log('Selected token:', token)
        }}
      />
      
      {/* With filtering */}
      <TokenBalances 
        filter={(token) => Number(token.balance) > 0}
      />
    </div>
  )
}`}
        fileName="token-balances.tsx"
        copyButton={true}
      />

      <Heading level={3} className="text-xl font-bold mt-6 mb-2">
        Props
      </Heading>
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted">
              <th className="border p-2 text-left">Prop</th>
              <th className="border p-2 text-left">Type</th>
              <th className="border p-2 text-left">Default</th>
              <th className="border p-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">
                <code>type</code>
              </td>
              <td className="border p-2">
                <code>"brc20" | "runes" | "all"</code>
              </td>
              <td className="border p-2">
                <code>"all"</code>
              </td>
              <td className="border p-2">Type of tokens to display</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>className</code>
              </td>
              <td className="border p-2">
                <code>string</code>
              </td>
              <td className="border p-2">
                <code>""</code>
              </td>
              <td className="border p-2">CSS class for the container</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>tokenClassName</code>
              </td>
              <td className="border p-2">
                <code>string</code>
              </td>
              <td className="border p-2">
                <code>""</code>
              </td>
              <td className="border p-2">CSS class for each token item</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>tickerClassName</code>
              </td>
              <td className="border p-2">
                <code>string</code>
              </td>
              <td className="border p-2">
                <code>""</code>
              </td>
              <td className="border p-2">CSS class for token ticker</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>balanceClassName</code>
              </td>
              <td className="border p-2">
                <code>string</code>
              </td>
              <td className="border p-2">
                <code>""</code>
              </td>
              <td className="border p-2">CSS class for token balance</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>selectable</code>
              </td>
              <td className="border p-2">
                <code>boolean</code>
              </td>
              <td className="border p-2">
                <code>false</code>
              </td>
              <td className="border p-2">Enable selection mode</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>filter</code>
              </td>
              <td className="border p-2">
                <code>(token: any) ={">"} boolean</code>
              </td>
              <td className="border p-2">
                <code>undefined</code>
              </td>
              <td className="border p-2">Filter function for tokens</td>
            </tr>
            <tr>
              <td className="border p-2">
                <code>onSelect</code>
              </td>
              <td className="border p-2">
                <code>(token: any) ={">"} void</code>
              </td>
              <td className="border p-2">
                <code>undefined</code>
              </td>
              <td className="border p-2">Callback when a token is selected</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Building Custom Components
      </Heading>
      <p className="mb-6">
        You can build custom UI components using the <code>useLaserEyes</code> hook. Here's an example of a custom
        wallet card component:
      </p>
      <CodeBlock
        language="tsx"
        code={`import { useLaserEyes } from '@omnisat/lasereyes-react'
import { useState, useEffect } from 'react'

function CustomWalletCard() {
  const { 
    connected, 
    address, 
    balance, 
    provider, 
    connect, 
    disconnect,
    getInscriptions,
    getMetaBalances
  } = useLaserEyes()
  
  const [inscriptionCount, setInscriptionCount] = useState(0)
  const [tokenCount, setTokenCount] = useState(0)
  const [loading, setLoading] = useState(false)
  
  // Load data when connected
  useEffect(() => {
    if (connected) {
      loadData()
    } else {
      setInscriptionCount(0)
      setTokenCount(0)
    }
  }, [connected])
  
  const loadData = async () => {
    try {
      setLoading(true)
      
      // Get inscriptions
      const inscriptions = await getInscriptions()
      setInscriptionCount(inscriptions.length)
      
      // Get BRC-20 tokens
      const tokens = await getMetaBalances('brc20')
      setTokenCount(tokens.length)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // Format balance in BTC
  const formatBalance = () => {
    if (!balance) return '0'
    return (Number(balance) / 100000000).toFixed(8)
  }
  
  // Truncate address
  const truncateAddress = (addr) => {
    if (!addr) return ''
    return \`\${addr.slice(0, 6)}...\${addr.slice(-4)}\`
  }
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      {connected ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Wallet Connected</h2>
            <button 
              onClick={disconnect}
              className="text-red-500 text-sm"
            >
              Disconnect
            </button>
          </div>
          
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Address:</span>
              <span className="font-mono">{truncateAddress(address)}</span>
            </div>
            
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-500">Balance:</span>
              <span className="font-bold">{formatBalance()} BTC</span>
            </div>
            
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-500">Wallet:</span>
              <span>{provider}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <span className="block text-2xl font-bold">{inscriptionCount}</span>
              <span className="text-sm text-gray-500">Inscriptions</span>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <span className="block text-2xl font-bold">{tokenCount}</span>
              <span className="text-sm text-gray-500">BRC-20 Tokens</span>
            </div>
          </div>
          
          {loading && <p className="text-center text-gray-500">Loading data...</p>}
        </div>
      ) : (
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold">Connect Your Wallet</h2>
          <p className="text-gray-500">Connect your Bitcoin wallet to view your assets</p>
          
          <button 
            onClick={() => connect('UNISAT')}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full"
          >
            Connect Wallet
          </button>
        </div>
      )}
    </div>
  )
}`}
        fileName="custom-wallet-card.tsx"
        copyButton={true}
      />

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Best Practices
      </Heading>
      <p className="mb-6">Here are some best practices for using LaserEyes UI components:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <strong>Use the provided components</strong> for common wallet functionality to save development time.
        </li>
        <li>
          <strong>Customize with className props</strong> rather than creating new components when possible.
        </li>
        <li>
          <strong>Handle loading and error states</strong> to provide a good user experience.
        </li>
        <li>
          <strong>Implement proper validation</strong> for user inputs, especially for transaction forms.
        </li>
        <li>
          <strong>Use the useLaserEyes hook</strong> to build custom components when the provided ones don't meet your
          needs.
        </li>
        <li>
          <strong>Ensure your UI is responsive</strong> to work well on different screen sizes.
        </li>
      </ul>

      <Heading level={2} className="text-2xl font-bold mt-8 mb-4">
        Next Steps
      </Heading>
      <p className="mb-6">
        Now that you understand the UI components provided by LaserEyes, you can explore related topics:
      </p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>
          <Link href="/docs/laser-eyes-provider" className="text-primary hover:underline">
            LaserEyesProvider
          </Link>{" "}
          - Learn how to configure the LaserEyes provider
        </li>
        <li>
          <Link href="/docs/use-laser-eyes" className="text-primary hover:underline">
            useLaserEyes Hook
          </Link>{" "}
          - Understand the core hook for interacting with LaserEyes
        </li>
        <li>
          <Link href="/docs/transaction-types" className="text-primary hover:underline">
            Transaction Types
          </Link>{" "}
          - Learn about the different types of transactions supported by LaserEyes
        </li>
        <li>
          <Link href="/docs/examples" className="text-primary hover:underline">
            Examples and Recipes
          </Link>{" "}
          - Explore complete examples and recipes for common use cases
        </li>
      </ul>
    </>
  )
}

