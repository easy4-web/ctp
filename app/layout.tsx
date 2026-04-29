import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import Script from 'next/script'
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
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-59D3PFZH9G" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-59D3PFZH9G');
        `}</Script>
        {children}
      </body>
    </html>
  )
}
