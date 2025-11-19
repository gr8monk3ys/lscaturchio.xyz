import { NextRequest, NextResponse } from 'next/server'
import { summarizeContent, generateKeyTakeaways } from '@/lib/summarize'
import { withRateLimit } from '@/lib/with-rate-limit'
import { RATE_LIMITS } from '@/lib/rate-limit'

const handlePost = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { content, type = 'summary' } = body

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    if (content.length > 10000) {
      return NextResponse.json(
        { error: 'Content too long (max 10,000 characters)' },
        { status: 400 }
      )
    }

    let result

    if (type === 'takeaways') {
      const takeaways = await generateKeyTakeaways(content, 3)
      result = { takeaways }
    } else {
      const summary = await summarizeContent(content, 50)
      result = { summary }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Summarization API error:', error)
    return NextResponse.json(
      { error: 'Failed to process content' },
      { status: 500 }
    )
  }
}

// Export with rate limiting (5 requests per minute - expensive GPT-4 calls)
export const POST = withRateLimit(handlePost, RATE_LIMITS.AI_HEAVY)
