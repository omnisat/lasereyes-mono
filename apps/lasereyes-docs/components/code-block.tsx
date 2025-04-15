'use client'

import { useState, useEffect } from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Prism from 'prismjs'

// Import Prism languages
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-markdown'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-markup' // For HTML highlighting

// Import Prism theme (base theme, we'll override with our custom styles)
import 'prismjs/themes/prism-tomorrow.css'

interface CodeBlockProps {
  code: string
  language: string
  fileName?: string
  showLineNumbers?: boolean
  className?: string
  copyButton?: boolean
  tabs?: { [key: string]: string }
}

export function CodeBlock({
  code,
  language,
  fileName,
  showLineNumbers = true,
  className,
  copyButton = true,
  tabs,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      Prism.highlightAll()
    }
  }, [code, language, tabs])

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Fix the line number alignment by updating the renderCode function

  const renderCode = (codeString: string, lang: string) => {
    const lines = codeString.split('\n')

    return (
      <div
        className={cn(
          'relative py-2 rounded-none overflow-hidden border-y border-border',
          className
        )}
      >
        <div className="flex w-full rounded-md px-4 bg-[hsl(var(--code-bg))]">
          <pre className={cn('overflow-x-auto py-4 flex-1 m-0 !bg-none')}>
            <code
              className={`language-${lang} leading-[1.5rem] text-[13px] md:text-sm`}
            >
              {codeString}
            </code>
          </pre>
        </div>
        {copyButton && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-3 h-8 w-8 rounded-md opacity-70 hover:opacity-100"
            onClick={copyToClipboard}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span className="sr-only">Copy code</span>
          </Button>
        )}
      </div>
    )
  }

  if (tabs) {
    return (
      <div className="relative w-full max-w-full overflow-x-auto">
        {fileName && (
          <div className="text-sm text-muted-foreground mb-2">{fileName}</div>
        )}
        <Tabs defaultValue={Object.keys(tabs)[0]}>
          <div className="flex items-center justify-between">
            <TabsList>
              {Object.keys(tabs).map((tab) => (
                <TabsTrigger key={tab} value={tab}>
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {Object.entries(tabs).map(([tab, tabCode]) => (
            <TabsContent key={tab} value={tab}>
              {renderCode(tabCode, language)}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    )
  }

  return (
    <div className="relative w-full max-w-full overflow-x-auto">
      {fileName && (
        <div className="text-sm text-muted-foreground mb-2">{fileName}</div>
      )}
      {renderCode(code, language)}
    </div>
  )
}
