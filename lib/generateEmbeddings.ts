import fs from 'fs';
import path from 'path';
import { createEmbedding, splitIntoChunks, storeEmbedding } from '../src/lib/embeddings';

const DATA_DIR = path.join(process.cwd(), 'public', 'my-data');

async function processFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath);
  
  // Split content into chunks
  const chunks = splitIntoChunks(content);
  
  console.log(`Processing ${fileName}: ${chunks.length} chunks`);

  // Process each chunk
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    try {
      // Create embedding
      const embedding = await createEmbedding(chunk);
      
      // Store in database
      await storeEmbedding(chunk, embedding, {
        source: fileName,
        chunk_index: i,
      });
      
      console.log(`✓ Processed chunk ${i + 1}/${chunks.length} of ${fileName}`);
    } catch (error) {
      console.error(`Error processing chunk ${i + 1} of ${fileName}:`, error);
    }
    
    // Rate limiting - wait 1 second between chunks
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function main() {
  // Create data directory if it doesn't exist
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log('Created my-data directory');
    return;
  }

  // Get all files in the data directory
  const files = fs.readdirSync(DATA_DIR)
    .filter(file => file.endsWith('.txt') || file.endsWith('.md'));

  console.log(`Found ${files.length} files to process`);

  // Process each file
  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    await processFile(filePath);
  }

  console.log('Finished processing all files');
}

main().catch(console.error);
