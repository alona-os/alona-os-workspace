import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AppSidebar } from '@/components/app-sidebar'
import { AppTopbar } from '@/components/app-topbar'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
});
const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: '--font-jetbrains-mono'
});

export const metadata: Metadata = {
  title: 'Alona OS - Home Command Center',
  description: 'Personal operating system for off-grid house and small farm. IoT monitoring, resource management, tasks, expenses, automations, and protocols.',
  generator: 'v0.app',
  keywords: ['off-grid', 'home automation', 'IoT', 'farm management', 'resource monitoring'],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased bg-background">
        <div className="flex h-screen overflow-hidden">
          <AppSidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <AppTopbar />
            <main className="flex-1 overflow-y-auto bg-background">
              {children}
            </main>
          </div>
        </div>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
