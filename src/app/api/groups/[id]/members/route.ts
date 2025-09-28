import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { prisma } from '@/lib/prisma'
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { memberId, role = 'MEMBER' } = await request.json()
    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 })
    }
    const currentMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: user.id
        }
      }
    })
    if (!currentMember || currentMember.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only group admins can add members' }, { status: 403 })
    }
    const userToAdd = await prisma.user.findUnique({
      where: { id: memberId }
    })
    if (!userToAdd) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    const existingMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: userToAdd.id
        }
      }
    })
    if (existingMember) {
      return NextResponse.json({ error: 'User is already a member of this group' }, { status: 400 })
    }
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: user.id, friendId: userToAdd.id },
          { userId: userToAdd.id, friendId: user.id }
        ]
      }
    })
    if (!friendship) {
      return NextResponse.json({ error: 'You can only add friends to the group' }, { status: 400 })
    }
    const newMember = await prisma.groupMember.create({
      data: {
        groupId,
        userId: userToAdd.id,
        role
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    })
    return NextResponse.json(newMember)
  } catch (error) {
    console.error('Add member error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const currentMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: user.id
        }
      }
    })
    if (!currentMember) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
    const members = await prisma.groupMember.findMany({
      where: { groupId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true
          }
        }
      },
      orderBy: { joinedAt: 'asc' }
    })
    const formattedMembers = members.map(member => ({
      id: member.user.id,
      name: member.user.username,
      email: member.user.email,
      role: member.role,
      joinedAt: member.joinedAt
    }))
    return NextResponse.json({ members: formattedMembers })
  } catch (error) {
    console.error('Get members error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { memberId } = await request.json()
    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 })
    }
    const currentMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: user.id
        }
      }
    })
    if (!currentMember || currentMember.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only group admins can remove members' }, { status: 403 })
    }
    const group = await prisma.group.findUnique({
      where: { id: groupId }
    })
    if (group?.createdBy === memberId) {
      return NextResponse.json({ error: 'Cannot remove group creator' }, { status: 400 })
    }
    await prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId,
          userId: memberId
        }
      }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Remove member error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}