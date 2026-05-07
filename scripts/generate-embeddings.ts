import fs from 'fs';
import path from 'path';
import {
  createEmbedding,
  splitIntoChunks,
  storeEmbedding,
  deleteEmbeddingsBySource,
  getEmbeddingProvider,
  getProviderEmbeddingDimensions,
  isEmbeddingsAvailable,
} from '../src/lib/embeddings';
import { extractBlogMeta } from '../src/lib/blog-meta';

const DATA_DIR = path.join(process.cwd(), 'public', 'my-data');
const BLOG_DIR = path.join(process.cwd(), 'src', 'app', 'blog');

function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getSourceMetadata(fileName: string): Record<string, unknown> {
  const baseMeta: Record<string, unknown> = { source: fileName };

  if (!fileName.startsWith('blog-') || !fileName.endsWith('.md')) {
    return baseMeta;
  }

  const slug = fileName.replace(/^blog-/, '').replace(/\.md$/, '');
  const contentPath = path.join(BLOG_DIR, slug, 'content.mdx');

  if (!fs.existsSync(contentPath)) {
    return {
      ...baseMeta,
      slug,
      url: `/blog/${slug}`,
      title: slugToTitle(slug),
    };
  }

  const mdxContent = fs.readFileSync(contentPath, 'utf-8');
  const meta = extractBlogMeta(mdxContent);

  return {
    ...baseMeta,
    slug,
    url: `/blog/${slug}`,
    title: meta.title ?? slugToTitle(slug),
    description: meta.description ?? '',
    date: meta.date ?? '',
    image: meta.image ?? '/images/blog/default.webp',
    tags: meta.tags ?? [],
  };
}

async function processFile(filePath: string, appendMode: boolean) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath);
  const sourceMetadata = getSourceMetadata(fileName);

  // Split content into chunks
  const chunks = splitIntoChunks(content);

  if (!appendMode) {
    const removed = await deleteEmbeddingsBySource(fileName);
    if (removed > 0) {
      console.log(`Removed ${removed} existing embedding chunks for ${fileName}`);
    }
  }

  console.log(`Processing ${fileName}: ${chunks.length} chunks`);

  // Process each chunk
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    try {
      // Create embedding
      const embedding = await createEmbedding(chunk);

      // Store in database
      await storeEmbedding(chunk, embedding, {
        ...sourceMetadata,
        chunk_index: i,
        chunk_total: chunks.length,
      });

      console.log(`✓ Processed chunk ${i + 1}/${chunks.length} of ${fileName}`);
    } catch (error) {
      console.error(`Error processing chunk ${i + 1} of ${fileName}:`, error);
    }

    // Rate limiting - wait 500ms between chunks (Ollama is faster than OpenAI)
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const appendMode = args.has('--append');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not configured.');
    console.error('Set DATABASE_URL in your environment or .env.local before running embeddings generation.');
    process.exit(1);
  }

  // Check if embedding provider is available
  const available = await isEmbeddingsAvailable();
  if (!available) {
    console.error('❌ No embedding provider available!');
    console.error('');
    console.error('Options:');
    console.error('  1. Install and start Ollama: https://ollama.ai/download');
    console.error('     Then run: ollama pull nomic-embed-text');
    console.error('');
    console.error('  2. Set OPENAI_API_KEY in .env.local');
    process.exit(1);
  }

  const provider = getEmbeddingProvider();
  const dimensions = getProviderEmbeddingDimensions();
  console.log(`Using ${provider} for embeddings (${dimensions} dimensions)`);
  console.log(`Mode: ${appendMode ? 'append' : 'replace existing by source'}`);
  console.log('');

  // Create data directory if it doesn't exist
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log('Created my-data directory at public/my-data/');
    console.log('Add .txt or .md files to this directory and run again.');
    return;
  }

  // Get all files in the data directory
  const files = fs
    .readdirSync(DATA_DIR)
    .filter((file) => file.endsWith('.txt') || file.endsWith('.md'));

  if (files.length === 0) {
    console.log('No .txt or .md files found in public/my-data/');
    console.log('Add content files and run again.');
    return;
  }

  console.log(`Found ${files.length} files to process`);

  // Process each file
  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    await processFile(filePath, appendMode);
  }

  console.log('');
  console.log('Finished processing all files');
}

main().catch(console.error);
