import type { Metadata } from "next"
import BestPracticesClientPage from "./BestPracticesClientPage"

export const metadata: Metadata = {
  title: "Best Practices | LaserEyes Documentation",
  description: "Best practices for using LaserEyes Bitcoin wallet connection library",
}

export default function BestPracticesPage() {
  return <BestPracticesClientPage />
}

