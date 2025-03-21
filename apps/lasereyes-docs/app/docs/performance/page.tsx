"use client"

import { ClientPageWrapper } from "@/components/client-page-wrapper"
import { Heading } from "@/components/heading"

export default function PerformancePage() {
  return (
    <div className="space-y-6">
      <Heading>Performance Optimization</Heading>

      <ClientPageWrapper>
        <PerformanceContent />
      </ClientPageWrapper>
    </div>
  )
}

// Client component with all the content
function PerformanceContent() {
  return (
    <div className="space-y-6">
      <p>
        LaserEyes is designed with performance in mind. This guide provides best practices for optimizing your
        application when using LaserEyes.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">Lazy Loading</h2>
      <p>To improve initial load time, consider lazy loading LaserEyes components only when needed:</p>

      <pre className="bg-muted p-4 rounded-md overflow-x-auto">
        <code>{`// Instead of importing directly
import { LaserEyesProvider } from '@omnisat/lasereyes-react'

// Use dynamic imports
import dynamic from 'next/dynamic'

const LaserEyesProvider = dynamic(
  () => import('@omnisat/lasereyes-react').then(mod => mod.LaserEyesProvider),
  { ssr: false }
)`}</code>
      </pre>

      <h2 className="text-2xl font-bold mt-8 mb-4">Memoization</h2>
      <p>Use React's memoization features to prevent unnecessary re-renders:</p>

      <pre className="bg-muted p-4 rounded-md overflow-x-auto">
        <code>{`import { useMemo } from 'react'
import { useLaserEyes } from '@omnisat/lasereyes-react'

function WalletInfo() {
  const { address } = useLaserEyes()
  
  // Memoize expensive calculations
  const shortenedAddress = useMemo(() => {
    if (!address) return ''
    return \`\${address.slice(0, 6)}...\${address.slice(-4)}\`
  }, [address])
  
  return <div>{shortenedAddress}</div>
}`}</code>
      </pre>

      <h2 className="text-2xl font-bold mt-8 mb-4">Optimizing Data Fetching</h2>
      <p>When working with blockchain data, implement proper caching strategies:</p>

      <ul className="list-disc pl-6 space-y-2">
        <li>Use SWR or React Query for data fetching with built-in caching</li>
        <li>Implement local storage caching for non-critical data</li>
        <li>Consider using server-side rendering for initial data loads</li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4">Bundle Size Optimization</h2>
      <p>LaserEyes is designed to be lightweight, but you can further optimize your bundle size:</p>

      <ul className="list-disc pl-6 space-y-2">
        <li>Import only the components you need</li>
        <li>Use tree-shaking friendly imports</li>
        <li>Consider code-splitting your application</li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4">Monitoring Performance</h2>
      <p>Use performance monitoring tools to identify bottlenecks:</p>

      <ul className="list-disc pl-6 space-y-2">
        <li>React DevTools Profiler</li>
        <li>Lighthouse audits</li>
        <li>Web Vitals monitoring</li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4">Advanced Techniques</h2>
      <p>For high-performance applications, consider these advanced techniques:</p>

      <ul className="list-disc pl-6 space-y-2">
        <li>Implement virtualized lists for large data sets</li>
        <li>Use web workers for CPU-intensive tasks</li>
        <li>Consider using the experimental Concurrent Mode features of React</li>
      </ul>
    </div>
  )
}

