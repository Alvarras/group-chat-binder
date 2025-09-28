'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useState } from 'react'
import { SupabaseProvider } from '@/lib/supabase/auth-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  // Create a client instance for each provider tree
  // This ensures each page has its own QueryClient instance
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000, // 1 minute
            retry: (failureCount, error) => {
              // Don't retry on 401/403 errors
              if (error && typeof error === 'object' && 'status' in error) {
                const status = (error as any).status
                if (status === 401 || status === 403) {
                  return false
                }
              }
              return failureCount < 3
            },
          },
          mutations: {
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </SupabaseProvider>
    </QueryClientProvider>
  )
}