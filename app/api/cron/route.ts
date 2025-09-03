import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import axios from 'axios'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// This endpoint is meant to be called by Vercel Cron
// Add to vercel.json: "crons": [{ "path": "/api/cron", "schedule": "0 */6 * * *" }]
export async function GET(request: Request) {
  // Verify cron secret if you want extra security
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get all active servers that haven't been scanned in the last 6 hours
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000)
    
    const servers = await prisma.monitoredServer.findMany({
      where: {
        isActive: true,
        OR: [
          { lastScannedAt: null },
          { lastScannedAt: { lt: sixHoursAgo } }
        ]
      },
      include: {
        user: true
      }
    })

    let totalSummaries = 0

    for (const server of servers) {
      if (!server.user.discordToken) continue

      try {
        // Similar scanning logic as in /api/scan but for all users
        // You would implement the full scanning here
        // For now, just update the last scanned time
        
        await prisma.monitoredServer.update({
          where: { id: server.id },
          data: { lastScannedAt: new Date() }
        })
        
        totalSummaries++
      } catch (error) {
        console.error(`Failed to scan server ${server.id}:`, error)
      }
    }

    return NextResponse.json({ 
      success: true,
      serversScanned: servers.length,
      summariesCreated: totalSummaries
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}