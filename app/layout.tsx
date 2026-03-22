import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/Providers'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from '@/lib/constants'

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} - Nigeria's #1 Opportunity Platform`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ['scholarships nigeria', 'jobs nigeria', 'fellowships', 'internships', 'grants', 'opportunities'],
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} - Nigeria's #1 Opportunity Platform`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} - Nigeria's #1 Opportunity Platform`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
