import { summarizeContent, generateKeyTakeaways } from '@/lib/summarize'
import { RATE_LIMITS } from '@/lib/rate-limit'
import { withWriteRoute } from '@/lib/api/write-route'
import { summarizeSchema } from '@/lib/validations'

export const POST = withWriteRoute(
  {
    limit: RATE_LIMITS.SUMMARIZE,
    auth: {
      kind: 'public',
      reason: 'Any reader can summarise the post they are on; cost is bounded by RATE_LIMITS.SUMMARIZE.',
    },
    csrf: { kind: 'required' },
    body: { kind: 'json', schema: summarizeSchema },
    envelope: { kind: 'standard' },
    errors: {
      log: 'Summarize API: Unexpected error',
      component: 'summarize',
      action: 'POST',
      message: 'Failed to process content',
    },
  },
  async ({ data }) => {
    const { content, type } = data

    if (type === 'takeaways') {
      return { takeaways: await generateKeyTakeaways(content, 3) }
    }
    return { summary: await summarizeContent(content, 50) }
  }
)
