import fs from 'fs';
import path from 'path';
import {
  createEmbedding,
  getEmbeddingProvider,
  getProviderEmbeddingDimensions,
  isEmbeddingsAvailable,
} from '../src/lib/embeddings';
import { indexSource, neonIndexStore, type Embedder } from '../src/lib/embedding-ingest';
import { getEssaySource } from '../src/lib/essay-sources';
import { slugFromCorpusFileName } from '../src/lib/retrieval-corpus';

const DATA_DIR = path.join(process.cwd(), 'public', 'my-data');

function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

async function getSourceMetadata(fileName: string): Promise<Record<string, unknown>> {
  const baseMeta: Record<string, unknown> = { source: fileName };

  const slug = slugFromCorpusFileName(fileName);
  if (slug === null) {
    return baseMeta;
  }

  // Either essay shape; a flat `<slug>.mdx` used to fall through to a title
  // guessed from the slug.
  const essay = await getEssaySource(slug);

  if (!essay) {
    return {
      ...baseMeta,
      slug,
      url: `/blog/${slug}`,
      title: slugToTitle(slug),
    };
  }

  const { meta } = essay;

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

/**
 * The provider that passed preflight, for the whole run. `createEmbedding`
 * switches to Ollama when OpenAI refuses a key; mid-run that would mix two
 * vector spaces in one index, so a switch fails the chunk instead.
 */
function pinnedEmbedder(provider: string): Embedder {
  return {
    provider,
    async embed(text) {
      const embedding = await createEmbedding(text);
      if (getEmbeddingProvider() !== provider) {
        throw new Error(`Embedding provider changed mid-run from ${provider} to ${getEmbeddingProvider()}`);
      }
      // Pace requests to the provider.
      await new Promise((resolve) => setTimeout(resolve, 500));
      return embedding;
    },
  };
}

async function processFile(
  filePath: string,
  deps: Omit<Parameters<typeof indexSource>[1], 'mode'>,
  appendMode: boolean,
): Promise<boolean> {
  const name = path.basename(filePath);
  const metadata = await getSourceMetadata(name);
  const outcome = await indexSource(
    { name, text: fs.readFileSync(filePath, 'utf-8'), metadata },
    { ...deps, mode: appendMode ? 'append' : 'replace' },
  );

  switch (outcome.status) {
    case 'skipped':
      console.log(`↷ Skipping ${name} (unchanged, ${outcome.chunks} chunks)`);
      return true;
    case 'indexed':
      console.log(
        `✓ ${name}: ${outcome.chunks} chunks` +
          (outcome.removed > 0 ? ` (replaced ${outcome.removed})` : ''),
      );
      return true;
    case 'failed':
      console.error(
        `✗ ${name}: chunk ${outcome.chunk + 1}/${outcome.chunks} failed; existing rows kept.`,
        outcome.error,
      );
      return false;
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

  // Preflight: prove the provider can actually embed BEFORE touching the
  // table. Replace mode deletes each source's chunks and then re-inserts, so
  // a dead API key discovered mid-run empties the production embeddings table
  // — which is exactly what happened on 2026-08-03.
  try {
    await createEmbedding('embedding provider preflight');
  } catch (error) {
    console.error('');
    console.error('❌ Embedding provider preflight failed — no rows were touched.');
    console.error(`   Provider "${provider}" cannot create embeddings:`);
    console.error(`   ${error instanceof Error ? error.message : String(error)}`);
    console.error('   Fix OPENAI_API_KEY (or start Ollama) and re-run.');
    process.exit(1);
  }

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

  const deps = { embedder: pinnedEmbedder(provider), store: neonIndexStore() };
  const failed: string[] = [];
  for (const file of files) {
    const ok = await processFile(path.join(DATA_DIR, file), deps, appendMode);
    if (!ok) failed.push(file);
  }

  console.log('');
  if (failed.length > 0) {
    console.error(`Finished with ${failed.length} failed source(s): ${failed.join(', ')}`);
    console.error('Their previous rows are untouched; re-run to retry them.');
    process.exitCode = 1;
    return;
  }
  console.log('Finished processing all files');
}

main().catch(console.error);
