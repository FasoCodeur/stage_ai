import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/lib/auth-context'
import './globals.css'

const _inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'StageIA — Plateforme de Formation & Stages Virtuels',
  description: "Formez-vous aux compétences du marché grâce à l'IA. Accédez à des formations personnalisées, des stages virtuels et un suivi intelligent.",
  generator: 'fasoCodeur.com',
  icons: {
    icon: '/graduation.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#3b3fb8',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="bg-background">
      <body className="antialiased font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
