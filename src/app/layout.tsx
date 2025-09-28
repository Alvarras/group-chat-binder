import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'ChatGroups - Group Chat with Collaborative Notes',
  description: 'A modern group chat application with block-based collaborative notes system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-gray-50 font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}