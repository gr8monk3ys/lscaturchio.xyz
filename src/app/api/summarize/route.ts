import { summarizeContent, generateKeyTakeaways } from '@/lib/summarize'
import { withWriteRoute } from '@/lib/api/write-route'
import { summarizeSchema } from '@/lib/validations'

export const POST = withWriteRoute(
  {
    limit: 'SUMMARIZE',
    auth: {
      kind: 'public',
      reason: 'Any reader can summarise the post they are on; cost is bounded by the SUMMARIZE rate-limit policy.',
    },
    csrf: { kind: 'required' },
    body: { kind: 'json', schema: summarizeSchema },
    guard: { kind: 'none', reason: 'No form behind it; cost is bounded by the SUMMARIZE rate-limit policy.' },
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
