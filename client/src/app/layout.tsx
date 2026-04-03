import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import { ClientProviders } from '@/components/ClientProviders'
import { siteConfig } from '@/lib/metadata'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
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

// Set lang attribute from URL path to prevent flash
const langScript = `
  (function() {
    var seg = window.location.pathname.split('/')[1];
    if (seg === 'en') document.documentElement.lang = 'en';
    else document.documentElement.lang = 'ko';
  })();
`;

// Prevent flash of incorrect theme
const themeScript = `
  (function() {
    var theme = localStorage.getItem('theme');
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: langScript + themeScript }} />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}
