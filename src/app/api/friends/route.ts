import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { prisma } from '@/lib/prisma'
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const friendships = await prisma.friendship.findMany({
      where: { userId: user.id },
      include: {
        friend: {
          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    const friends = friendships.map(friendship => ({
      id: friendship.friend.id,
      username: friendship.friend.username,
      email: friendship.friend.email,
      avatarUrl: friendship.friend.avatarUrl,
      status: 'offline',
      friendshipId: friendship.id,
      friendsSince: friendship.createdAt
    }))
    return NextResponse.json({ friends })
  } catch (error) {
    console.error('Get friends error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}