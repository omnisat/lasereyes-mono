import type { Metadata } from "next"
import PRGuidelinesClientPage from "./PRGuidelinesClientPage"

export const metadata: Metadata = {
  title: "Pull Request Guidelines | LaserEyes Documentation",
  description: "Guidelines for submitting pull requests to the LaserEyes project",
}

export default function PRGuidelinesPage() {
  return <PRGuidelinesClientPage />
}

