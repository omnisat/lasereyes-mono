import type { Metadata } from "next"
import { CodeBlock } from "@/components/code-block"
import { DocNavigation } from "@/components/doc-navigation"
import { WarningBox } from "@/components/warning-box"

export const metadata: Metadata = {
  title: "Development Setup | LaserEyes Documentation",
  description: "Setting up your development environment for contributing to LaserEyes",
}

export default function DevelopmentSetupPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold mb-6">Development Setup</h1>
      <p className="text-lg mb-8">
        This guide will help you set up your development environment to contribute to LaserEyes. We appreciate your
        interest in making LaserEyes better!
      </p>

      <div className="space-y-12">
        <section id="prerequisites">
          <h2 className="text-2xl font-bold mb-4">Prerequisites</h2>

          <div className="space-y-4">
            <p>Before you begin, make sure you have the following installed:</p>

            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Node.js:</strong> Version 18 or higher
              </li>
              <li>
                <strong>pnpm:</strong> We use pnpm as our package manager
              </li>
              <li>
                <strong>Git:</strong> For version control
              </li>
              <li>
                <strong>Visual Studio Code:</strong> Recommended editor (optional)
              </li>
            </ul>

            <p className="mt-4">We also recommend having a basic understanding of:</p>

            <ul className="list-disc pl-6 space-y-2">
              <li>TypeScript</li>
              <li>React (for React components)</li>
              <li>Bitcoin concepts and terminology</li>
              <li>Testing frameworks (Jest and React Testing Library)</li>
            </ul>
          </div>
        </section>

        <section id="repository-setup">
          <h2 className="text-2xl font-bold mb-4">Repository Setup</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Fork and Clone</h3>
              <p className="mb-3">Start by forking the LaserEyes repository on GitHub, then clone your fork:</p>

              <CodeBlock
                language="bash"
                code={`
# Clone your fork
git clone https://github.com/YOUR_USERNAME/lasereyes.git

# Navigate to the project directory
cd lasereyes

# Add the upstream repository
git remote add upstream https://github.com/omnisat/lasereyes.git
              `}
              />
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Install Dependencies</h3>
              <p className="mb-3">Install the project dependencies:</p>

              <CodeBlock
                language="bash"
                code={`
# Install dependencies
pnpm install
              `}
              />

              <p className="mt-3">This will install all the dependencies for the monorepo packages.</p>
            </div>
          </div>
        </section>

        <section id="project-structure">
          <h2 className="text-2xl font-bold mb-4">Project Structure</h2>

          <div className="space-y-4">
            <p>
              LaserEyes is organized as a monorepo using pnpm workspaces. Here's an overview of the main directories:
            </p>

            <CodeBlock
              language="text"
              code={`
lasereyes/
├── packages/
│   ├── core/                 # Core LaserEyes functionality
│   ├── react/                # React integration
│   ├── datasources/          # DataSource implementations
│   │   ├── maestro/          # Maestro DataSource
│   │   ├── sandshrew/        # Sandshrew DataSource
│   │   └── mempool-space/    # Mempool.space DataSource
│   └── utils/                # Shared utilities
├── examples/                 # Example applications
│   ├── basic/                # Basic usage example
│   ├── react-wallet/         # React wallet example
│   └── next-app/             # Next.js application example
├── docs/                     # Documentation source
├── scripts/                  # Build and development scripts
├── tests/                    # Test suites
└── package.json              # Root package.json
              `}
            />

            <p className="mt-4">Understanding this structure will help you locate the code you want to modify.</p>
          </div>
        </section>

        <section id="development-workflow">
          <h2 className="text-2xl font-bold mb-4">Development Workflow</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Create a Branch</h3>
              <p className="mb-3">Always create a new branch for your changes:</p>

              <CodeBlock
                language="bash"
                code={`
# Make sure you're on the main branch
git checkout main

# Pull the latest changes
git pull upstream main

# Create a new branch
git checkout -b feature/your-feature-name
              `}
              />
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Build and Watch</h3>
              <p className="mb-3">Start the development build with watch mode:</p>

              <CodeBlock
                language="bash"
                code={`
# Build all packages
pnpm build

# Or watch for changes
pnpm dev
              `}
              />
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Running Tests</h3>
              <p className="mb-3">Run tests to ensure your changes don't break existing functionality:</p>

              <CodeBlock
                language="bash"
                code={`
# Run all tests
pnpm test

# Run tests for a specific package
pnpm test --filter=@omnisat/lasereyes-core

# Run tests in watch mode
pnpm test:watch
              `}
              />
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Linting and Formatting</h3>
              <p className="mb-3">Ensure your code follows our style guidelines:</p>

              <CodeBlock
                language="bash"
                code={`
# Run linting
pnpm lint

# Fix linting issues automatically
pnpm lint:fix

# Format code
pnpm format
              `}
              />
            </div>
          </div>
        </section>

        <section id="testing-environment">
          <h2 className="text-2xl font-bold mb-4">Testing Environment</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Setting Up Test Keys</h3>
              <p className="mb-3">For testing with real DataSources, you'll need API keys:</p>

              <ol className="list-decimal pl-6 space-y-2">
                <li>
                  Create a <code>.env.local</code> file in the root directory
                </li>
                <li>Add your test API keys (never use production keys)</li>
              </ol>

              <CodeBlock
                language="bash"
                code={`
# .env.local example
MAESTRO_API_KEY=test_key_123
SANDSHREW_API_KEY=test_key_456
              `}
              />

              <WarningBox title="API Key Security">
                Never commit your API keys to the repository. The <code>.env.local</code> file is gitignored by default.
              </WarningBox>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Using Test Networks</h3>
              <p className="mb-3">Always use testnet or regtest for development:</p>

              <ul className="list-disc pl-6 space-y-2">
                <li>Bitcoin Testnet for integration testing</li>
                <li>Regtest for local development</li>
                <li>Mock DataSources for unit testing</li>
              </ul>

              <p className="mt-3">You can get testnet coins from faucets like:</p>

              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <a href="https://coinfaucet.eu/en/btc-testnet/" className="text-primary hover:underline">
                    coinfaucet.eu
                  </a>
                </li>
                <li>
                  <a href="https://testnet-faucet.mempool.co/" className="text-primary hover:underline">
                    testnet-faucet.mempool.co
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section id="documentation">
          <h2 className="text-2xl font-bold mb-4">Documentation</h2>

          <div className="space-y-4">
            <p>Good documentation is crucial. When making changes:</p>

            <ul className="list-disc pl-6 space-y-2">
              <li>Update or add JSDoc comments to functions and classes</li>
              <li>Update README files if necessary</li>
              <li>Add examples for new features</li>
              <li>Update the documentation website for significant changes</li>
            </ul>

            <p className="mt-4">To run the documentation website locally:</p>

            <CodeBlock
              language="bash"
              code={`
# Navigate to the docs directory
cd docs

# Install dependencies
pnpm install

# Start the development server
pnpm dev
              `}
            />

            <p className="mt-4">
              The documentation site will be available at <code>http://localhost:3000</code>.
            </p>
          </div>
        </section>

        <section id="troubleshooting">
          <h2 className="text-2xl font-bold mb-4">Troubleshooting</h2>

          <div className="space-y-4">
            <p>If you encounter issues during development:</p>

            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Clean and rebuild:</strong> Run <code>pnpm clean && pnpm install && pnpm build</code>
              </li>
              <li>
                <strong>Check for dependency issues:</strong> Run <code>pnpm why package-name</code>
              </li>
              <li>
                <strong>Verify your Node.js version:</strong> We recommend using the version specified in{" "}
                <code>.nvmrc</code>
              </li>
              <li>
                <strong>Ask for help:</strong> Join our Discord server or open a discussion on GitHub
              </li>
            </ul>
          </div>
        </section>
      </div>

      <DocNavigation
        prev={{ title: "Best Practices", href: "/docs/best-practices" }}
        next={{ title: "Pull Request Guidelines", href: "/docs/pr-guidelines" }}
      />
    </div>
  )
}

