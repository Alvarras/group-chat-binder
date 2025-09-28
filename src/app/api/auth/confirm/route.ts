import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { token_hash, type } = await request.json()

    if (!token_hash || type !== 'email') {
      return NextResponse.json(
        { error: 'Invalid confirmation parameters' },
        { status: 400 }
      )
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get() {
            return undefined
          },
          set() {},
          remove() {},
        },
      }
    )

    // Verify the token
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: 'email'
    })

    if (error || !data.user) {
      return NextResponse.json(
        { error: 'Invalid or expired confirmation token' },
        { status: 400 }
      )
    }

    // Create user in database if not exists
    const existingUser = await prisma.user.findUnique({
      where: { id: data.user.id }
    })

    if (!existingUser) {
      await prisma.user.create({
        data: {
          id: data.user.id,
          email: data.user.email!,
          username: data.user.user_metadata?.username || data.user.email!.split('@')[0],
          password: '', // Password handled by Supabase
          avatarUrl: data.user.user_metadata?.avatar_url || null,
        }
      })
    }

    return NextResponse.json({
      message: 'Email confirmed successfully! User profile created.',
      user: {
        id: data.user.id,
        email: data.user.email,
        username: data.user.user_metadata?.username || data.user.email?.split('@')[0]
      },
      session: data.session
    })

  } catch (error) {
    console.error('Email confirmation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}