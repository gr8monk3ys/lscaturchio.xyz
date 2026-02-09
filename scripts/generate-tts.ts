import fs from 'fs'
import path from 'path'
import glob from 'fast-glob'
import OpenAI from 'openai'

const AUDIO_DIR = path.join(process.cwd(), 'public', 'audio')
const BLOG_DIR = path.join(process.cwd(), 'src', 'app', 'blog')

// OpenAI TTS settings
const TTS_MODEL = 'tts-1-hd'
const TTS_VOICE: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' =
  'nova'
const TTS_RESPONSE_FORMAT = 'mp3' as const

// OpenAI TTS has a 4096 character limit per request
const MAX_CHUNK_LENGTH = 4000

function stripMdxToPlainText(mdx: string): string {
  let text = mdx

  // Remove the export const meta block
  text = text.replace(/export\s+const\s+meta\s*=\s*\{[\s\S]*?\};?\s*/g, '')

  // Remove import statements
  text = text.replace(/^import\s+.*$/gm, '')

  // Remove JSX/HTML tags
  text = text.replace(/<[^>]+>/g, '')

  // Remove code blocks (fenced)
  text = text.replace(/```[\s\S]*?```/g, '')

  // Remove inline code
  text = text.replace(/`[^`]+`/g, '')

  // Remove markdown images
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')

  // Remove markdown links but keep text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

  // Remove markdown headings (keep the text)
  text = text.replace(/^#{1,6}\s+/gm, '')

  // Remove bold/italic markers
  text = text.replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
  text = text.replace(/_{1,3}([^_]+)_{1,3}/g, '$1')

  // Remove blockquote markers
  text = text.replace(/^>\s+/gm, '')

  // Remove horizontal rules
  text = text.replace(/^[-*_]{3,}\s*$/gm, '')

  // Remove list markers
  text = text.replace(/^\s*[-*+]\s+/gm, '')
  text = text.replace(/^\s*\d+\.\s+/gm, '')

  // Collapse multiple newlines
  text = text.replace(/\n{3,}/g, '\n\n')

  // Trim
  text = text.trim()

  return text
}

function splitTextIntoChunks(text: string): string[] {
  if (text.length <= MAX_CHUNK_LENGTH) {
    return [text]
  }

  const chunks: string[] = []
  const paragraphs = text.split(/\n\n+/)
  let currentChunk = ''

  for (const paragraph of paragraphs) {
    if (
      currentChunk.length + paragraph.length + 2 >
      MAX_CHUNK_LENGTH
    ) {
      if (currentChunk) {
        chunks.push(currentChunk.trim())
      }
      // If a single paragraph exceeds the limit, split by sentences
      if (paragraph.length > MAX_CHUNK_LENGTH) {
        const sentences = paragraph.match(/[^.!?]+[.!?]+\s*/g) || [paragraph]
        let sentenceChunk = ''
        for (const sentence of sentences) {
          if (sentenceChunk.length + sentence.length > MAX_CHUNK_LENGTH) {
            if (sentenceChunk) {
              chunks.push(sentenceChunk.trim())
            }
            sentenceChunk = sentence
          } else {
            sentenceChunk += sentence
          }
        }
        currentChunk = sentenceChunk
      } else {
        currentChunk = paragraph
      }
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim())
  }

  return chunks
}

async function generateAudioForSlug(
  client: OpenAI,
  slug: string,
  text: string
): Promise<void> {
  const outputPath = path.join(AUDIO_DIR, `${slug}.mp3`)

  // Check if audio already exists (skip if so)
  if (fs.existsSync(outputPath)) {
    console.log(`⏭  Skipping "${slug}" (audio already exists)`)
    return
  }

  const chunks = splitTextIntoChunks(text)
  console.log(
    `🎙  Generating audio for "${slug}" (${text.length} chars, ${chunks.length} chunk(s))...`
  )

  const audioBuffers: Buffer[] = []

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    console.log(
      `   Chunk ${i + 1}/${chunks.length} (${chunk.length} chars)...`
    )

    const response = await client.audio.speech.create({
      model: TTS_MODEL,
      voice: TTS_VOICE,
      input: chunk,
      response_format: TTS_RESPONSE_FORMAT,
    })

    const arrayBuffer = await response.arrayBuffer()
    audioBuffers.push(Buffer.from(arrayBuffer))

    // Rate limiting - avoid hitting API limits
    if (i < chunks.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }

  // Concatenate all audio buffers
  const finalBuffer = Buffer.concat(audioBuffers)
  fs.writeFileSync(outputPath, finalBuffer)

  console.log(
    `✅ Saved ${outputPath} (${(finalBuffer.length / 1024).toFixed(0)} KB)`
  )
}

async function main(): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY environment variable is required')
    console.error('   Set it in .env.local or export it in your shell')
    process.exit(1)
  }

  const client = new OpenAI({ apiKey })

  // Ensure audio directory exists
  if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true })
  }

  // Parse CLI args for specific slugs
  const args = process.argv.slice(2)
  const forceRegenerate = args.includes('--force')
  const slugFilter = args.filter((a) => !a.startsWith('--'))

  // Find all blog content files
  const blogFileNames = await glob(['*/content.mdx', '*.mdx'], {
    cwd: BLOG_DIR,
  })

  let processed = 0
  let skipped = 0
  let failed = 0

  for (const fileName of blogFileNames) {
    const slug = fileName.replace(/(\/content)?\.mdx$/, '')

    // If specific slugs requested, filter
    if (slugFilter.length > 0 && !slugFilter.includes(slug)) {
      continue
    }

    // If force flag, delete existing file first
    const outputPath = path.join(AUDIO_DIR, `${slug}.mp3`)
    if (forceRegenerate && fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath)
    }

    const filePath = path.join(BLOG_DIR, fileName)
    const mdxContent = fs.readFileSync(filePath, 'utf-8')
    const plainText = stripMdxToPlainText(mdxContent)

    if (plainText.length < 50) {
      console.log(`⏭  Skipping "${slug}" (content too short)`)
      skipped++
      continue
    }

    try {
      await generateAudioForSlug(client, slug, plainText)
      processed++
    } catch (error) {
      console.error(`❌ Failed to generate audio for "${slug}":`, error)
      failed++
    }

    // Small delay between posts to avoid rate limits
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  console.log('')
  console.log('📊 Summary:')
  console.log(`   Processed: ${processed}`)
  console.log(`   Skipped:   ${skipped}`)
  console.log(`   Failed:    ${failed}`)
  console.log(`   Total:     ${blogFileNames.length}`)
  console.log('')
  console.log(`Audio files are in: ${AUDIO_DIR}`)
}

main().catch(console.error)
