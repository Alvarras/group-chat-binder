import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { prisma } from '@/lib/prisma'
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: partnerId } = await params
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: user.id, friendId: partnerId },
          { userId: partnerId, friendId: user.id }
        ]
      }
    })
    if (!friendship) {
      return NextResponse.json({ error: 'You can only view messages with friends' }, { status: 403 })
    }
    const messages = await prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId: user.id, receiverId: partnerId },
          { senderId: partnerId, receiverId: user.id }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })
    await prisma.directMessage.updateMany({
      where: {
        senderId: partnerId,
        receiverId: user.id,
        read: false
      },
      data: { read: true }
    })
    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Get DM messages error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}