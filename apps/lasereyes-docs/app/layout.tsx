import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import type React from 'react'
import './globals.css'
import type { Viewport } from 'next'
import { Suspense } from 'react'
import { Header } from '@/components/header'
import { LaserEyesProvider } from '@/components/laser-eyes-provider'
import { PackageManagerProvider } from '@/components/package-manager-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { themeConfig } from '@/lib/theme-config'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: themeConfig.name,
    template: `%s | ${themeConfig.name}`,
  },
  description: themeConfig.description,
  icons: {
    icon: '/favicon.ico',
  },
  generator: 'v0.dev',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={cn('min-h-screen bg-background font-sans antialiased', inter.className)}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <PackageManagerProvider>
            <LaserEyesProvider>
              <div className="relative flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center min-h-[50vh]">
                        Loading...
                      </div>
                    }
                  >
                    {children}
                  </Suspense>
                </main>
              </div>
            </LaserEyesProvider>
          </PackageManagerProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

import './globals.css'
