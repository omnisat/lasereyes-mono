'use client'

import { CodeBlock } from '@/components/code-block'
import { Heading } from '@/components/heading'
import { ClientPageWrapper } from '@/components/client-page-wrapper'

export default function CreateLaserEyesPage() {
  return (
    <div className="space-y-6">
      <Heading level={1}>Create LaserEyes</Heading>
      <p className="text-lg mb-4">
        A CLI tool for scaffolding Next.js projects with Bitcoin wallet integration using LaserEyes.
      </p>

      <ClientPageWrapper>
        <CreateLaserEyesContent />
      </ClientPageWrapper>
    </div>
  )
}

function CreateLaserEyesContent() {
  return (
    <div className="space-y-6">
      <Heading level={2}>Quick Start</Heading>
      <p className="mb-4">
        Get started quickly by running:
      </p>
      <CodeBlock code="npx create-lasereyes" language="bash" copyButton={true} />

      <p className="mb-4">Follow the interactive prompts to:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>Name your project</li>
        <li>Select your framework (currently Next.js is fully supported)</li>
        <li>Choose additional options</li>
      </ul>

      <p className="mb-4">Once complete, navigate to your project and start the development server:</p>
      <CodeBlock 
        code={`cd your-project-name\nnpm run dev`}
        language="bash"
        copyButton={true}
      />

      <Heading level={2}>Features</Heading>
      
      <Heading level={3}>⚡️ Next.js Integration</Heading>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>Modern Next.js project with App Router</li>
        <li>React 18 support</li>
        <li>TypeScript configuration</li>
      </ul>

      <Heading level={3}>🔐 Bitcoin Wallet Integration</Heading>
      <p className="mb-4">Pre-configured LaserEyes wallet connection modal with support for:</p>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>UniSat</li>
        <li>Xverse</li>
        <li>Oyl</li>
        <li>Magic Eden</li>
        <li>OKX</li>
        <li>Leather</li>
        <li>Phantom</li>
        <li>Wizz</li>
        <li>Orange</li>
      </ul>

      <Heading level={3}>🎨 Styling & UI</Heading>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>Shadcn UI components</li>
        <li>Tailwind CSS integration</li>
        <li>Light/Dark mode toggle</li>
      </ul>

      <Heading level={3}>🤖 Developer Experience</Heading>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>Cursor.ai editor configuration</li>
        <li>TypeScript support</li>
        <li>ESLint & Prettier configuration</li>
      </ul>

      <Heading level={2}>CLI Options</Heading>
      <table className="w-full border-collapse mb-6">
        <thead>
          <tr className="bg-muted">
            <th className="border p-2 text-left">Option</th>
            <th className="border p-2 text-left">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border p-2"><code>-t, --template [name]</code></td>
            <td className="border p-2">Specify template (next-app, vue-app)</td>
          </tr>
          <tr>
            <td className="border p-2"><code>--npm</code></td>
            <td className="border p-2">Use npm package manager</td>
          </tr>
          <tr>
            <td className="border p-2"><code>--pnpm</code></td>
            <td className="border p-2">Use pnpm package manager</td>
          </tr>
          <tr>
            <td className="border p-2"><code>--yarn</code></td>
            <td className="border p-2">Use yarn package manager</td>
          </tr>
          <tr>
            <td className="border p-2"><code>--tailwind</code></td>
            <td className="border p-2">Install TailwindCSS (default: true)</td>
          </tr>
          <tr>
            <td className="border p-2"><code>--shadcn</code></td>
            <td className="border p-2">Install Shadcn UI components</td>
          </tr>
        </tbody>
      </table>

      <Heading level={2}>Project Structure</Heading>
      <p className="mb-4">Generated projects follow this structure:</p>
      <CodeBlock 
        code={`your-project-name/
├── src/
│   ├── app/
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx    # Root layout with providers
│   │   └── page.tsx      # Home page
│   ├── components/
│   │   ├── ui/           # Reusable Shadcn UI Components
│   │   ├── ConnectWallet.tsx # LaserEyes Wallet Connection
│   │   ├── DefaultLayout.tsx # LaserEyes Provider Wrapper
│   │   └── ThemeToggle.tsx   # Light/Dark Mode Toggle
│   └── lib/
│       └── utils.ts
├── .cursorrules          # AI assistant configuration
└── package.json`}
        language="text"
        copyButton={true}
      />

      <Heading level={2}>Framework Support</Heading>
      <ul className="list-disc pl-6 mb-6 space-y-2">
        <li>✅ Next.js (App Router) - Fully supported</li>
        <li>🚧 Vue 3 + Vite - Coming soon</li>
        <li>🚧 Vanilla JS - Coming soon</li>
      </ul>

      <Heading level={2}>Contributing</Heading>
      <ol className="list-decimal pl-6 mb-6 space-y-2">
        <li>Fork the repository</li>
        <li>Create a feature branch: <code>git checkout -b feature/your-feature-name</code></li>
        <li>Commit your changes: <code>git commit -m &apos;Add some feature&apos;</code></li>
        <li>Push to the branch: <code>git push origin feature/your-feature-name</code></li>
        <li>Submit a pull request</li>
      </ol>

      <Heading level={2}>License</Heading>
      <p>MIT License</p>
    </div>
  )
} 