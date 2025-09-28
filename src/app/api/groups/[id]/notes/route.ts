import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { prisma } from '@/lib/prisma'
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId: id,
        userId: user.id
      }
    })
    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const notes = await prisma.note.findMany({
      where: {
        groupId: id
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatarUrl: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })
    return NextResponse.json(notes)
  } catch (error) {
    console.error('Error fetching notes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { title } = await request.json()
    if (!title) {
      return NextResponse.json(
        { error: 'Note title is required' },
        { status: 400 }
      )
    }
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId: id,
        userId: user.id
      }
    })
    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const note = await prisma.note.create({
      data: {
        title,
        groupId: id,
        createdBy: user.id,
        blocks: {
          create: {
            blockType: 'PARAGRAPH',
            content: { text: '' },
            position: 0
          }
        }
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatarUrl: true
          }
        },
        blocks: {
          orderBy: {
            position: 'asc'
          }
        }
      }
    })
    return NextResponse.json(note)
  } catch (error) {
    console.error('Error creating note:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
