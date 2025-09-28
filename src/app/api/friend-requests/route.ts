import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { prisma } from '@/lib/prisma'
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 })
    }

    const body = await request.json()
    const { email, username } = body

    if (!email && !username) {
      return NextResponse.json({ error: 'Email or username is required' }, { status: 400 })
    }

    // Find target user
    const targetUser = await prisma.user.findFirst({
      where: {
        OR: [
          ...(email ? [{ email: email }] : []),
          ...(username ? [{ username: username }] : [])
        ]
      }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (targetUser.id === user.id) {
      return NextResponse.json({ error: 'Cannot send friend request to yourself' }, { status: 400 })
    }

    // Check existing friendship
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: user.id, friendId: targetUser.id },
          { userId: targetUser.id, friendId: user.id }
        ]
      }
    })

    if (existingFriendship) {
      return NextResponse.json({ error: 'You are already friends with this user' }, { status: 400 })
    }

    // Check existing friend request
    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { fromUserId: user.id, toUserId: targetUser.id },
          { fromUserId: targetUser.id, toUserId: user.id }
        ],
        status: 'PENDING'
      }
    })

    if (existingRequest) {
      if (existingRequest.fromUserId === user.id) {
        return NextResponse.json({ error: 'Friend request already sent' }, { status: 400 })
      } else {
        return NextResponse.json({ error: 'This user has already sent you a friend request' }, { status: 400 })
      }
    }

    // Create friend request
    const friendRequest = await prisma.friendRequest.create({
      data: {
        fromUserId: user.id,
        toUserId: targetUser.id,
        status: 'PENDING'
      },
      include: {
        fromUser: {
          select: { id: true, username: true, email: true, avatarUrl: true }
        },
        toUser: {
          select: { id: true, username: true, email: true, avatarUrl: true }
        }
      }
    })

    // Create notification for the target user
    await prisma.notification.create({
      data: {
        userId: targetUser.id,
        type: 'FRIEND_REQUEST',
        title: 'New Friend Request',
        message: `${user.user_metadata?.username || user.email} sent you a friend request`,
        relatedId: friendRequest.id
      }
    })

    return NextResponse.json({
      message: 'Friend request sent successfully',
      friendRequest
    })

  } catch (error) {
    console.error('Friend request error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const url = new URL(request.url)
    const type = url.searchParams.get('type') 
    let whereClause: any = {
      status: 'PENDING'
    }
    if (type === 'sent') {
      whereClause.fromUserId = user.id
    } else if (type === 'received') {
      whereClause.toUserId = user.id
    } else {
      whereClause.OR = [
        { fromUserId: user.id },
        { toUserId: user.id }
      ]
    }
    const friendRequests = await prisma.friendRequest.findMany({
      where: whereClause,
      include: {
        fromUser: {
          select: { id: true, username: true, email: true, avatarUrl: true }
        },
        toUser: {
          select: { id: true, username: true, email: true, avatarUrl: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(friendRequests)
  } catch (error) {
    console.error('Get friend requests error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}