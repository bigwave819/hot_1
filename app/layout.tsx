// src/app/layout.tsx
import type { Metadata } from 'next'
import { DM_Sans, Cormorant_Garamond } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { hotelConfig } from '@/config/hotel.config'
import './globals.css'

const dmSans = DM_Sans({
  subsets:  ['latin'],
  weight:   ['300', '400', '500'],
  variable: '--font-dm-sans',
  display:  'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight:  ['300', '400', '500'],
  style:   ['normal', 'italic'],
  variable: '--font-cormorant',
  display:  'swap',
})

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export const metadata: Metadata = {
  title:       { template: `%s | ${hotelConfig.name}`, default: hotelConfig.seo.title },
  description: hotelConfig.seo.description,
  keywords:    [...hotelConfig.seo.keywords],
  metadataBase: new URL(appUrl),
  openGraph: {
    siteName: hotelConfig.name,
    images:   [hotelConfig.seo.ogImage],
    locale:   'en_US',
    type:     'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${dmSans.variable} ${cormorant.variable}`}
    >
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}