import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { summaryIds, all } = body

    if (all) {
      // Mark all unread summaries as read
      await prisma.channelSummary.updateMany({
        where: {
          userId: session.user.id,
          isRead: false
        },
        data: {
          isRead: true
        }
      })
    } else if (summaryIds && summaryIds.length > 0) {
      // Mark specific summaries as read
      await prisma.channelSummary.updateMany({
        where: {
          id: { in: summaryIds },
          userId: session.user.id
        },
        data: {
          isRead: true
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 })
  }
}