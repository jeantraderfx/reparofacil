import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth/context'

export const metadata: Metadata = {
  title: 'ReparoFácil — Profesionales de confianza en tu zona',
  description: 'Encuentra electricistas, fontaneros, pintores y más profesionales verificados cerca de ti.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
