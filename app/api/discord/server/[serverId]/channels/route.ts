import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import axios from 'axios'

export async function GET(
  request: Request,
  { params }: { params: { serverId: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id || !session.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const response = await axios.get(
      `https://discord.com/api/guilds/${params.serverId}/channels`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`
        }
      }
    )

    // Filter for text channels only
    const textChannels = response.data.filter((channel: any) => 
      channel.type === 0 // Text channel type
    )

    return NextResponse.json(textChannels)
  } catch (error) {
    console.error('Failed to fetch channels:', error)
    return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 })
  }
}