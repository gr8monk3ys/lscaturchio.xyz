"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Tag, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface TILItem {
  id: string
  title: string
  content: string
  date: string
  tags: string[]
  category: 'code' | 'ai' | 'design' | 'productivity' | 'other'
  url?: string
}

// AI-focused learnings and discoveries
const SAMPLE_TILS: TILItem[] = [
  {
    id: '1',
    title: 'Claude 3.5 Sonnet Outperforms GPT-4 on Code',
    content: 'In my testing, Claude 3.5 Sonnet consistently produces better code than GPT-4, especially for complex refactoring tasks. The key is its stronger instruction following and lower hallucination rate on technical details. Context window of 200k tokens makes it ideal for large codebases.',
    date: '2025-01-18',
    tags: ['llm', 'claude', 'coding'],
    category: 'ai',
  },
  {
    id: '2',
    title: 'RAG Chunking: Semantic > Fixed-Size',
    content: 'Switched from fixed 500-token chunks to semantic chunking using sentence-transformers for topic boundaries. Retrieval precision jumped from 73% to 89%. The key insight: preserve logical units of meaning, not arbitrary character counts.',
    date: '2025-01-17',
    tags: ['rag', 'embeddings', 'nlp'],
    category: 'ai',
  },
  {
    id: '3',
    title: 'Fine-tuning vs RAG: When to Choose Each',
    content: 'Fine-tuning is for style/behavior changes. RAG is for knowledge injection. Tried fine-tuning GPT-3.5 on domain docs - model hallucinated more. Same docs in RAG pipeline: 94% accuracy. Fine-tune for HOW the model responds, use RAG for WHAT it knows.',
    date: '2025-01-16',
    tags: ['fine-tuning', 'rag', 'llm'],
    category: 'ai',
  },
  {
    id: '4',
    title: 'Vector DB Showdown: Pinecone vs Chroma vs FAISS',
    content: 'For production RAG: Pinecone wins on managed infra + hybrid search. For local dev: Chroma is perfect (embedded, Python-native). For scale on a budget: FAISS with IVF index handles 10M+ vectors on a single GPU. Match your tool to your scale.',
    date: '2025-01-15',
    tags: ['vector-db', 'rag', 'infrastructure'],
    category: 'ai',
  },
  {
    id: '5',
    title: 'Prompt Engineering: Chain-of-Thought Still Wins',
    content: 'Tested various prompting strategies on reasoning tasks. Simple CoT ("Let\'s think step by step") still beats zero-shot by 15-20% on complex tasks. But for simple extraction/classification, zero-shot is faster and cheaper. Know when to use each.',
    date: '2025-01-14',
    tags: ['prompting', 'llm', 'optimization'],
    category: 'ai',
  },
  {
    id: '6',
    title: 'LangChain vs LlamaIndex for RAG',
    content: 'LangChain: better for complex agent workflows and tool use. LlamaIndex: superior for pure RAG with better out-of-box retrieval. For my blog\'s AI chat, LlamaIndex with sentence-transformers + Supabase pgvector was the sweet spot.',
    date: '2025-01-13',
    tags: ['langchain', 'llamaindex', 'rag'],
    category: 'ai',
  },
  {
    id: '7',
    title: 'Embedding Model: text-embedding-3-small is Enough',
    content: 'OpenAI\'s text-embedding-3-small (1536d) performs nearly as well as ada-002 for semantic search at 5x lower cost. For most RAG use cases, the smaller model is the right choice. Only use large (3072d) for cross-lingual or highly nuanced domains.',
    date: '2025-01-12',
    tags: ['embeddings', 'openai', 'cost-optimization'],
    category: 'ai',
  },
  {
    id: '8',
    title: 'Anthropic\'s Constitutional AI Approach',
    content: 'Reading Anthropic\'s research on Constitutional AI. The key insight: instead of RLHF with human feedback, use AI feedback guided by a "constitution" of principles. Results in more consistent, explainable alignment. Claude\'s helpfulness comes from this approach.',
    date: '2025-01-11',
    tags: ['alignment', 'anthropic', 'research'],
    category: 'ai',
  },
  {
    id: '9',
    title: 'Local LLMs: Ollama + Mistral 7B is Surprisingly Good',
    content: 'Running Mistral 7B locally via Ollama for private/offline tasks. Quantized to 4-bit, it runs at 30 tokens/sec on M2 Mac. Quality is ~80% of GPT-3.5 for most tasks. Perfect for development, testing prompts, and privacy-sensitive applications.',
    date: '2025-01-10',
    tags: ['local-llm', 'ollama', 'mistral'],
    category: 'ai',
  },
  {
    id: '10',
    title: 'Multimodal AI: Vision Models for Document Parsing',
    content: 'GPT-4V and Claude Vision are game-changers for document understanding. Parsing complex PDFs with tables/charts that failed traditional OCR? Just screenshot and ask the model. Accuracy jumped from 60% (PyPDF) to 95% (vision model). Cost is higher but worth it for complex docs.',
    date: '2025-01-09',
    tags: ['multimodal', 'vision', 'document-ai'],
    category: 'ai',
  },
]

const CATEGORY_COLORS = {
  code: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
  ai: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300',
  design: 'bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300',
  productivity: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300',
  other: 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300',
}

export function TILGrid() {
  const [items, setItems] = useState<TILItem[]>(SAMPLE_TILS)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = ['all', ...Array.from(new Set(items.map(item => item.category)))]

  const filteredItems = selectedCategory === 'all'
    ? items
    : items.filter(item => item.category === selectedCategory)

  return (
    <div>
      {/* Category Filter */}
      <div className="flex flex-wrap gap-3 mb-8">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              selectedCategory === category
                ? 'neu-pressed text-primary'
                : 'neu-button hover:text-primary'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* TIL Cards */}
      <div className="space-y-6">
        {filteredItems.map((item, index) => (
          <motion.article
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 rounded-2xl neu-card"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-2 py-1 rounded text-xs font-medium ${CATEGORY_COLORS[item.category]}`}>
                  {item.category}
                </span>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <time dateTime={item.date}>
                    {new Date(item.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </time>
                </div>
              </div>
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>

            <h3 className="text-xl font-semibold mb-2 text-foreground">
              {item.title}
            </h3>

            <p className="text-muted-foreground mb-4 leading-relaxed">
              {item.content}
            </p>

            {item.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-muted-foreground hover:text-primary cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </motion.article>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 neu-flat rounded-2xl">
          <p className="text-muted-foreground">No TILs found in this category.</p>
        </div>
      )}
    </div>
  )
}
