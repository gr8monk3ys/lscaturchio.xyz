import OpenAI from 'openai'
import { logError } from './logger'

let openaiClient: OpenAI | null = null

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 30000,
      maxRetries: 1,
    })
  }
  return openaiClient
}

/**
 * Generate a concise summary of blog post content using GPT-4
 * @param content - The full blog post content
 * @param maxLength - Maximum length of summary in words (default: 50)
 * @returns Summary text
 */
export async function summarizeContent(
  content: string,
  maxLength: number = 50
): Promise<string> {
  try {
    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a skilled content summarizer. Create concise, engaging summaries that capture the essence of the content. Keep summaries under ${maxLength} words.`,
        },
        {
          role: 'user',
          content: `Summarize this blog post in ${maxLength} words or less:\n\n${content}`,
        },
      ],
      temperature: 0.3,
      max_tokens: maxLength * 2, // Rough estimate
    })

    return response.choices[0]?.message?.content || ''
  } catch (error) {
    logError('Summarization error', error, { component: 'summarize', action: 'summarizeContent' })
    throw new Error('Failed to generate summary')
  }
}

/**
 * Generate key takeaways from content
 * @param content - The blog post content
 * @param numTakeaways - Number of takeaways to generate (default: 3)
 * @returns Array of key takeaways
 */
export async function generateKeyTakeaways(
  content: string,
  numTakeaways: number = 3
): Promise<string[]> {
  try {
    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a content analyst. Extract the most important ${numTakeaways} key takeaways from content. Return as a JSON array of strings.`,
        },
        {
          role: 'user',
          content: `Extract ${numTakeaways} key takeaways from this blog post:\n\n${content}`,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })

    const result = JSON.parse(response.choices[0]?.message?.content || '{"takeaways":[]}')
    return result.takeaways || []
  } catch (error) {
    logError('Takeaways generation error', error, { component: 'summarize', action: 'generateKeyTakeaways' })
    throw new Error('Failed to generate takeaways')
  }
}
