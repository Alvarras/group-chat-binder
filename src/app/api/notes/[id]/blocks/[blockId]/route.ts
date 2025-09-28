import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/supabase/auth'
import { prisma } from '@/lib/prisma'
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, blockId: string }> }
) {
  try {
    const { id, blockId } = await params
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { content } = await request.json()
    const note = await prisma.note.findUnique({
      where: {
        id: id
      },
      include: {
        group: {
          include: {
            members: {
              where: {
                userId: user.id
              }
            }
          }
        }
      }
    })
    if (!note || note.group.members.length === 0) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const updatedBlock = await prisma.noteBlock.update({
      where: {
        id: blockId,
        noteId: id
      },
      data: {
        content: content
      }
    })
    return NextResponse.json(updatedBlock)
  } catch (error) {
    console.error('Error updating block:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, blockId: string }> }
) {
  try {
    const { id, blockId } = await params
    const user = await getCurrentUser()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const note = await prisma.note.findUnique({
      where: {
        id: id
      },
      include: {
        group: {
          include: {
            members: {
              where: {
                userId: user.id
              }
            }
          }
        }
      }
    })
    if (!note || note.group.members.length === 0) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    await prisma.noteBlock.delete({
      where: {
        id: blockId,
        noteId: id
      }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting block:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}