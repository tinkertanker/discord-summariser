import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const servers = await prisma.monitoredServer.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(servers)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch servers' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { serverId, serverName, serverIcon, scanAllChannels, ignoredChannels } = body

    // Check if server already exists for this user
    const existing = await prisma.monitoredServer.findUnique({
      where: {
        userId_serverId: {
          userId: session.user.id,
          serverId
        }
      }
    })

    if (existing) {
      return NextResponse.json({ error: 'Server already added' }, { status: 400 })
    }

    const server = await prisma.monitoredServer.create({
      data: {
        userId: session.user.id,
        serverId,
        serverName,
        serverIcon,
        scanAllChannels,
        ignoredChannels: ignoredChannels || []
      }
    })

    return NextResponse.json(server)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add server' }, { status: 500 })
  }
}