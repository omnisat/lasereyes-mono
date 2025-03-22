import type { Metadata } from "next"
import CodeOfConductClientPage from "./CodeOfConductClientPage"

export const metadata: Metadata = {
  title: "Code of Conduct | LaserEyes Documentation",
  description: "Code of Conduct for the LaserEyes community and contributors",
}

export default function CodeOfConductPage() {
  return <CodeOfConductClientPage />
}

