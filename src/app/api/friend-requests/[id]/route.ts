import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { prisma } from '@/lib/prisma'
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: requestId } = await params
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { action } = await request.json()
    if (!['accept', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: requestId },
      include: {
        fromUser: {
          select: { id: true, username: true, email: true }
        },
        toUser: {
          select: { id: true, username: true, email: true }
        }
      }
    })
    if (!friendRequest) {
      return NextResponse.json({ error: 'Friend request not found' }, { status: 404 })
    }
    if (friendRequest.toUserId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    if (friendRequest.status !== 'PENDING') {
      return NextResponse.json({ error: 'Friend request already processed' }, { status: 400 })
    }
    const updatedRequest = await prisma.friendRequest.update({
      where: { id: requestId },
      data: { 
        status: action === 'accept' ? 'ACCEPTED' : 'DECLINED'
      }
    })
    if (action === 'accept') {
      await prisma.friendship.create({
        data: {
          userId: friendRequest.fromUserId,
          friendId: friendRequest.toUserId
        }
      })
      await prisma.friendship.create({
        data: {
          userId: friendRequest.toUserId,
          friendId: friendRequest.fromUserId
        }
      })
    }
    return NextResponse.json({ success: true, action })
  } catch (error) {
    console.error('Handle friend request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: requestId } = await params
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: requestId }
    })
    if (!friendRequest) {
      return NextResponse.json({ error: 'Friend request not found' }, { status: 404 })
    }
    if (friendRequest.fromUserId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    if (friendRequest.status !== 'PENDING') {
      return NextResponse.json({ error: 'Cannot cancel processed friend request' }, { status: 400 })
    }
    await prisma.friendRequest.delete({
      where: { id: requestId }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cancel friend request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}