import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    console.log('Webhook payload:', payload)

    // Verify the webhook is from Supabase (optional but recommended)
    const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET
    if (webhookSecret) {
      const signature = request.headers.get('x-webhook-signature')
      // Add signature verification if needed
    }

    // Handle user confirmation event
    if (payload.type === 'user.confirmed' || payload.type === 'signup') {
      const userData = payload.record || payload.user
      
      if (userData && userData.id) {
        const existingUser = await prisma.user.findUnique({
          where: { id: userData.id }
        })

        if (!existingUser) {
          // Create user in database
          await prisma.user.create({
            data: {
              id: userData.id,
              email: userData.email,
              username: userData.user_metadata?.username || userData.email?.split('@')[0] || 'user',
              password: '', // Password is handled by Supabase Auth
              avatarUrl: userData.user_metadata?.avatar_url || null,
            }
          })

          console.log('User created in database:', userData.id)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}