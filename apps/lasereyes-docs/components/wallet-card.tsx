import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { WalletIcon } from "@kevinoyl/lasereyes-react"
import { UNISAT, XVERSE, OYL, LEATHER, MAGIC_EDEN, OKX, PHANTOM, WIZZ, ORANGE, OP_NET } from "@kevinoyl/lasereyes-core"

interface WalletCardProps {
  name: string
  provider: string
  className?: string
}

// Map wallet names to their provider constants
const walletProviders: Record<string, string> = {
  UniSat: UNISAT,
  Xverse: XVERSE,
  OYL: OYL,
  Leather: LEATHER,
  "Magic Eden": MAGIC_EDEN,
  OKX: OKX,
  Phantom: PHANTOM,
  Wizz: WIZZ,
  Orange: ORANGE,
  OP_NET: OP_NET,
}

export function WalletCard({ name, className }: WalletCardProps) {
  const provider = walletProviders[name] || name

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6 flex flex-col items-center justify-center">
        <div className="h-12 w-12 mb-2 flex items-center justify-center">
          <WalletIcon walletName={provider} size={42} />
        </div>
        <p className="text-sm font-medium">{name}</p>
      </CardContent>
    </Card>
  )
}

