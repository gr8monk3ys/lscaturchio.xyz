import { NextRequest, NextResponse } from 'next/server';
import { searchEmbeddings } from '@/lib/embeddings';
import { withRateLimit } from '@/lib/with-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';
import type { EmbeddingResult, RelatedPost } from '@/types/embeddings';

const handleGet = async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const title = searchParams.get('title');
    const currentUrl = searchParams.get('url');
    const limit = parseInt(searchParams.get('limit') || '3');

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'Post title is required' },
        { status: 400 }
      );
    }

    // Search for similar posts using the title
    const results = await searchEmbeddings(title, limit + 5); // Get extra to filter out current post

    // Group by unique posts and exclude current post
    const seenUrls = new Set<string>();
    const relatedPosts: RelatedPost[] = (results as EmbeddingResult[])
      .filter((result) => {
        const url = result.metadata?.url;
        if (!url || url === currentUrl || seenUrls.has(url)) {
          return false;
        }
        seenUrls.add(url);
        return true;
      })
      .slice(0, limit)
      .map((result) => ({
        title: result.metadata?.title || 'Untitled',
        url: result.metadata?.url || '',
        description: result.metadata?.description || '',
        date: result.metadata?.date || '',
        image: result.metadata?.image || '/images/blog/default.webp',
        similarity: result.similarity,
      }));

    return NextResponse.json({
      related: relatedPosts,
      count: relatedPosts.length,
    });
  } catch (error) {
    console.error('Related posts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch related posts' },
      { status: 500 }
    );
  }
};

// Export with rate limiting (5 requests per minute)
export const GET = withRateLimit(handleGet, RATE_LIMITS.AI_HEAVY);
