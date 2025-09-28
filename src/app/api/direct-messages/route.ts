import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { prisma } from '@/lib/prisma'
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const conversations = await prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId: user.id },
          { receiverId: user.id }
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
        },
        receiver: {
          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    const conversationMap = new Map()
    conversations.forEach(dm => {
      const partnerId = dm.senderId === user.id ? dm.receiverId : dm.senderId
      const partner = dm.senderId === user.id ? dm.receiver : dm.sender
      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partnerId,
          partner,
          lastMessage: dm,
          unreadCount: 0
        })
      }
      if (dm.receiverId === user.id && !dm.read) {
        conversationMap.get(partnerId).unreadCount++
      }
    })
    const conversationList = Array.from(conversationMap.values()).map(conv => ({
      id: conv.partnerId,
      user: conv.partner,
      lastMessage: conv.lastMessage,
      unreadCount: conv.unreadCount
    }))
    return NextResponse.json({ conversations: conversationList })
  } catch (error) {
    console.error('Get DM conversations error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { receiverId, recipientId, content, messageType = 'TEXT' } = await request.json()
    const targetUserId = receiverId || recipientId
    if (!targetUserId) {
      return NextResponse.json({ error: 'Recipient ID is required' }, { status: 400 })
    }
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: user.id, friendId: targetUserId },
          { userId: targetUserId, friendId: user.id }
        ]
      }
    })
    if (!friendship) {
      return NextResponse.json({ error: 'You can only start conversations with friends' }, { status: 400 })
    }
    if (!content?.trim()) {
      const existingConversation = await prisma.directMessage.findFirst({
        where: {
          OR: [
            { senderId: user.id, receiverId: targetUserId },
            { senderId: targetUserId, receiverId: user.id }
          ]
        }
      })
      if (existingConversation) {
        return NextResponse.json({ success: true, message: 'Conversation already exists' })
      }
      return NextResponse.json({ success: true, message: 'Conversation can be created' })
    }
    const directMessage = await prisma.directMessage.create({
      data: {
        senderId: user.id,
        receiverId: targetUserId,
        content: content.trim(),
        messageType
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true
          }
        },
        receiver: {
          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    })
    return NextResponse.json(directMessage)
  } catch (error) {
    console.error('Send DM error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}