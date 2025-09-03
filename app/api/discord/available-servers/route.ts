import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import axios from 'axios'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id || !session.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get user's Discord servers
    const response = await axios.get('https://discord.com/api/users/@me/guilds', {
      headers: {
        Authorization: `Bearer ${session.accessToken}`
      }
    })

    // Filter servers where user has read message permissions
    const servers = response.data.filter((guild: any) => {
      const permissions = BigInt(guild.permissions)
      const READ_MESSAGES = BigInt(0x400)
      return (permissions & READ_MESSAGES) === READ_MESSAGES
    })

    // Get already monitored servers
    const monitored = await prisma.monitoredServer.findMany({
      where: { userId: session.user.id },
      select: { serverId: true }
    })
    
    const monitoredIds = new Set(monitored.map(m => m.serverId))

    // Filter out already monitored servers
    const availableServers = servers.filter((s: any) => !monitoredIds.has(s.id))

    return NextResponse.json(availableServers)
  } catch (error) {
    console.error('Failed to fetch Discord servers:', error)
    return NextResponse.json({ error: 'Failed to fetch servers' }, { status: 500 })
  }
}