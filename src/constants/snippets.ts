/**
 * Code snippets data for the snippets page
 * Extracted from snippets-grid.tsx for better separation of concerns
 */

export interface Snippet {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  category: string;
}

export const SNIPPETS: Snippet[] = [
  {
    id: '1',
    title: 'RAG Pipeline with LangChain',
    description: 'Complete RAG pipeline with document chunking, embedding, and retrieval using LangChain.',
    code: `from langchain.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain.chat_models import ChatOpenAI

# Load and chunk documents
loader = TextLoader("docs.txt")
documents = loader.load()
splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
chunks = splitter.split_documents(documents)

# Create vector store
embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_documents(chunks, embeddings)

# Create RAG chain
llm = ChatOpenAI(model="gpt-4o", temperature=0)
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=vectorstore.as_retriever(search_kwargs={"k": 3}),
    return_source_documents=True
)

# Query
result = qa_chain({"query": "What is the main topic?"})
print(result["result"])`,
    language: 'python',
    tags: ['langchain', 'rag', 'embeddings', 'vector-search'],
    category: 'AI/ML',
  },
  {
    id: '2',
    title: 'Claude API Streaming',
    description: 'Stream responses from Claude API with proper error handling and token counting.',
    code: `import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

async function streamClaude(prompt: string) {
  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  let fullResponse = ''

  for await (const event of stream) {
    if (event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta') {
      process.stdout.write(event.delta.text)
      fullResponse += event.delta.text
    }
  }

  const finalMessage = await stream.finalMessage()
  console.log('\\nTokens:', finalMessage.usage)

  return fullResponse
}`,
    language: 'typescript',
    tags: ['claude', 'anthropic', 'streaming', 'llm'],
    category: 'AI/ML',
  },
  {
    id: '3',
    title: 'Cosine Similarity Search',
    description: 'Efficient cosine similarity search for finding similar embeddings in a vector database.',
    code: `import numpy as np
from typing import List, Tuple

def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def search_similar(
    query_embedding: np.ndarray,
    embeddings: np.ndarray,
    documents: List[str],
    top_k: int = 5
) -> List[Tuple[str, float]]:
    """Find top_k most similar documents to query."""
    similarities = np.array([
        cosine_similarity(query_embedding, emb)
        for emb in embeddings
    ])

    # Get indices of top_k highest similarities
    top_indices = np.argsort(similarities)[-top_k:][::-1]

    return [
        (documents[i], similarities[i])
        for i in top_indices
    ]

# Usage
results = search_similar(query_emb, all_embeddings, docs, top_k=3)
for doc, score in results:
    print(f"Score: {score:.4f} - {doc[:100]}...")`,
    language: 'python',
    tags: ['embeddings', 'vector-search', 'numpy', 'similarity'],
    category: 'AI/ML',
  },
  {
    id: '4',
    title: 'OpenAI Function Calling',
    description: 'Structured output with OpenAI function calling for reliable JSON extraction.',
    code: `import OpenAI from 'openai'

const openai = new OpenAI()

const tools = [{
  type: "function" as const,
  function: {
    name: "extract_entities",
    description: "Extract named entities from text",
    parameters: {
      type: "object",
      properties: {
        people: { type: "array", items: { type: "string" } },
        organizations: { type: "array", items: { type: "string" } },
        locations: { type: "array", items: { type: "string" } },
      },
      required: ["people", "organizations", "locations"],
    },
  },
}]

async function extractEntities(text: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: text }],
    tools,
    tool_choice: { type: "function", function: { name: "extract_entities" } },
  })

  const toolCall = response.choices[0].message.tool_calls?.[0]
  return JSON.parse(toolCall?.function.arguments || "{}")
}`,
    language: 'typescript',
    tags: ['openai', 'function-calling', 'structured-output', 'llm'],
    category: 'AI/ML',
  },
  {
    id: '5',
    title: 'Prompt Template with Variables',
    description: 'Type-safe prompt template system with variable injection for LLM applications.',
    code: `type Variables = Record<string, string | number>

function createPrompt(template: string) {
  return (variables: Variables): string => {
    return template.replace(
      /\\{\\{(\\w+)\\}\\}/g,
      (_, key) => String(variables[key] ?? \`{{\${key}}}\`)
    )
  }
}

// Usage
const summarizePrompt = createPrompt(\`
You are a helpful assistant. Summarize the following text
in {{max_sentences}} sentences for a {{audience}} audience.

Text: {{content}}

Summary:
\`)

const prompt = summarizePrompt({
  max_sentences: 3,
  audience: "technical",
  content: "Your long text here..."
})`,
    language: 'typescript',
    tags: ['prompts', 'templates', 'llm', 'utilities'],
    category: 'AI/ML',
  },
  {
    id: '6',
    title: 'Supabase Vector Search',
    description: 'Semantic search using Supabase pgvector extension with match_embeddings RPC.',
    code: `-- SQL: Create embeddings table with vector extension
create extension if not exists vector;

create table embeddings (
  id text primary key,
  content text,
  embedding vector(1536),
  metadata jsonb
);

create index on embeddings
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- SQL: Create match function
create function match_embeddings(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
) returns table (
  id text,
  content text,
  similarity float
) language plpgsql as $$
begin
  return query
  select
    e.id,
    e.content,
    1 - (e.embedding <=> query_embedding) as similarity
  from embeddings e
  where 1 - (e.embedding <=> query_embedding) > match_threshold
  order by e.embedding <=> query_embedding
  limit match_count;
end;
$$;`,
    language: 'sql',
    tags: ['supabase', 'pgvector', 'vector-search', 'sql'],
    category: 'AI/ML',
  },
  {
    id: '7',
    title: 'Token Counter for LLMs',
    description: 'Count tokens for OpenAI models using tiktoken to estimate costs and stay within limits.',
    code: `import tiktoken

def count_tokens(text: str, model: str = "gpt-4o") -> int:
    """Count tokens for a given model."""
    try:
        encoding = tiktoken.encoding_for_model(model)
    except KeyError:
        encoding = tiktoken.get_encoding("cl100k_base")

    return len(encoding.encode(text))

def estimate_cost(
    input_tokens: int,
    output_tokens: int,
    model: str = "gpt-4o"
) -> float:
    """Estimate API cost in USD."""
    # Prices per 1M tokens (as of 2024)
    prices = {
        "gpt-4o": {"input": 2.50, "output": 10.00},
        "gpt-4o-mini": {"input": 0.15, "output": 0.60},
        "claude-sonnet-4-20250514": {"input": 3.00, "output": 15.00},
    }

    p = prices.get(model, prices["gpt-4o"])
    return (input_tokens * p["input"] + output_tokens * p["output"]) / 1_000_000

# Usage
text = "Your prompt here..."
tokens = count_tokens(text)
print(f"Tokens: {tokens}, Est. cost: \${estimate_cost(tokens, 500):.4f}")`,
    language: 'python',
    tags: ['tiktoken', 'tokens', 'cost-estimation', 'llm'],
    category: 'AI/ML',
  },
  {
    id: '8',
    title: 'Chunking Strategy for RAG',
    description: 'Smart document chunking that respects sentence boundaries for better RAG retrieval.',
    code: `import re
from typing import List

def smart_chunk(
    text: str,
    chunk_size: int = 1000,
    overlap: int = 200
) -> List[str]:
    """
    Chunk text at sentence boundaries, respecting max size.
    Better for RAG than naive character splitting.
    """
    # Split into sentences
    sentences = re.split(r'(?<=[.!?])\\s+', text)

    chunks = []
    current_chunk = []
    current_size = 0

    for sentence in sentences:
        sentence_size = len(sentence)

        if current_size + sentence_size > chunk_size and current_chunk:
            # Save current chunk
            chunks.append(' '.join(current_chunk))

            # Start new chunk with overlap
            overlap_text = ' '.join(current_chunk)[-overlap:]
            current_chunk = [overlap_text] if overlap_text else []
            current_size = len(overlap_text)

        current_chunk.append(sentence)
        current_size += sentence_size

    if current_chunk:
        chunks.append(' '.join(current_chunk))

    return chunks`,
    language: 'python',
    tags: ['chunking', 'rag', 'text-processing', 'nlp'],
    category: 'AI/ML',
  },
];

/**
 * Get all unique categories from snippets
 */
export function getSnippetCategories(): string[] {
  return ['all', ...Array.from(new Set(SNIPPETS.map(s => s.category)))];
}
