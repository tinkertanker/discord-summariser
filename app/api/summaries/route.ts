import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const summaries = await prisma.channelSummary.findMany({
      where: { userId: session.user.id },
      include: {
        server: {
          select: {
            serverName: true,
            serverIcon: true
          }
        }
      },
      orderBy: [
        { isRead: 'asc' },
        { importance: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    // Transform data to include server info at top level
    const transformedSummaries = summaries.map(summary => ({
      ...summary,
      serverName: summary.server.serverName,
      serverIcon: summary.server.serverIcon
    }))

    return NextResponse.json(transformedSummaries)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch summaries' }, { status: 500 })
  }
}