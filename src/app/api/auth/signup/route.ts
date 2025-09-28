import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, password, username } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists in database
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username: username || email.split('@')[0] }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email or username' },
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
          set() {
            // Not needed for direct auth
          },
          remove() {
            // Not needed for direct auth
          },
        },
      }
    )

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username || email.split('@')[0]
        }
      }
    })

    if (error) {
      return NextResponse.json(
        { error: 'Signup failed', details: error.message },
        { status: 400 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 400 }
      )
    }

    // If session exists (email confirmation disabled), create user in database immediately
    if (data.session) {
      try {
        await prisma.user.create({
          data: {
            id: data.user.id,
            email: data.user.email!,
            username: username || email.split('@')[0],
            password: '', // Password handled by Supabase
            avatarUrl: null,
          }
        })
      } catch (dbError) {
        console.error('Failed to create user in database:', dbError)
        // Continue anyway, user was created in Supabase
      }
    }

    // Check if user needs email confirmation
    if (!data.session) {
      return NextResponse.json({
        message: 'User created successfully. Please check your email for confirmation.',
        user: {
          id: data.user.id,
          email: data.user.email,
          username: data.user.user_metadata?.username || username
        },
        confirmation_required: true,
        instructions: {
          next_step: 'Check your email and click the confirmation link',
          login_after: 'Use POST /api/auth/token to get your access token after confirmation'
        }
      })
    }

    // If session is created immediately (email confirmation disabled)
    return NextResponse.json({
      message: 'User created and logged in successfully',
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      token_type: 'Bearer',
      expires_at: data.session.expires_at,
      expires_in: data.session.expires_in,
      user: {
        id: data.user.id,
        email: data.user.email,
        username: data.user.user_metadata?.username || username
      },
      instructions: {
        usage: 'Copy the access_token and use it as Bearer token in Authorization header',
        example: 'Authorization: Bearer ' + data.session.access_token,
        expires: new Date((data.session.expires_at || 0) * 1000).toISOString()
      }
    })

  } catch (error) {
    console.error('Error during signup:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}