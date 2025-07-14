// Rule: TypeScript Usage - Use explicit return types
import { NextRequest, NextResponse } from 'next/server';
import { searchBlogPosts } from '@/lib/searchUtils';
import { headers } from 'next/headers';

// Rule: Error Handling - Implement proper error handling
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json({ results: [] });
    }
    
    const results = await searchBlogPosts(query);
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}
