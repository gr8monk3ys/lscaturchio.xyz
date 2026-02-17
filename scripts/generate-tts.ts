import fs from 'fs'
import path from 'path'
import glob from 'fast-glob'
import { spawn, execFileSync, type ChildProcess } from 'child_process'
import readline from 'readline'

const AUDIO_DIR = path.join(process.cwd(), 'public', 'audio')
const BLOG_DIR = path.join(process.cwd(), 'src', 'app', 'blog')
const VOICE_DIR = path.join(process.cwd(), 'voice')
const VENV_DIR = path.join(process.cwd(), 'scripts', '.tts-venv')
const TMP_DIR = path.join(AUDIO_DIR, '.tmp')
const PYTHON_SCRIPT = path.join(process.cwd(), 'scripts', 'tts_synthesize.py')
const PYTHON_BIN = path.join(VENV_DIR, 'bin', 'python')

// XTTS v2 works best with smaller chunks for natural prosody
const MAX_CHUNK_LENGTH = 2000

interface TtsResponse {
  success: boolean
  output_path?: string
  duration_seconds?: number
  error?: string
  command?: string
}

interface TtsProcess {
  send: (request: Record<string, string>) => Promise<TtsResponse>
  quit: () => Promise<void>
}

function stripMdxToPlainText(mdx: string): string {
  let text = mdx

  // Remove the export const meta block
  text = text.replace(/export\s+const\s+meta\s*=\s*\{[\s\S]*?\};?\s*/g, '')

  // Remove import statements
  text = text.replace(/^import\s+.*$/gm, '')

  // Remove JSX/HTML tags — loop to handle nested/malformed tags like `<scr<script>ipt>`
  let prev = ''
  while (prev !== text) {
    prev = text
    text = text.replace(/<[^>]+>/g, '')
  }

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

function validatePrerequisites(): void {
  // Check venv exists
  if (!fs.existsSync(PYTHON_BIN)) {
    console.error('Error: TTS virtual environment not found.')
    console.error('  Run: bash scripts/setup-tts-venv.sh')
    process.exit(1)
  }

  // Check voice directory exists
  if (!fs.existsSync(VOICE_DIR)) {
    console.error('Error: voice/ directory not found.')
    console.error('  Run: bash scripts/prepare-voice-reference.sh')
    process.exit(1)
  }

  // Check voice references exist
  const voiceFiles = fs.readdirSync(VOICE_DIR).filter((f) =>
    f.startsWith('reference_') && f.endsWith('.wav')
  )
  if (voiceFiles.length === 0) {
    console.error('Error: No voice reference files found in voice/')
    console.error('  Run: bash scripts/prepare-voice-reference.sh')
    process.exit(1)
  }
  console.log(`Found ${voiceFiles.length} voice reference file(s)`)

  // Check ffmpeg
  try {
    execFileSync('which', ['ffmpeg'], { stdio: 'pipe' })
  } catch {
    console.error('Error: ffmpeg is not installed.')
    console.error('  macOS:  brew install ffmpeg')
    console.error('  Ubuntu: sudo apt-get install ffmpeg')
    process.exit(1)
  }
}

function startTtsProcess(): TtsProcess {
  let proc: ChildProcess | null = null
  let rl: readline.Interface | null = null
  let pendingResolve: ((resp: TtsResponse) => void) | null = null

  const ensureStarted = (): void => {
    if (proc) return

    proc = spawn(PYTHON_BIN, [PYTHON_SCRIPT], {
      stdio: ['pipe', 'pipe', 'inherit'],
    })

    proc.on('error', (err) => {
      console.error('Failed to start TTS process:', err)
      process.exit(1)
    })

    proc.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        console.error(`TTS process exited with code ${code}`)
      }
      proc = null
      rl = null
    })

    rl = readline.createInterface({ input: proc.stdout! })
    rl.on('line', (line: string) => {
      try {
        const resp = JSON.parse(line) as TtsResponse
        if (pendingResolve) {
          const resolve = pendingResolve
          pendingResolve = null
          resolve(resp)
        }
      } catch {
        // Ignore non-JSON lines (diagnostic output)
      }
    })
  }

  const send = (request: Record<string, string>): Promise<TtsResponse> => {
    ensureStarted()
    return new Promise((resolve, reject) => {
      pendingResolve = resolve
      const ok = proc!.stdin!.write(JSON.stringify(request) + '\n')
      if (!ok) {
        reject(new Error('Failed to write to TTS process stdin'))
      }
    })
  }

  const quit = async (): Promise<void> => {
    if (!proc) return
    try {
      await send({ command: 'quit' })
    } catch {
      // Process may have already exited
    }
    proc = null
    rl = null
  }

  return { send, quit }
}

function concatenateAndConvert(
  wavFiles: string[],
  outputMp3: string
): void {
  if (wavFiles.length === 0) return

  if (wavFiles.length === 1) {
    // Single chunk — convert directly
    execFileSync('ffmpeg', [
      '-i', wavFiles[0],
      '-qscale:a', '2',
      outputMp3,
      '-y', '-loglevel', 'warning',
    ])
  } else {
    // Multiple chunks — concatenate then convert
    const listFile = path.join(TMP_DIR, 'concat.txt')
    const listContent = wavFiles.map((f) => `file '${f}'`).join('\n')
    fs.writeFileSync(listFile, listContent)

    execFileSync('ffmpeg', [
      '-f', 'concat',
      '-safe', '0',
      '-i', listFile,
      '-qscale:a', '2',
      outputMp3,
      '-y', '-loglevel', 'warning',
    ])

    fs.unlinkSync(listFile)
  }
}

async function generateAudioForSlug(
  tts: TtsProcess,
  slug: string,
  text: string
): Promise<void> {
  const outputPath = path.join(AUDIO_DIR, `${slug}.mp3`)

  // Check if audio already exists (skip if so)
  if (fs.existsSync(outputPath)) {
    console.log(`Skipping "${slug}" (audio already exists)`)
    return
  }

  const chunks = splitTextIntoChunks(text)
  console.log(
    `Generating audio for "${slug}" (${text.length} chars, ${chunks.length} chunk(s))...`
  )

  // Clean tmp dir for this slug
  if (fs.existsSync(TMP_DIR)) {
    const oldFiles = fs.readdirSync(TMP_DIR).filter((f) => f.startsWith(`${slug}_`))
    for (const f of oldFiles) {
      fs.unlinkSync(path.join(TMP_DIR, f))
    }
  } else {
    fs.mkdirSync(TMP_DIR, { recursive: true })
  }

  const wavFiles: string[] = []

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    const wavPath = path.join(TMP_DIR, `${slug}_${i}.wav`)
    console.log(
      `   Chunk ${i + 1}/${chunks.length} (${chunk.length} chars)...`
    )

    const resp = await tts.send({
      text: chunk,
      output_path: wavPath,
      voice_dir: VOICE_DIR,
    })

    if (!resp.success) {
      throw new Error(`TTS failed for chunk ${i + 1}: ${resp.error}`)
    }

    wavFiles.push(wavPath)
  }

  // Concatenate WAV chunks and convert to MP3
  concatenateAndConvert(wavFiles, outputPath)

  // Clean up temp WAV files
  for (const f of wavFiles) {
    if (fs.existsSync(f)) fs.unlinkSync(f)
  }

  const stats = fs.statSync(outputPath)
  console.log(
    `Saved ${outputPath} (${(stats.size / 1024).toFixed(0)} KB)`
  )
}

async function main(): Promise<void> {
  // Validate prerequisites
  validatePrerequisites()

  // Ensure directories exist
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

  // Start the TTS subprocess (model loads lazily on first request)
  const tts = startTtsProcess()

  try {
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
        console.log(`Skipping "${slug}" (content too short)`)
        skipped++
        continue
      }

      try {
        await generateAudioForSlug(tts, slug, plainText)
        processed++
      } catch (error) {
        console.error(`Failed to generate audio for "${slug}":`, error)
        failed++
      }
    }
  } finally {
    // Always shut down the TTS process
    await tts.quit()

    // Clean up tmp directory
    if (fs.existsSync(TMP_DIR)) {
      const remaining = fs.readdirSync(TMP_DIR)
      for (const f of remaining) {
        fs.unlinkSync(path.join(TMP_DIR, f))
      }
      fs.rmdirSync(TMP_DIR)
    }
  }

  console.log('')
  console.log('Summary:')
  console.log(`   Processed: ${processed}`)
  console.log(`   Skipped:   ${skipped}`)
  console.log(`   Failed:    ${failed}`)
  console.log(`   Total:     ${blogFileNames.length}`)
  console.log('')
  console.log(`Audio files are in: ${AUDIO_DIR}`)
}

main().catch(console.error)
