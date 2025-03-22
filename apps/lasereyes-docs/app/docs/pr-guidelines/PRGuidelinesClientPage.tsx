"use client"

import * as React from "react"
import { CodeBlock } from "@/components/code-block"
import { Heading } from "@/components/heading"
import { ClientPageWrapper } from "@/components/client-page-wrapper"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  GitBranch,
  CheckCircle2,
  GitPullRequest,
  MessageSquare,
  FileCode2,
  AlertTriangle,
  GitMerge,
  GitCommit,
  TestTube,
  Hammer,
  CheckCheck,
  HelpCircle
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface GuidelineCardProps {
  icon: LucideIcon
  title: string
  description?: string
  content: React.ReactNode
  className?: string
}

function GuidelineCard({ icon: Icon, title, description, content, className }: GuidelineCardProps) {
  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300 hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/5",
      className
    )}>
      <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-teal-500/10 blur-2xl filter group-hover:bg-teal-500/20" />
      <CardContent className="p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-500">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mb-2 text-xl font-semibold">{title}</h3>
        {description && <p className="mb-4 text-muted-foreground">{description}</p>}
        {content}
      </CardContent>
    </Card>
  )
}

function PRGuidelinesContent() {
  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Before Submitting</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <GuidelineCard
            icon={CheckCircle2}
            title="Pre-submission Checklist"
            content={
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Badge variant="outline">Check</Badge>
                  <span>Review existing issues & PRs</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline">Discuss</Badge>
                  <span>Major changes need discussion</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline">Document</Badge>
                  <span>Update relevant documentation</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline">Test</Badge>
                  <span>Add tests & ensure all pass</span>
                </li>
              </ul>
            }
          />
          <GuidelineCard
            icon={Hammer}
            title="Run Quality Checks"
            content={
              <div className="space-y-4">
                <CodeBlock
                  language="bash"
                  code={`# Before submitting, run:
pnpm build
pnpm test
pnpm lint
pnpm format`}
                  copyButton={true}
                />
              </div>
            }
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Pull Request Process</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <GuidelineCard
            icon={GitBranch}
            title="Branch Naming"
            content={
              <CodeBlock
                language="bash"
                code={`# Feature branches
git checkout -b feature/descriptive-name

# Bug fixes
git checkout -b fix/issue-description

# Documentation
git checkout -b docs/what-you-document

# Performance
git checkout -b perf/what-you-improve`}
                copyButton={true}
              />
            }
          />
          <GuidelineCard
            icon={GitCommit}
            title="Commit Messages"
            content={
              <div className="space-y-4">
                <CodeBlock
                  language="text"
                  code={`# Format
<type>(<scope>): <subject>

# Examples
feat(core): add taproot support
fix(react): resolve mobile connection
docs(api): update DataSource docs
test(core): add fee estimation tests`}
                  copyButton={true}
                />
              </div>
            }
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">PR Guidelines</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <GuidelineCard
            icon={GitPullRequest}
            title="Keep PRs Focused"
            content={
              <div className="space-y-4">
                <ul className="space-y-2 text-muted-foreground">
                  <li>• One feature or fix per PR</li>
                  <li>• Clear scope and purpose</li>
                  <li>• Minimal scope creep</li>
                  <li>• Split large changes into smaller PRs</li>
                </ul>
                <div className="rounded-md bg-muted p-4">
                  <p className="text-sm">Good PR title examples:</p>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>"Add Taproot address support"</li>
                    <li>"Fix wallet timeout on slow networks"</li>
                    <li>"Update DataSourceManager docs"</li>
                  </ul>
                </div>
              </div>
            }
          />
          <GuidelineCard
            icon={TestTube}
            title="Testing Requirements"
            content={
              <div className="space-y-4">
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Unit tests for new features</li>
                  <li>• Integration tests for interactions</li>
                  <li>• Edge case coverage</li>
                  <li>• Maintain test coverage levels</li>
                </ul>
                <div className="rounded-md border-l-4 border-yellow-500 bg-yellow-500/10 p-4">
                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span>PRs that decrease coverage may need additional tests</span>
                  </div>
                </div>
              </div>
            }
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold">Review Process</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <GuidelineCard
            icon={MessageSquare}
            title="Responding to Feedback"
            content={
              <ul className="space-y-2 text-muted-foreground">
                <li>• Address all review comments</li>
                <li>• Explain disagreements constructively</li>
                <li>• Push additional commits as needed</li>
                <li>• Keep the discussion focused</li>
                <li>• Be patient and responsive</li>
              </ul>
            }
          />
          <GuidelineCard
            icon={GitMerge}
            title="Merging Process"
            content={
              <div className="space-y-4">
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Wait for CI checks to pass</li>
                  <li>• Get required approvals</li>
                  <li>• Rebase if requested</li>
                  <li>• Squash commits when merging</li>
                </ul>
                <div className="rounded-md bg-muted p-4">
                  <p className="text-sm font-medium">After merge:</p>
                  <CodeBlock
                    language="bash"
                    code={`git checkout main
git pull upstream main
git push origin main
git branch -d feature/your-feature`}
                    copyButton={true}
                  />
                </div>
              </div>
            }
          />
        </div>
      </section>

      <section className="space-y-6">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-500">
                <HelpCircle className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Need Help?</h2>
                <p className="text-muted-foreground">We're here to support your contribution journey</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-md bg-muted p-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Join our Discord community for real-time help</li>
                  <li>• Open a Discussion on GitHub for longer conversations</li>
                  <li>• Check our Contributing Guide for detailed information</li>
                  <li>• Review existing PRs for examples and patterns</li>
                </ul>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCheck className="h-4 w-4 text-teal-500" />
                <span>Remember: No question is too small - we value all contributions!</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

export default function PRGuidelinesClientPage() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-teal-500/10 via-background to-background p-8">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-teal-500/20 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
        <Badge variant="secondary" className="mb-4">Contributing</Badge>
        <Heading level={1} className="mb-4 bg-gradient-to-br from-teal-500 to-cyan-500 bg-clip-text text-transparent">
          Pull Request Guidelines
        </Heading>
        <p className="text-xl mb-6 max-w-2xl text-muted-foreground">
          Learn how to contribute effectively to LaserEyes with our comprehensive pull request guidelines and best practices.
        </p>
      </div>

      <ClientPageWrapper>
        <PRGuidelinesContent />
      </ClientPageWrapper>
    </div>
  )
} 