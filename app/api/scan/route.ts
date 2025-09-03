import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import axios from 'axios'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id || !session.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get all active servers for the user
    const servers = await prisma.monitoredServer.findMany({
      where: {
        userId: session.user.id,
        isActive: true
      }
    })

    const summaries = []

    for (const server of servers) {
      // Get channels for this server
      const channelsResponse = await axios.get(
        `https://discord.com/api/guilds/${server.serverId}/channels`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`
          }
        }
      )

      // Filter text channels and apply ignore list
      const textChannels = channelsResponse.data.filter((channel: any) => 
        channel.type === 0 && 
        (server.scanAllChannels || !JSON.parse(server.ignoredChannels || '[]').includes(channel.id))
      )

      // Process each channel (limit to 3 for demo)
      for (const channel of textChannels.slice(0, 3)) {
        try {
          // Fetch recent messages
          const messagesResponse = await axios.get(
            `https://discord.com/api/channels/${channel.id}/messages?limit=50`,
            {
              headers: {
                Authorization: `Bearer ${session.accessToken}`
              }
            }
          )

          if (messagesResponse.data.length === 0) continue

          // Prepare messages for AI
          const messageContent = messagesResponse.data
            .slice(0, 20) // Limit messages for AI processing
            .map((msg: any) => `${msg.author.username}: ${msg.content}`)
            .join('\n')

          // Generate AI summary
          const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: `Analyze Discord channel messages and provide:
                1. A concise summary (2-3 sentences)
                2. Importance score (1-10) based on:
                   - Announcements/updates (8-10)
                   - Questions needing answers (7-9)
                   - Active discussions (5-7)
                   - General chat (1-4)
                3. Key topics discussed (max 5)
                
                Return JSON: {
                  "summary": "...",
                  "importance": 7,
                  "topics": ["topic1", "topic2"]
                }`
              },
              {
                role: 'user',
                content: `Channel: #${channel.name}\n\nMessages:\n${messageContent}`
              }
            ],
            temperature: 0.7,
            max_tokens: 200
          })

          const analysis = JSON.parse(completion.choices[0].message.content || '{}')

          // Check for threads
          let hasThreads = false
          try {
            const threadsResponse = await axios.get(
              `https://discord.com/api/channels/${channel.id}/threads/archived/public`,
              {
                headers: {
                  Authorization: `Bearer ${session.accessToken}`
                }
              }
            )
            hasThreads = threadsResponse.data.threads?.length > 0
          } catch (e) {
            // Ignore thread fetch errors
          }

          // Create or update summary
          const summary = await prisma.channelSummary.upsert({
            where: {
              userId_channelId_createdAt: {
                userId: session.user.id,
                channelId: channel.id,
                createdAt: new Date(new Date().toDateString()) // Today's date
              }
            },
            update: {
              summary: analysis.summary || 'No significant activity',
              importance: analysis.importance || 5,
              topics: JSON.stringify(analysis.topics || []),
              messageCount: messagesResponse.data.length,
              hasThreads,
              lastActivityAt: messagesResponse.data[0]?.timestamp || new Date()
            },
            create: {
              userId: session.user.id,
              serverId: server.serverId,
              channelId: channel.id,
              channelName: channel.name,
              summary: analysis.summary || 'No significant activity',
              importance: analysis.importance || 5,
              topics: JSON.stringify(analysis.topics || []),
              messageCount: messagesResponse.data.length,
              hasThreads,
              lastActivityAt: messagesResponse.data[0]?.timestamp || new Date(),
              isRead: false
            }
          })

          summaries.push(summary)
        } catch (error) {
          console.error(`Error processing channel ${channel.name}:`, error)
        }
      }

      // Update last scanned time
      await prisma.monitoredServer.update({
        where: { id: server.id },
        data: { lastScannedAt: new Date() }
      })
    }

    return NextResponse.json({ 
      success: true, 
      summariesCreated: summaries.length 
    })
  } catch (error) {
    console.error('Scan error:', error)
    return NextResponse.json({ error: 'Scan failed' }, { status: 500 })
  }
}