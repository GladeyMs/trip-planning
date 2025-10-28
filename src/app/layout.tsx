import type { Metadata } from 'next'
import AntdRegistry from '@/components/AntdRegistry'
import { LanguageProvider } from '@/contexts/LanguageContext'
import './globals.css'

export const metadata: Metadata = {
  title: 'Trip Planner',
  description: 'Personal trip planning app with file-based storage',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>
          <LanguageProvider>{children}</LanguageProvider>
        </AntdRegistry>
      </body>
    </html>
  )
}
