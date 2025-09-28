'use client'

import { useSupabase } from '@/lib/supabase/auth-provider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function HomePage() {
  const { user, loading } = useSupabase()
  const router = useRouter()

  useEffect(() => {
    if (loading) return // Still loading

    if (user) {
      router.push('/dashboard')
    } else {
      router.push('/auth/signin')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-red-500 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h1 className="text-3xl font-bold text-blue-600 mb-4">Tailwind CSS Test</h1>
          <p className="text-gray-600 mb-4">If you see this page with a red background and styled white card, Tailwind is working!</p>
          <div className="bg-green-500 text-white p-4 rounded">
            <p className="font-semibold">Loading ChatGroups...</p>
          </div>
          <div className="flex items-center justify-center space-x-2 mt-6">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    )
  }

  return null
}