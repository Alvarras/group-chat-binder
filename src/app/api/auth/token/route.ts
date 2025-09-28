import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set() {
            // Not needed for token retrieval
          },
          remove() {
            // Not needed for token retrieval  
          },
        },
      }
    )

    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to get session', details: error.message },
        { status: 401 }
      )
    }

    if (!session) {
      return NextResponse.json(
        { error: 'No active session found. Please login first.' },
        { status: 401 }
      )
    }

    // Return token information
    return NextResponse.json({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      token_type: 'Bearer',
      expires_at: session.expires_at,
      expires_in: session.expires_in,
      user: {
        id: session.user.id,
        email: session.user.email,
        username: session.user.user_metadata?.username || session.user.email
      },
      instructions: {
        usage: 'Copy the access_token and use it as Bearer token in Authorization header',
        example: 'Authorization: Bearer ' + session.access_token,
        expires: new Date((session.expires_at || 0) * 1000).toISOString()
      }
    })

  } catch (error) {
    console.error('Error getting token:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
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

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: 'Authentication failed', details: error.message },
        { status: 401 }
      )
    }

    if (!data.session) {
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 401 }
      )
    }

    // Return token information
    return NextResponse.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      token_type: 'Bearer',
      expires_at: data.session.expires_at,
      expires_in: data.session.expires_in,
      user: {
        id: data.session.user.id,
        email: data.session.user.email,
        username: data.session.user.user_metadata?.username || data.session.user.email
      },
      instructions: {
        usage: 'Copy the access_token and use it as Bearer token in Authorization header',
        example: 'Authorization: Bearer ' + data.session.access_token,
        expires: new Date((data.session.expires_at || 0) * 1000).toISOString()
      }
    })

  } catch (error) {
    console.error('Error during login:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}