import type { Metadata } from "next"
import CommonIssuesClientPage from "./CommonIssuesClientPage"

export const metadata: Metadata = {
  title: "Common Issues | LaserEyes Documentation",
  description: "Troubleshooting common issues with LaserEyes Bitcoin wallet connection library",
}

export default function CommonIssuesPage() {
  return <CommonIssuesClientPage />
}

