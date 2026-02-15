import { NextRequest } from 'next/server'
import { summarizeContent, generateKeyTakeaways } from '@/lib/summarize'
import { withRateLimit } from '@/lib/with-rate-limit'
import { RATE_LIMITS } from '@/lib/rate-limit'
import { validateCsrf } from '@/lib/csrf'
import { logError } from '@/lib/logger'
import { summarizeSchema, parseBody } from '@/lib/validations'
import { apiSuccess, ApiErrors } from '@/lib/api-response'

const handlePost = async (request: NextRequest) => {
  const csrfError = validateCsrf(request)
  if (csrfError) return csrfError

  try {
    const body = await request.json()
    const parsed = parseBody(summarizeSchema, body)

    if (!parsed.success) {
      return ApiErrors.badRequest(parsed.error)
    }

    const { content, type } = parsed.data
    let result

    if (type === 'takeaways') {
      const takeaways = await generateKeyTakeaways(content, 3)
      result = { takeaways }
    } else {
      const summary = await summarizeContent(content, 50)
      result = { summary }
    }

    return apiSuccess(result)
  } catch (error) {
    logError('Summarize API: Unexpected error', error, { component: 'summarize', action: 'POST' })
    return ApiErrors.internalError('Failed to process content')
  }
}

// Export with rate limiting (5 requests per minute - expensive GPT-4 calls)
export const POST = withRateLimit(handlePost, RATE_LIMITS.AI_HEAVY)
