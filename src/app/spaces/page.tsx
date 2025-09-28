'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SpacesPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard since spaces are accessed directly from there
    router.push('/dashboard')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
}
