import type { Metadata } from "next"
import { CodeBlock } from "@/components/code-block"
import { DocNavigation } from "@/components/doc-navigation"
import { WarningBox } from "@/components/warning-box"

export const metadata: Metadata = {
  title: "Pull Request Guidelines | LaserEyes Documentation",
  description: "Guidelines for submitting pull requests to the LaserEyes project",
}

export default function PRGuidelinesPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold mb-6">Pull Request Guidelines</h1>
      <p className="text-lg mb-8">
        This guide outlines the process for submitting pull requests to the LaserEyes project. Following these
        guidelines helps maintainers understand your changes and review them more efficiently.
      </p>

      <div className="space-y-12">
        <section id="before-submitting">
          <h2 className="text-2xl font-bold mb-4">Before Submitting a Pull Request</h2>

          <div className="space-y-4">
            <p>Before you submit a pull request, make sure you've completed these steps:</p>

            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Check existing issues and PRs:</strong> Make sure your change hasn't already been proposed or
                implemented
              </li>
              <li>
                <strong>Discuss major changes:</strong> For significant changes, open an issue first to discuss the
                approach
              </li>
              <li>
                <strong>Update documentation:</strong> Ensure any new features or changes are properly documented
              </li>
              <li>
                <strong>Write tests:</strong> Add tests for new features or bug fixes
              </li>
              <li>
                <strong>Run the test suite:</strong> Make sure all tests pass
              </li>
              <li>
                <strong>Format your code:</strong> Run linting and formatting tools
              </li>
            </ul>

            <CodeBlock
              language="bash"
              code={`
# Before submitting, run these commands
pnpm build
pnpm test
pnpm lint
pnpm format
              `}
            />
          </div>
        </section>

        <section id="pr-process">
          <h2 className="text-2xl font-bold mb-4">Pull Request Process</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">1. Create a Branch</h3>
              <p className="mb-3">Create a branch with a descriptive name:</p>

              <CodeBlock
                language="bash"
                code={`
# For features
git checkout -b feature/descriptive-feature-name

# For bug fixes
git checkout -b fix/issue-description

# For documentation
git checkout -b docs/what-you-are-documenting

# For performance improvements
git checkout -b perf/what-you-are-improving
              `}
              />
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">2. Make Your Changes</h3>
              <p className="mb-3">When making changes:</p>

              <ul className="list-disc pl-6 space-y-2">
                <li>Follow the coding style of the project</li>
                <li>Keep commits focused and atomic</li>
                <li>Write clear commit messages</li>
              </ul>

              <CodeBlock
                language="text"
                code={`
# Good commit message format
<type>(<scope>): <subject>

# Examples
feat(core): add support for taproot addresses
fix(react): resolve wallet connection issue on mobile
docs(api): update DataSourceManager documentation
test(maestro): add tests for fee estimation
              `}
              />
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">3. Submit Your Pull Request</h3>
              <p className="mb-3">When you're ready to submit:</p>

              <ol className="list-decimal pl-6 space-y-2">
                <li>Push your branch to your fork</li>
                <li>Create a pull request against the main branch of the original repository</li>
                <li>Fill out the PR template completely</li>
              </ol>

              <p className="mt-3">Our PR template will ask for:</p>

              <ul className="list-disc pl-6 space-y-2">
                <li>A description of the changes</li>
                <li>Related issues</li>
                <li>Type of change (bug fix, feature, etc.)</li>
                <li>Checklist of completed items</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="pr-guidelines">
          <h2 className="text-2xl font-bold mb-4">Pull Request Guidelines</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Keep PRs Focused</h3>
              <p className="mb-3">Each pull request should address a single concern:</p>

              <ul className="list-disc pl-6 space-y-2">
                <li>Implement a single feature</li>
                <li>Fix a specific bug</li>
                <li>Improve a particular aspect of performance</li>
                <li>Update a specific section of documentation</li>
              </ul>

              <p className="mt-3">If you have multiple unrelated changes, submit separate pull requests.</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Write Descriptive Titles and Descriptions</h3>
              <p className="mb-3">
                Your PR title and description should clearly communicate the purpose of the changes:
              </p>

              <div className="bg-muted p-4 rounded-md">
                <p className="font-semibold">Good PR title examples:</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>"Add support for Taproot addresses in LaserEyesClient"</li>
                  <li>"Fix wallet connection timeout on slow networks"</li>
                  <li>"Improve transaction fee estimation accuracy"</li>
                  <li>"Update documentation for DataSourceManager API"</li>
                </ul>
              </div>

              <p className="mt-4">In the description, include:</p>

              <ul className="list-disc pl-6 space-y-2">
                <li>The problem you're solving</li>
                <li>Your approach to solving it</li>
                <li>Any trade-offs or considerations</li>
                <li>How to test the changes</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Include Tests</h3>
              <p className="mb-3">All new features and bug fixes should include tests:</p>

              <ul className="list-disc pl-6 space-y-2">
                <li>Unit tests for individual functions and components</li>
                <li>Integration tests for feature interactions</li>
                <li>Edge case tests for bug fixes</li>
              </ul>

              <WarningBox title="Test Coverage">
                We aim to maintain high test coverage. PRs that decrease coverage significantly may need additional
                tests before being merged.
              </WarningBox>
            </div>
          </div>
        </section>

        <section id="review-process">
          <h2 className="text-2xl font-bold mb-4">Review Process</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Initial Review</h3>
              <p className="mb-3">After submitting your PR:</p>

              <ol className="list-decimal pl-6 space-y-2">
                <li>GitHub Actions will run automated checks</li>
                <li>A maintainer will perform an initial review</li>
                <li>You may be asked to make changes</li>
              </ol>

              <p className="mt-3">
                Address any CI failures promptly. If you're unsure how to fix an issue, ask for help in the PR comments.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Responding to Feedback</h3>
              <p className="mb-3">When you receive feedback:</p>

              <ul className="list-disc pl-6 space-y-2">
                <li>Respond to all comments</li>
                <li>Make requested changes or explain why you disagree</li>
                <li>Push additional commits to your branch</li>
                <li>Avoid force-pushing unless necessary</li>
              </ul>

              <p className="mt-3">
                It's normal for PRs to go through several rounds of review. Be patient and responsive.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Approval and Merging</h3>
              <p className="mb-3">Once your PR is approved:</p>

              <ol className="list-decimal pl-6 space-y-2">
                <li>A maintainer will approve the PR</li>
                <li>You may be asked to rebase or squash commits</li>
                <li>A maintainer will merge the PR</li>
              </ol>

              <p className="mt-3">We typically squash commits when merging to keep the history clean.</p>
            </div>
          </div>
        </section>

        <section id="after-merging">
          <h2 className="text-2xl font-bold mb-4">After Merging</h2>

          <div className="space-y-4">
            <p>After your PR is merged:</p>

            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Update your fork:</strong> Sync your fork with the upstream repository
              </li>
              <li>
                <strong>Delete your branch:</strong> Clean up your local and remote branches
              </li>
              <li>
                <strong>Monitor for issues:</strong> Keep an eye on the CI pipeline and any issues that might arise
              </li>
              <li>
                <strong>Celebrate:</strong> You've contributed to LaserEyes! 🎉
              </li>
            </ul>

            <CodeBlock
              language="bash"
              code={`
# Update your fork after merge
git checkout main
git pull upstream main
git push origin main

# Delete your branch
git branch -d feature/your-feature
git push origin --delete feature/your-feature
              `}
            />
          </div>
        </section>
      </div>

      <DocNavigation
        prev={{ title: "Development Setup", href: "/docs/development-setup" }}
        next={{ title: "Code of Conduct", href: "/docs/code-of-conduct" }}
      />
    </div>
  )
}

