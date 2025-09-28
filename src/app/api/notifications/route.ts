import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const unreadOnly = url.searchParams.get('unread') === 'true'

    // Get both notifications and friend requests
    const [notifications, friendRequests] = await Promise.all([
      prisma.notification.findMany({
        where: {
          userId: user.id,
          ...(unreadOnly && { read: false })
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.friendRequest.findMany({
        where: {
          toUserId: user.id,
          status: 'PENDING'
        },
        include: {
          fromUser: {
            select: { id: true, username: true, email: true, avatarUrl: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    ])

    // Convert friend requests to notification format
    const friendRequestNotifications = friendRequests.map(request => ({
      id: `fr_${request.id}`,
      type: 'FRIEND_REQUEST',
      title: 'New Friend Request',
      message: `${request.fromUser.username} wants to be your friend`,
      createdAt: request.createdAt,
      read: false,
      actionable: true,
      fromUser: request.fromUser,
      relatedId: request.id
    }))

    // Combine and sort all notifications
    const allNotifications = [...notifications, ...friendRequestNotifications]
    allNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json(allNotifications)
  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, title, message, userId, relatedId } = await request.json()

    if (!type || !title || !message || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const notification = await prisma.notification.create({
      data: {
        type,
        title,
        message,
        userId,
        relatedId,
        read: false
      }
    })

    return NextResponse.json(notification)
  } catch (error) {
    console.error('Create notification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { notificationIds, markAsRead } = await request.json()

    if (!Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: 'notificationIds must be an array' },
        { status: 400 }
      )
    }

    await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId: user.id
      },
      data: {
        read: markAsRead === true
      }
    })

    return NextResponse.json({ 
      message: `Notifications marked as ${markAsRead ? 'read' : 'unread'}` 
    })
  } catch (error) {
    console.error('Error updating notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}