"use client"

import { usePackageManager } from "./package-manager-provider"
import { CodeBlock } from "./code-block"

interface InstallationCommandProps {
  packages: string[]
  className?: string
}

export function InstallationCommand({ packages, className }: InstallationCommandProps) {
  const { packageManager } = usePackageManager()

  const getCommand = () => {
    const pkgs = packages.join(" ")
    switch (packageManager) {
      case "npm":
        return `npm install ${pkgs}`
      case "yarn":
        return `yarn add ${pkgs}`
      case "pnpm":
        return `pnpm add ${pkgs}`
      default:
        return `npm install ${pkgs}`
    }
  }

  return <CodeBlock language="bash" code={getCommand()} copyButton={true} className={className} />
}

