import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { editedText } = body

    const response = await prisma.suggestedResponse.update({
      where: {
        id: params.id,
        userId: session.user.id
      },
      data: {
        editedText
      }
    })

    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update response' }, { status: 500 })
  }
}