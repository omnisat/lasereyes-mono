"use client"

import { CodeBlock } from "@/components/code-block"
import { DocNavigation } from "@/components/doc-navigation"
import { WarningBox } from "@/components/warning-box"

export default function CommonIssuesClientPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold mb-6">Common Issues</h1>
      <p className="text-lg mb-8">
        This guide covers common issues you might encounter when using LaserEyes and provides solutions to help you
        resolve them quickly.
      </p>

      <div className="space-y-12">
        <section id="wallet-connection-issues">
          <h2 className="text-2xl font-bold mb-4">Wallet Connection Issues</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Wallet Not Detected</h3>
              <p className="mb-3">If LaserEyes is not detecting an installed wallet, check the following:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Ensure the wallet extension is installed and enabled in your browser</li>
                <li>Verify the wallet supports the Bitcoin network you're targeting</li>
                <li>Check if the wallet is locked or requires authentication</li>
                <li>Try refreshing the page or restarting your browser</li>
              </ul>

              <CodeBlock
                language="typescript"
                code={`
// Check if wallet is available
const { isWalletAvailable } = useLaserEyes()

useEffect(() => {
  if (!isWalletAvailable) {
    console.log("No compatible wallet detected")
  }
}, [isWalletAvailable])
              `}
              />
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Connection Timeouts</h3>
              <p className="mb-3">If wallet connections are timing out, try the following:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Increase the connection timeout in your configuration</li>
                <li>Check your network connection</li>
                <li>Verify the wallet is responsive (try opening the wallet directly)</li>
              </ul>

              <CodeBlock
                language="typescript"
                code={`
// Increase connection timeout
const client = new LaserEyesClient({
  connectionTimeout: 30000, // 30 seconds instead of default 10 seconds
})
              `}
              />
            </div>
          </div>
        </section>

        <section id="transaction-issues">
          <h2 className="text-2xl font-bold mb-4">Transaction Issues</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Transaction Failures</h3>
              <p className="mb-3">Common causes of transaction failures include:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Insufficient funds (including for fees)</li>
                <li>Network congestion and fee estimation issues</li>
                <li>UTXO selection problems</li>
                <li>Wallet permissions not granted</li>
              </ul>

              <CodeBlock
                language="typescript"
                code={`
// Handle transaction errors
try {
  const txid = await sendTransaction(...)
} catch (error) {
  if (error.code === 'INSUFFICIENT_FUNDS') {
    // Handle insufficient funds
  } else if (error.code === 'USER_REJECTED') {
    // User rejected the transaction
  } else {
    // Handle other errors
    console.error('Transaction failed:', error)
  }
}
              `}
              />
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Fee Estimation Problems</h3>
              <p className="mb-3">If you're experiencing fee estimation issues:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Try using a different fee estimation strategy</li>
                <li>Provide manual fee rates during high network congestion</li>
                <li>Consider using a different DataSource for fee estimation</li>
              </ul>

              <CodeBlock
                language="typescript"
                code={`
// Use a specific fee rate instead of estimation
const txid = await sendTransaction({
  ...txDetails,
  feeRate: 10, // sats/vB
  skipFeeEstimation: true
})
              `}
              />
            </div>
          </div>
        </section>

        <section id="datasource-issues">
          <h2 className="text-2xl font-bold mb-4">DataSource Issues</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">API Rate Limiting</h3>
              <p className="mb-3">If you're hitting rate limits with your DataSource:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Implement caching for frequently accessed data</li>
                <li>Reduce unnecessary API calls</li>
                <li>Consider upgrading your API plan</li>
                <li>Implement fallback DataSources</li>
              </ul>

              <WarningBox title="API Key Security">
                Never expose your API keys in client-side code. Use server-side endpoints or environment variables with
                proper security measures.
              </WarningBox>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Data Inconsistency</h3>
              <p className="mb-3">If you're seeing inconsistent data between different sources:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Check for network differences (mainnet vs testnet)</li>
                <li>Verify the DataSource is properly synchronized</li>
                <li>Consider implementing data validation</li>
                <li>Use multiple DataSources for critical operations</li>
              </ul>

              <CodeBlock
                language="typescript"
                code={`
// Use multiple data sources with fallback
const dataSourceManager = new DataSourceManager({
  primary: new MaestroDataSource({ apiKey: process.env.MAESTRO_API_KEY }),
  fallbacks: [
    new SandshrewDataSource({ apiKey: process.env.SANDSHREW_API_KEY }),
    new MempoolSpaceDataSource()
  ]
})
              `}
              />
            </div>
          </div>
        </section>

        <section id="browser-compatibility">
          <h2 className="text-2xl font-bold mb-4">Browser Compatibility</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Browser Support Issues</h3>
              <p className="mb-3">
                LaserEyes is designed to work with modern browsers, but you might encounter issues with:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Older browser versions that don't support required features</li>
                <li>Mobile browsers with limited extension support</li>
                <li>Privacy-focused browsers that block certain features</li>
              </ul>

              <p className="mt-3">
                We recommend using the latest versions of Chrome, Firefox, Brave, or Edge for the best experience.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Extension Conflicts</h3>
              <p className="mb-3">Some browser extensions might interfere with LaserEyes:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Ad blockers or privacy extensions might block required scripts</li>
                <li>Multiple Bitcoin wallet extensions might conflict with each other</li>
                <li>Developer tools extensions might affect performance</li>
              </ul>

              <p className="mt-3">Try disabling extensions one by one to identify any conflicts.</p>
            </div>
          </div>
        </section>

        <section id="debugging-tips">
          <h2 className="text-2xl font-bold mb-4">Debugging Tips</h2>

          <div className="space-y-4">
            <p>When troubleshooting issues with LaserEyes, these debugging techniques can help:</p>

            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Enable debug logging:</strong> Set <code>debug: true</code> in your LaserEyes configuration to
                get detailed logs
              </li>
              <li>
                <strong>Check browser console:</strong> Look for errors or warnings in your browser's developer console
              </li>
              <li>
                <strong>Inspect network requests:</strong> Use the Network tab in developer tools to check API calls
              </li>
              <li>
                <strong>Test with minimal configuration:</strong> Create a simple test case to isolate the issue
              </li>
              <li>
                <strong>Verify wallet state:</strong> Check if the wallet is unlocked and in the correct network
              </li>
            </ul>

            <CodeBlock
              language="typescript"
              code={`
// Enable debug logging
const client = new LaserEyesClient({
  debug: true,
  logLevel: 'verbose'
})

// Add custom logger
client.setLogger({
  debug: (message) => console.debug('[LaserEyes]', message),
  info: (message) => console.info('[LaserEyes]', message),
  warn: (message) => console.warn('[LaserEyes]', message),
  error: (message) => console.error('[LaserEyes]', message),
})
              `}
            />
          </div>
        </section>
      </div>

      <DocNavigation
        prev={{ title: "Testing", href: "/docs/testing" }}
        next={{ title: "Best Practices", href: "/docs/best-practices" }}
      />
    </div>
  )
}

