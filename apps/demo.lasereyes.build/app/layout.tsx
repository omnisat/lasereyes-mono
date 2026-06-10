import './globals.css'

import localFont from 'next/font/local'
import type { ReactNode } from 'react'
import { Toaster } from 'sonner'
import { cn } from '@/lib/utils'

const windows = localFont({
  src: './Windows_Regular.ttf',
  variable: '--font-windows',
})

const _pxplus = localFont({
  src: './PxPlus_IBM_VGA8.ttf',
  variable: '--font-pxplus',
})

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          'min-h-screen flex flex-col items-center justify-center text-white',
          windows.className
        )}
      >
        {children}
        <Toaster />
      </body>
    </html>
  )
}
