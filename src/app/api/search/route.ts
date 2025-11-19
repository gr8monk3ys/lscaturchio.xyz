import { NextRequest, NextResponse } from 'next/server';
import { searchEmbeddings } from '@/lib/embeddings';
import { withRateLimit } from '@/lib/with-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';
import type { EmbeddingResult, SearchResult } from '@/types/embeddings';

const handleGet = async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    if (query.length > 500) {
      return NextResponse.json(
        { error: 'Search query too long (max 500 characters)' },
        { status: 400 }
      );
    }

    // Use the existing searchEmbeddings function from embeddings.ts
    const results = await searchEmbeddings(query, Math.min(limit, 50));

    // Group results by blog post
    const groupedResults: Record<string, SearchResult> = (results as EmbeddingResult[]).reduce(
      (acc, result) => {
        const blogUrl = result.metadata?.url || '';
        if (!blogUrl) return acc;

        if (!acc[blogUrl]) {
          acc[blogUrl] = {
            title: result.metadata?.title || 'Untitled',
            url: blogUrl,
            description: result.metadata?.description || '',
            date: result.metadata?.date || '',
            similarity: result.similarity,
            snippets: [],
          };
        }

        // Add content snippet if it's unique
        if (result.content && !acc[blogUrl].snippets.includes(result.content)) {
          acc[blogUrl].snippets.push(result.content);
        }

        // Update similarity to the highest match
        if (result.similarity > acc[blogUrl].similarity) {
          acc[blogUrl].similarity = result.similarity;
        }

        return acc;
      },
      {} as Record<string, SearchResult>
    );

    // Convert to array and sort by similarity
    const searchResults = Object.values(groupedResults)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map((result) => ({
        ...result,
        snippets: result.snippets.slice(0, 2), // Limit to 2 snippets per result
      }));

    return NextResponse.json({
      query,
      results: searchResults,
      count: searchResults.length,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed. Please try again later.' },
      { status: 500 }
    );
  }
};

const handlePost = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const query = body.query;
    const limit = parseInt(body.limit || '10');

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    if (query.length > 500) {
      return NextResponse.json(
        { error: 'Search query too long (max 500 characters)' },
        { status: 400 }
      );
    }

    // Use the existing searchEmbeddings function
    const results = await searchEmbeddings(query, Math.min(limit, 50));

    // Group results by blog post
    const groupedResults: Record<string, SearchResult & { tags?: string[] }> = (
      results as EmbeddingResult[]
    ).reduce(
      (acc, result) => {
        const blogUrl = result.metadata?.url || '';
        if (!blogUrl) return acc;

        if (!acc[blogUrl]) {
          acc[blogUrl] = {
            title: result.metadata?.title || 'Untitled',
            url: blogUrl,
            description: result.metadata?.description || '',
            date: result.metadata?.date || '',
            tags: result.metadata?.tags || [],
            similarity: result.similarity,
            snippets: [],
          };
        }

        // Add content snippet if it's unique
        if (result.content && !acc[blogUrl].snippets.includes(result.content)) {
          acc[blogUrl].snippets.push(result.content);
        }

        // Update similarity to the highest match
        if (result.similarity > acc[blogUrl].similarity) {
          acc[blogUrl].similarity = result.similarity;
        }

        return acc;
      },
      {} as Record<string, SearchResult & { tags?: string[] }>
    );

    // Convert to array and sort by similarity
    const searchResults = Object.values(groupedResults)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map((result) => {
        const slug = result.url.split('/').pop() || '';
        return {
          slug,
          title: result.title,
          description: result.description,
          date: result.date,
          tags: result.tags || [],
          relevance: result.similarity,
        };
      });

    return NextResponse.json({
      query,
      results: searchResults,
      count: searchResults.length,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed. Please try again later.' },
      { status: 500 }
    );
  }
};

// Export with rate limiting (5 requests per minute)
export const GET = withRateLimit(handleGet, RATE_LIMITS.AI_HEAVY);
export const POST = withRateLimit(handlePost, RATE_LIMITS.AI_HEAVY);
