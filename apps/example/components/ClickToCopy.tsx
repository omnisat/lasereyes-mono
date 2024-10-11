'use client'

import { JSX, SVGProps, useState } from 'react'
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'

export default function ClickToCopy({ value }: { value: string | undefined }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    if (typeof value === 'string') {
      navigator.clipboard.writeText(value)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              disabled={!value}
              variant="outline"
              onClick={handleCopy}
              className={'bg-transparent border-[#3c393f]'}
              size={'sm'}
            >
              <CopyIcon className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Click to copy value</TooltipContent>
        </Tooltip>
        {copied && <div className="text-sm text-muted-foreground">Copied!</div>}
      </div>
    </TooltipProvider>
  )
}

function CopyIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  )
}
