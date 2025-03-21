"use client"

import { Heading } from "@/components/heading"
import { CodeBlock } from "@/components/code-block"
import Image from "next/image"

export default function BitcoinDonationPageRecipe() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <Heading level={1} className="text-4xl font-bold mb-6">
        🎁 Bitcoin Donation Page Recipe
      </Heading>

      <p className="text-lg mb-6">
        Create a Bitcoin donation page that's so good, even nocoiners might consider throwing some sats your way!
      </p>

      <div className="flex justify-center mb-8">
        <Image
          src="/placeholder.svg?height=300&width=600"
          alt="Bitcoin Donation Page Preview"
          width={600}
          height={300}
          className="rounded-lg border"
        />
      </div>

      <Heading level={2} className="text-2xl font-semibold mt-8 mb-4">
        Ingredients
      </Heading>

      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>LaserEyes SDK</li>
        <li>Next.js (or your favorite React framework)</li>
        <li>A pinch of creativity</li>
        <li>A dash of QR code generation</li>
      </ul>

      <Heading level={2} className="text-2xl font-semibold mt-8 mb-4">
        Step 1: Set Up Your Project
      </Heading>

      <p className="mb-4">First, make sure you have LaserEyes installed:</p>

      <CodeBlock
        code={`npm install laser-eyes
# or
yarn add laser-eyes`}
        language="bash"
      />

      <Heading level={2} className="text-2xl font-semibold mt-8 mb-4">
        Step 2: Create Your Donation Component
      </Heading>

      <CodeBlock
        code={`// components/BitcoinDonation.tsx
import { useState } from 'react';
import { useLaserEyes } from 'laser-eyes';
import { QRCode } from 'laser-eyes/ui';

export function BitcoinDonation() {
  const { generateAddress, network } = useLaserEyes();
  const [amount, setAmount] = useState(50000); // 50,000 sats default
  const [donationAddress, setDonationAddress] = useState('');
  
  // Predefined donation amounts in sats
  const donationOptions = [
    { label: '5,000 sats', value: 5000 },
    { label: '10,000 sats', value: 10000 },
    { label: '50,000 sats', value: 50000 },
    { label: '100,000 sats', value: 100000 },
    { label: '1,000,000 sats', value: 1000000 },
  ];
  
  // Generate a new address when the component mounts
  useEffect(() => {
    const address = generateAddress({
      label: 'Donation to Amazing Project',
      message: 'Thank you for your support!'
    });
    setDonationAddress(address);
  }, [generateAddress]);
  
  // Format sats to BTC for display
  const formatBTC = (sats) => {
    return (sats / 100000000).toFixed(8);
  };
  
  return (
    <div className="max-w-md mx-auto p-6 border rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Support With Bitcoin
      </h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Select Amount:
        </label>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {donationOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setAmount(option.value)}
              className={\`py-2 px-3 border rounded-md text-sm 
                \${amount === option.value 
                  ? 'bg-orange-100 border-orange-500' 
                  : 'hover:bg-gray-50'}\`}
            >
              {option.label}
            </button>
          ))}
        </div>
        
        <div className="text-center mb-4">
          <span className="text-2xl font-bold">{formatBTC(amount)} BTC</span>
          <span className="block text-sm text-gray-500">
            ≈ {amount.toLocaleString()} sats
          </span>
        </div>
      </div>
      
      {donationAddress && (
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <QRCode 
              value={\`bitcoin:\${donationAddress}?amount=\${formatBTC(amount)}\`}
              size={200}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Bitcoin Address:
            </label>
            <div className="flex">
              <input
                type="text"
                readOnly
                value={donationAddress}
                className="flex-1 p-2 border rounded-l-md font-mono text-sm"
              />
              <button
                onClick={() => navigator.clipboard.writeText(donationAddress)}
                className="px-3 py-2 bg-gray-100 border border-l-0 rounded-r-md"
              >
                Copy
              </button>
            </div>
          </div>
          
          <p className="text-sm text-gray-500">
            Network: {network}
          </p>
        </div>
      )}
      
      <div className="mt-6 text-center">
        <p className="text-sm">
          Thank you for supporting our project! Your donation helps us continue building awesome Bitcoin tools.
        </p>
      </div>
    </div>
  );
}`}
        language="tsx"
      />

      <Heading level={2} className="text-2xl font-semibold mt-8 mb-4">
        Step 3: Add the Donation Component to Your Page
      </Heading>

      <CodeBlock
        code={`// pages/donate.tsx
import { LaserEyesProvider } from 'laser-eyes';
import { BitcoinDonation } from '../components/BitcoinDonation';

export default function DonatePage() {
  return (
    <LaserEyesProvider network="mainnet">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-center mb-8">
          Support Our Project
        </h1>
        
        <p className="text-lg text-center mb-12 max-w-2xl mx-auto">
          Your donations help us continue developing open-source Bitcoin tools for the community. Every satoshi counts!
        </p>
        
        <BitcoinDonation />
        
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-semibold mb-4">
            What Your Donation Supports
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="p-4 border rounded-lg">
              <h3 className="font-bold mb-2">Development</h3>
              <p className="text-sm">Funding ongoing development of our open-source tools</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-bold mb-2">Infrastructure</h3>
              <p className="text-sm">Covering costs for servers and infrastructure</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-bold mb-2">Education</h3>
              <p className="text-sm">Creating educational content about Bitcoin</p>
            </div>
          </div>
        </div>
      </div>
    </LaserEyesProvider>
  );
}`}
        language="tsx"
      />

      <Heading level={2} className="text-2xl font-semibold mt-8 mb-4">
        Step 4: Track Donations (Optional)
      </Heading>

      <p className="mb-4">To track when donations are received:</p>

      <CodeBlock
        code={`// components/DonationTracker.tsx
import { useEffect, useState } from 'react';
import { useLaserEyes, useAddressActivity } from 'laser-eyes';

export function DonationTracker({ address }) {
  const { isLoading, transactions } = useAddressActivity(address);
  const [totalReceived, setTotalReceived] = useState(0);
  
  useEffect(() => {
    if (transactions) {
      const total = transactions.reduce((sum, tx) => {
        // Only count incoming transactions
        if (tx.type === 'received') {
          return sum + tx.value;
        }
        return sum;
      }, 0);
      
      setTotalReceived(total);
    }
  }, [transactions]);
  
  if (isLoading) {
    return <div>Loading donation data...</div>;
  }
  
  return (
    <div className="mt-6 p-4 bg-green-50 rounded-lg">
      <h3 className="font-bold mb-2">Donation Stats</h3>
      <p>Total Received: {totalReceived.toLocaleString()} sats</p>
      <p>Number of Donations: {transactions.filter(tx => tx.type === 'received').length}</p>
    </div>
  );
}`}
        language="tsx"
      />

      <Heading level={2} className="text-2xl font-semibold mt-8 mb-4">
        Customization Options
      </Heading>

      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>
          <strong>Custom Donation Amounts:</strong> Modify the <code>donationOptions</code> array to set your preferred
          donation tiers
        </li>
        <li>
          <strong>Suggested Uses:</strong> Add specific projects or goals that donations will fund
        </li>
        <li>
          <strong>Thank You Page:</strong> Redirect donors to a thank you page after they scan the QR code
        </li>
        <li>
          <strong>Lightning Support:</strong> Add Lightning Network payment options for smaller donations
        </li>
      </ul>

      <Heading level={2} className="text-2xl font-semibold mt-8 mb-4">
        Production Tips
      </Heading>

      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>Use a dedicated donation address for each campaign to track effectiveness</li>
        <li>Consider using a BTCPay Server for more advanced donation management</li>
        <li>Add analytics to track conversion rates (how many visitors donate)</li>
        <li>Display a list of recent donations to encourage others (with donor permission)</li>
      </ul>

      <div className="p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg mt-8">
        <p className="font-semibold">⚠️ Important Note:</p>
        <p>
          For security reasons, never store private keys on your frontend. LaserEyes only generates addresses for
          receiving funds - the actual funds should be managed with a proper wallet.
        </p>
      </div>

      <div className="p-4 bg-green-100 dark:bg-green-900 rounded-lg mt-4">
        <p className="font-semibold">🎉 Congratulations!</p>
        <p>
          You've successfully created a Bitcoin donation page that's both user-friendly and secure. Now go forth and
          collect those sats!
        </p>
      </div>
    </div>
  )
}

