import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import ProviderWrapper from '../components/ProviderWrapper'

export const metadata: Metadata = {
  title: 'Silver Shop Admin',
  description: 'Admin panel for managing silver shop products and inventory',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 font-sans antialiased">
        <ProviderWrapper>
          {children}
        </ProviderWrapper>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#10b981',
              },
            },
            error: {
              style: {
                background: '#ef4444',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
