import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const RESPONSE_TYPES = [
  { type: 'ACKNOWLEDGMENT', instruction: 'Brief acknowledgment showing you\'ve seen the messages' },
  { type: 'QUESTION', instruction: 'A relevant follow-up question' },
  { type: 'ANSWER', instruction: 'A helpful answer if questions were asked' },
  { type: 'FOLLOW_UP', instruction: 'A follow-up on previous discussions' },
]

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { summaryId, channelName, summary } = body

    // Check if responses already exist
    const existing = await prisma.suggestedResponse.findMany({
      where: {
        summaryId,
        userId: session.user.id
      }
    })

    if (existing.length > 0) {
      return NextResponse.json({ responses: existing })
    }

    // Generate responses for each type
    const responses = []
    
    for (const responseType of RESPONSE_TYPES) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are helping craft Discord messages. Based on a channel summary, generate a ${responseType.type} response.
            
            Guidelines:
            - Keep it casual and Discord-appropriate
            - Be concise (1-2 sentences usually)
            - ${responseType.instruction}
            - Don't be overly formal
            - Use Discord conventions (@ mentions, emojis sparingly)`
          },
          {
            role: 'user',
            content: `Channel: #${channelName}\nSummary: ${summary}\n\nGenerate a ${responseType.type} response:`
          }
        ],
        temperature: 0.8,
        max_tokens: 100
      })

      const suggestedText = completion.choices[0].message.content || ''

      // Save to database
      const response = await prisma.suggestedResponse.create({
        data: {
          userId: session.user.id,
          summaryId,
          responseType: responseType.type as any,
          suggestedText
        }
      })

      responses.push(response)
    }

    return NextResponse.json({ responses })
  } catch (error) {
    console.error('Failed to generate responses:', error)
    return NextResponse.json({ error: 'Failed to generate responses' }, { status: 500 })
  }
}