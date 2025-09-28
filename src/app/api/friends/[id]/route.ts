import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { prisma } from '@/lib/prisma'
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: friendId } = await params
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId: user.id, friendId: friendId },
          { userId: friendId, friendId: user.id }
        ]
      }
    })
    if (friendships.length === 0) {
      return NextResponse.json({ error: 'Friendship not found' }, { status: 404 })
    }
    await prisma.friendship.deleteMany({
      where: {
        OR: [
          { userId: user.id, friendId: friendId },
          { userId: friendId, friendId: user.id }
        ]
      }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Remove friend error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}