import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'

import Providers from '@/components/Providers'
import { Footer } from '@/components/Footer'
import GlobalNavbar from '@/components/GlobalNavbar'

// Partner logo for footer
const acuminPro = localFont({
  src: [
    {
      path: '../../assets/fonts/Acumin-Pro-Book.otf',
      weight: '400',
    },
    {
      path: '../../assets/fonts/Acumin-Pro-Bold.otf',
      weight: '700',
    },
  ],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Restoration Diagnostic',
  description: 'WRI Restoration Diagnostic',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body className={`${acuminPro.className} antialiased`}>
        <Providers>
          <GlobalNavbar />
          <div className='pb-44 lg:pb-0'>{children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
