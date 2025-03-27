"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { CodeBlock } from "@/components/code-block"

interface DataSourcePlaygroundProps {
  className?: string
}

type DataSource = "maestro" | "sandshrew" | "mempool"

const methods = [
  {
    name: "getBalance",
    description: "Get the balance of an address",
    code: (dataSources: DataSource[]) => `// Get balance using ${dataSources.join(", ")}
const balance = await dataSourceManager.getBalance("bc1q...");
console.log(\`Balance: \${balance} satoshis\`);`,
  },
  {
    name: "getTransaction",
    description: "Get transaction details",
    code: (dataSources: DataSource[]) => `// Get transaction details using ${dataSources.join(", ")}
const tx = await dataSourceManager.getTransaction("txid...");
console.log(tx);`,
  },
  {
    name: "getInscriptions",
    description: "Get inscriptions for an address",
    code: (dataSources: DataSource[]) => `// Get inscriptions using ${dataSources.join(", ")}
const inscriptions = await dataSourceManager.getInscriptions("bc1q...");
console.log(\`Found \${inscriptions.length} inscriptions\`);`,
  },
  {
    name: "getUtxos",
    description: "Get UTXOs for an address",
    code: (dataSources: DataSource[]) => `// Get UTXOs using ${dataSources.join(", ")}
const utxos = await dataSourceManager.getUtxos("bc1q...");
console.log(\`Found \${utxos.length} UTXOs\`);`,
  },
]

export function DataSourcePlayground({ className }: DataSourcePlaygroundProps) {
  const [activeDataSources, setActiveDataSources] = useState<DataSource[]>(["maestro"])
  const [activeMethod, setActiveMethod] = useState(methods[0].name)

  const toggleDataSource = (dataSource: DataSource) => {
    setActiveDataSources((prev) => {
      if (prev.includes(dataSource)) {
        // Don't allow removing the last data source
        if (prev.length === 1) return prev
        return prev.filter((ds) => ds !== dataSource)
      } else {
        return [...prev, dataSource]
      }
    })
  }

  const currentMethod = methods.find((m) => m.name === activeMethod) || methods[0]

  const configCode = `// Configure data sources
const config = {
  network: MAINNET,
  dataSources: {
${
  activeDataSources.includes("maestro")
    ? `    maestro: {
      apiKey: "your-api-key" // Optional for development
    },`
    : ""
}
${
  activeDataSources.includes("sandshrew")
    ? `    sandshrew: {
      apiKey: "your-api-key" // Optional for development
    },`
    : ""
}
${
  activeDataSources.includes("mempool")
    ? `    mempool: {
      url: "https://mempool.space/api"
    },`
    : ""
}
  }
};

// Initialize the data source manager
const dataSourceManager = new DataSourceManager(config);`

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <CardTitle>Data Source Manager Playground</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="maestro"
                checked={activeDataSources.includes("maestro")}
                onCheckedChange={() => toggleDataSource("maestro")}
              />
              <Label htmlFor="maestro">Maestro</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="sandshrew"
                checked={activeDataSources.includes("sandshrew")}
                onCheckedChange={() => toggleDataSource("sandshrew")}
              />
              <Label htmlFor="sandshrew">Sandshrew</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="mempool"
                checked={activeDataSources.includes("mempool")}
                onCheckedChange={() => toggleDataSource("mempool")}
              />
              <Label htmlFor="mempool">Mempool.space</Label>
            </div>
          </div>

          <div className="border rounded-md p-4">
            <CodeBlock language="typescript" code={configCode} copyButton={true} />
          </div>

          <Tabs defaultValue={methods[0].name} value={activeMethod} onValueChange={setActiveMethod}>
            <TabsList className="grid grid-cols-1 md:grid-cols-4">
              {methods.map((method) => (
                <TabsTrigger key={method.name} value={method.name}>
                  {method.name}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">{currentMethod.description}</p>
              <CodeBlock language="typescript" code={currentMethod.code(activeDataSources)} copyButton={true} />
            </div>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  )
}

