import fs from 'fs'
import path from 'path'
import glob from 'fast-glob'
import OpenAI from 'openai'
import { execFileSync } from 'child_process'

const AUDIO_DIR = path.join(process.cwd(), 'public', 'audio')
const BLOG_DIR = path.join(process.cwd(), 'src', 'app', 'blog')
const TMP_DIR = path.join(AUDIO_DIR, '.tmp-openai')

const MAX_CHUNK_LENGTH = Number(process.env.OPENAI_TTS_MAX_CHARS || 3200)
const MIN_CONTENT_LENGTH = 50

function stripMdxToPlainText(mdx: string): string {
  let text = mdx

  text = text.replace(/export\s+const\s+meta\s*=\s*\{[\s\S]*?\};?\s*/g, '')
  text = text.replace(/^import\s+.*$/gm, '')
  text = text.replace(/```[\s\S]*?```/g, '')
  text = text.replace(/`[^`]+`/g, '')
  // Loop-based sanitization to handle nested/malformed tags like `<scr<script>ipt>`
  let prev = ''
  while (prev !== text) {
    prev = text
    text = text.replace(/<[^>]+>/g, '')
  }
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  text = text.replace(/^#{1,6}\s+/gm, '')
  text = text.replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
  text = text.replace(/_{1,3}([^_]+)_{1,3}/g, '$1')
  text = text.replace(/^>\s+/gm, '')
  text = text.replace(/^[-*_]{3,}\s*$/gm, '')
  text = text.replace(/^\s*[-*+]\s+/gm, '')
  text = text.replace(/^\s*\d+\.\s+/gm, '')
  text = text.replace(/\n{3,}/g, '\n\n')

  return text.trim()
}

function splitTextIntoChunks(text: string): string[] {
  if (text.length <= MAX_CHUNK_LENGTH) {
    return [text]
  }

  const chunks: string[] = []
  const paragraphs = text.split(/\n\n+/)
  let currentChunk = ''

  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length + 2 > MAX_CHUNK_LENGTH) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim())
      }

      if (paragraph.length > MAX_CHUNK_LENGTH) {
        const sentences = paragraph.match(/[^.!?]+[.!?]+\s*/g) || [paragraph]
        let sentenceChunk = ''

        for (const sentence of sentences) {
          if (sentenceChunk.length + sentence.length > MAX_CHUNK_LENGTH) {
            if (sentenceChunk.trim()) {
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

function parseArgs(): {
  force: boolean
  voice: string
  model: string
  instructions: string | undefined
  slugFilter: Set<string>
} {
  const args = process.argv.slice(2)
  let force = false
  let voice = process.env.OPENAI_TTS_VOICE || 'alloy'
  let model = process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts'
  let instructions = process.env.OPENAI_TTS_INSTRUCTIONS
  const slugValues: string[] = []

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    if (arg === '--force') {
      force = true
      continue
    }

    if (arg === '--voice' && args[i + 1] && !args[i + 1].startsWith('--')) {
      voice = args[i + 1]
      i++
      continue
    }
    if (arg.startsWith('--voice=')) {
      voice = arg.slice('--voice='.length)
      continue
    }

    if (arg === '--model' && args[i + 1] && !args[i + 1].startsWith('--')) {
      model = args[i + 1]
      i++
      continue
    }
    if (arg.startsWith('--model=')) {
      model = arg.slice('--model='.length)
      continue
    }

    if (arg === '--instructions' && args[i + 1] && !args[i + 1].startsWith('--')) {
      instructions = args[i + 1]
      i++
      continue
    }
    if (arg.startsWith('--instructions=')) {
      instructions = arg.slice('--instructions='.length)
      continue
    }

    if (!arg.startsWith('--')) {
      slugValues.push(arg)
    }
  }

  return { force, voice, model, instructions, slugFilter: new Set(slugValues) }
}

function ensurePrereqs(): void {
  if (!process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY is required')
    process.exit(1)
  }

  try {
    execFileSync('which', ['ffmpeg'], { stdio: 'pipe' })
  } catch {
    console.error('Error: ffmpeg is required')
    console.error('  macOS: brew install ffmpeg')
    process.exit(1)
  }

  fs.mkdirSync(AUDIO_DIR, { recursive: true })
  fs.mkdirSync(TMP_DIR, { recursive: true })
}

function cleanupSlugTmp(slug: string): void {
  if (!fs.existsSync(TMP_DIR)) return
  const files = fs.readdirSync(TMP_DIR).filter((f) => f.startsWith(`${slug}_`))
  for (const f of files) {
    fs.unlinkSync(path.join(TMP_DIR, f))
  }
}

function concatMp3Chunks(inputFiles: string[], outputFile: string): void {
  if (inputFiles.length === 1) {
    fs.copyFileSync(inputFiles[0], outputFile)
    return
  }

  const listPath = path.join(TMP_DIR, `concat_${Date.now()}.txt`)
  const list = inputFiles.map((f) => `file '${f.replace(/'/g, "'\\''")}'`).join('\n')
  fs.writeFileSync(listPath, list)

  execFileSync('ffmpeg', [
    '-f', 'concat',
    '-safe', '0',
    '-i', listPath,
    '-c:a', 'libmp3lame',
    '-q:a', '2',
    outputFile,
    '-y',
    '-loglevel', 'warning',
  ])

  fs.unlinkSync(listPath)
}

async function synthesizeSlug(
  client: OpenAI,
  slug: string,
  text: string,
  model: string,
  voice: string,
  instructions?: string
): Promise<void> {
  const outputPath = path.join(AUDIO_DIR, `${slug}.mp3`)
  const chunks = splitTextIntoChunks(text)

  console.log(`Generating ${slug} (${chunks.length} chunk(s), ${text.length} chars)`)

  cleanupSlugTmp(slug)
  const tempChunkFiles: string[] = []

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    console.log(`  Chunk ${i + 1}/${chunks.length} (${chunk.length} chars)`)

    const response = await client.audio.speech.create({
      model,
      voice,
      input: chunk,
      response_format: 'mp3',
      ...(instructions ? { instructions } : {}),
    })

    const tempPath = path.join(TMP_DIR, `${slug}_${i}.mp3`)
    const audioBuffer = Buffer.from(await response.arrayBuffer())
    fs.writeFileSync(tempPath, audioBuffer)
    tempChunkFiles.push(tempPath)
  }

  concatMp3Chunks(tempChunkFiles, outputPath)

  for (const file of tempChunkFiles) {
    if (fs.existsSync(file)) fs.unlinkSync(file)
  }

  const sizeKb = Math.round(fs.statSync(outputPath).size / 1024)
  console.log(`Saved /public/audio/${slug}.mp3 (${sizeKb} KB)`)
}

async function main(): Promise<void> {
  ensurePrereqs()

  const { force, model, voice, instructions, slugFilter } = parseArgs()
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const blogFiles = await glob(['*/content.mdx', '*.mdx'], { cwd: BLOG_DIR })

  let processed = 0
  let skipped = 0
  let failed = 0

  for (const fileName of blogFiles) {
    const slug = fileName.replace(/(\/content)?\.mdx$/, '')

    if (slugFilter.size > 0 && !slugFilter.has(slug)) {
      continue
    }

    const outputPath = path.join(AUDIO_DIR, `${slug}.mp3`)
    if (!force && fs.existsSync(outputPath)) {
      skipped++
      continue
    }

    const content = fs.readFileSync(path.join(BLOG_DIR, fileName), 'utf-8')
    const plainText = stripMdxToPlainText(content)

    if (plainText.length < MIN_CONTENT_LENGTH) {
      console.log(`Skipping ${slug} (content too short)`)
      skipped++
      continue
    }

    try {
      await synthesizeSlug(client, slug, plainText, model, voice, instructions)
      processed++
    } catch (error) {
      failed++
      console.error(`Failed ${slug}:`, error)
      cleanupSlugTmp(slug)
    }
  }

  if (fs.existsSync(TMP_DIR) && fs.readdirSync(TMP_DIR).length === 0) {
    fs.rmSync(TMP_DIR, { recursive: true, force: true })
  }

  console.log('')
  console.log('Summary:')
  console.log(`  Processed: ${processed}`)
  console.log(`  Skipped:   ${skipped}`)
  console.log(`  Failed:    ${failed}`)
  console.log(`  Total:     ${blogFiles.length}`)
  console.log('')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
