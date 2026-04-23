import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CTP Challenge — Easy4',
  description: 'Closest to the Pin disc golf challenge tracker',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} min-h-screen`} style={{ background: '#0f0f0f', color: '#f0f0f0' }}>
        {children}
      </body>
    </html>
  )
}
