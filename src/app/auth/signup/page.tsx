'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/atoms/Button/Button'
import { Input } from '@/components/atoms/Input/Input'
import { Mail, Lock, User } from 'lucide-react'
import { showSuccessToast, showErrorToast } from '@/lib/toast'
import { createClient } from '@/lib/supabase/client'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      })

      if (error) {
        showErrorToast(error.message)
      } else {
        // Create user profile in our database after successful auth signup
        if (data.user) {
          try {
            const response = await fetch('/api/auth/create-profile', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                id: data.user.id,
                email,
                username,
              }),
            })

            if (response.ok) {
              showSuccessToast('Account created successfully! Please check your email to confirm your account.')
              router.push('/auth/signin')
            } else {
              const errorData = await response.json()
              showErrorToast(errorData.error || 'Failed to create user profile')
            }
          } catch (err) {
            showErrorToast('Failed to create user profile')
          }
        } else {
          showSuccessToast('Please check your email to confirm your account.')
          router.push('/auth/signin')
        }
      }
    } catch (error) {
      showErrorToast('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center p-4">
      <div className="card w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create account</h1>
          <p className="text-gray-600">Join the ChatGroups community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            icon={<User className="w-5 h-5" />}
            placeholder="Enter your username"
            required
          />

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-5 h-5" />}
            placeholder="Enter your email"
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-5 h-5" />}
            placeholder="Enter your password"
            required
          />

          <Button
            type="submit"
            loading={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            Create account
          </Button>
        </form>

        <div className="mt-8 text-center">
          <span className="text-gray-600">
            Already have an account?{' '}
            <Link
              href="/auth/signin"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
            >
              Sign in
            </Link>
          </span>
        </div>
      </div>
    </div>
  )
}