import type { Metadata } from "next"
import DevelopmentSetupClientPage from "./DevelopmentSetupClientPage"

export const metadata: Metadata = {
  title: "Development Setup | LaserEyes Documentation",
  description: "Setting up your development environment for contributing to LaserEyes",
}

export default function DevelopmentSetupPage() {
  return <DevelopmentSetupClientPage />
}

