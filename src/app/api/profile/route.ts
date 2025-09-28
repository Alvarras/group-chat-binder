import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { prisma } from '@/lib/prisma'
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true
      }
    })
    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    return NextResponse.json(userProfile)
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { username, avatarUrl } = await request.json()
    if (!username || username.trim().length < 2) {
      return NextResponse.json({ error: 'Username must be at least 2 characters' }, { status: 400 })
    }
    const existingUser = await prisma.user.findFirst({
      where: {
        username: username.trim(),
        NOT: {
          id: user.id
        }
      }
    })
    if (existingUser) {
      return NextResponse.json({ error: 'Username is already taken' }, { status: 400 })
    }
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        username: username.trim(),
        avatarUrl: avatarUrl || null
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true
      }
    })
    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}