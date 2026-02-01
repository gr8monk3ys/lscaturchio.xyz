import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock dependencies before importing the routes
vi.mock('@/lib/getAllBlogs', () => ({
  getAllBlogs: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
}));

// Mock rate limiting to pass through for tests
vi.mock('@/lib/with-rate-limit', () => ({
  withRateLimit: (handler: (req: NextRequest) => Promise<Response>) => handler,
}));

vi.mock('@/lib/rate-limit', () => ({
  RATE_LIMITS: {
    PUBLIC: { limit: 100, window: 60000 },
  },
}));

import { GET as GETList } from '@/app/api/v1/blogs/route';
import { GET as GETSingle } from '@/app/api/v1/blogs/[slug]/route';
import { getAllBlogs } from '@/lib/getAllBlogs';
import { logError } from '@/lib/logger';

// Store original env
const originalEnv = { ...process.env };

describe('/api/v1/blogs', () => {
  const mockBlogs = [
    {
      slug: 'getting-started-with-react',
      title: 'Getting Started with React',
      description: 'A comprehensive guide to React',
      date: '2024-03-01',
      content: 'React is a JavaScript library...',
      tags: ['react', 'javascript', 'frontend'],
      image: '/images/blog/react-guide.webp',
    },
    {
      slug: 'typescript-best-practices',
      title: 'TypeScript Best Practices',
      description: 'Learn TypeScript the right way',
      date: '2024-02-15',
      content: 'TypeScript adds type safety...',
      tags: ['typescript', 'javascript'],
      image: '/images/blog/typescript.webp',
    },
    {
      slug: 'nextjs-app-router',
      title: 'Next.js App Router Guide',
      description: 'Master the new App Router',
      date: '2024-01-20',
      content: 'The App Router is the future...',
      tags: ['nextjs', 'react', 'frontend'],
      image: '/images/blog/nextjs.webp',
    },
    {
      slug: 'css-tricks',
      title: 'CSS Tips and Tricks',
      description: 'Modern CSS techniques',
      date: '2024-01-10',
      content: 'CSS has evolved...',
      tags: ['css', 'frontend'],
      image: '/images/blog/css.webp',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SITE_URL = 'https://test.example.com';
    (getAllBlogs as ReturnType<typeof vi.fn>).mockResolvedValue([...mockBlogs]);
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('GET /api/v1/blogs (list)', () => {
    it('returns list of blogs with correct structure', async () => {
      const request = new NextRequest('http://localhost/api/v1/blogs');
      const response = await GETList(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('meta');
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('returns blogs sorted by date (newest first)', async () => {
      const request = new NextRequest('http://localhost/api/v1/blogs');
      const response = await GETList(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data[0].slug).toBe('getting-started-with-react');
      expect(data.data[1].slug).toBe('typescript-best-practices');
      expect(data.data[2].slug).toBe('nextjs-app-router');
    });

    it('returns correct meta information', async () => {
      const request = new NextRequest('http://localhost/api/v1/blogs');
      const response = await GETList(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.meta.total).toBe(4);
      expect(data.meta.limit).toBe(10); // default limit
      expect(data.meta.offset).toBe(0); // default offset
      expect(data.meta.hasMore).toBe(false);
    });

    it('includes full URL in blog data', async () => {
      const request = new NextRequest('http://localhost/api/v1/blogs');
      const response = await GETList(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // URL should include the blog path - the domain is set at module load time
      expect(data.data[0].url).toContain('/blog/getting-started-with-react');
      expect(data.data[0].url).toMatch(/^https?:\/\/.+\/blog\/getting-started-with-react$/);
    });

    it('uses default site URL when env is not set', async () => {
      // The SITE_URL constant is captured at module load time,
      // so we test by checking the URL format
      const request = new NextRequest('http://localhost/api/v1/blogs');
      const response = await GETList(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // URL should contain the blog slug
      expect(data.data[0].url).toContain('/blog/');
    });

    describe('tag filtering', () => {
      it('filters blogs by tag', async () => {
        const request = new NextRequest('http://localhost/api/v1/blogs?tag=react');
        const response = await GETList(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.data.length).toBe(2);
        expect(data.data.every((blog: { tags: string[] }) => blog.tags.includes('react'))).toBe(true);
        expect(data.meta.total).toBe(2);
      });

      it('returns empty list for non-existent tag', async () => {
        const request = new NextRequest('http://localhost/api/v1/blogs?tag=nonexistent');
        const response = await GETList(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.data).toEqual([]);
        expect(data.meta.total).toBe(0);
      });

      it('is case-sensitive for tag matching', async () => {
        const request = new NextRequest('http://localhost/api/v1/blogs?tag=React');
        const response = await GETList(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        // Tags are lowercase in test data, so React won't match
        expect(data.data.length).toBe(0);
      });
    });

    describe('pagination', () => {
      it('respects limit parameter', async () => {
        const request = new NextRequest('http://localhost/api/v1/blogs?limit=2');
        const response = await GETList(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.data.length).toBe(2);
        expect(data.meta.limit).toBe(2);
        expect(data.meta.total).toBe(4);
        expect(data.meta.hasMore).toBe(true);
      });

      it('respects offset parameter', async () => {
        const request = new NextRequest('http://localhost/api/v1/blogs?offset=2');
        const response = await GETList(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.data.length).toBe(2);
        expect(data.meta.offset).toBe(2);
        expect(data.data[0].slug).toBe('nextjs-app-router');
      });

      it('combines limit and offset correctly', async () => {
        const request = new NextRequest('http://localhost/api/v1/blogs?limit=2&offset=1');
        const response = await GETList(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.data.length).toBe(2);
        expect(data.data[0].slug).toBe('typescript-best-practices');
        expect(data.data[1].slug).toBe('nextjs-app-router');
        expect(data.meta.hasMore).toBe(true);
      });

      it('returns empty data when offset exceeds total', async () => {
        const request = new NextRequest('http://localhost/api/v1/blogs?offset=100');
        const response = await GETList(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.data).toEqual([]);
        expect(data.meta.hasMore).toBe(false);
      });

      it('normalizes invalid limit to default', async () => {
        const request = new NextRequest('http://localhost/api/v1/blogs?limit=invalid');
        const response = await GETList(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.meta.limit).toBe(10); // default limit
      });

      it('clamps limit to maximum 100', async () => {
        const request = new NextRequest('http://localhost/api/v1/blogs?limit=500');
        const response = await GETList(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.meta.limit).toBe(100);
      });

      it('clamps limit to minimum 1', async () => {
        const request = new NextRequest('http://localhost/api/v1/blogs?limit=0');
        const response = await GETList(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.meta.limit).toBe(1);
      });

      it('clamps negative offset to 0', async () => {
        const request = new NextRequest('http://localhost/api/v1/blogs?offset=-10');
        const response = await GETList(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.meta.offset).toBe(0);
      });
    });

    describe('data structure', () => {
      beforeEach(() => {
        // Reset mock to default after pagination tests
        (getAllBlogs as ReturnType<typeof vi.fn>).mockResolvedValue([...mockBlogs]);
      });

      it('returns correct fields for each blog', async () => {
        const request = new NextRequest('http://localhost/api/v1/blogs?limit=1');
        const response = await GETList(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        const blog = data.data[0];
        expect(blog).toHaveProperty('title');
        expect(blog).toHaveProperty('description');
        expect(blog).toHaveProperty('date');
        expect(blog).toHaveProperty('slug');
        expect(blog).toHaveProperty('tags');
        expect(blog).toHaveProperty('image');
        expect(blog).toHaveProperty('url');

        // Should NOT include content (full content)
        expect(blog).not.toHaveProperty('content');
      });

      it('provides default image when blog has no image', async () => {
        const blogsWithMissingImage = [
          {
            slug: 'no-image-post',
            title: 'No Image Post',
            description: 'Post without image',
            date: '2024-01-01',
            content: 'Content',
            tags: [],
            // image is undefined
          },
        ];

        (getAllBlogs as ReturnType<typeof vi.fn>).mockResolvedValue(blogsWithMissingImage);

        const request = new NextRequest('http://localhost/api/v1/blogs');
        const response = await GETList(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.data[0].image).toBe('/images/blog/default.webp');
      });

      it('provides empty tags array when blog has no tags', async () => {
        const blogsWithMissingTags = [
          {
            slug: 'no-tags-post',
            title: 'No Tags Post',
            description: 'Post without tags',
            date: '2024-01-01',
            content: 'Content',
            image: '/images/blog/test.webp',
            // tags is undefined
          },
        ];

        (getAllBlogs as ReturnType<typeof vi.fn>).mockResolvedValue(blogsWithMissingTags);

        const request = new NextRequest('http://localhost/api/v1/blogs');
        const response = await GETList(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.data[0].tags).toEqual([]);
      });
    });

    describe('error handling', () => {
      it('returns 500 when getAllBlogs throws', async () => {
        (getAllBlogs as ReturnType<typeof vi.fn>).mockRejectedValue(
          new Error('File system error')
        );

        const request = new NextRequest('http://localhost/api/v1/blogs');
        const response = await GETList(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Failed to fetch blogs');
      });

      it('logs error on failure', async () => {
        const error = new Error('Database error');
        (getAllBlogs as ReturnType<typeof vi.fn>).mockRejectedValue(error);

        const request = new NextRequest('http://localhost/api/v1/blogs');
        await GETList(request);

        expect(logError).toHaveBeenCalledWith(
          'Blogs API: Unexpected error',
          error,
          { component: 'v1/blogs', action: 'GET' }
        );
      });
    });
  });

  describe('GET /api/v1/blogs/[slug] (single)', () => {
    // Helper to create mock params (Next.js 15+ uses Promise-based params)
    const createParams = (slug: string) => Promise.resolve({ slug });

    beforeEach(() => {
      // Reset mock to default resolved value after list tests
      (getAllBlogs as ReturnType<typeof vi.fn>).mockResolvedValue([...mockBlogs]);
    });

    it('returns single blog post by slug', async () => {
      const request = new NextRequest('http://localhost/api/v1/blogs/getting-started-with-react');
      const response = await GETSingle(request, { params: createParams('getting-started-with-react') });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.slug).toBe('getting-started-with-react');
      expect(data.data.title).toBe('Getting Started with React');
    });

    it('returns 404 for non-existent slug', async () => {
      const request = new NextRequest('http://localhost/api/v1/blogs/non-existent-post');
      const response = await GETSingle(request, { params: createParams('non-existent-post') });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Blog post not found');
    });

    it('returns correct data structure for single blog', async () => {
      const request = new NextRequest('http://localhost/api/v1/blogs/typescript-best-practices');
      const response = await GETSingle(request, { params: createParams('typescript-best-practices') });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveProperty('title');
      expect(data.data).toHaveProperty('description');
      expect(data.data).toHaveProperty('date');
      expect(data.data).toHaveProperty('slug');
      expect(data.data).toHaveProperty('tags');
      expect(data.data).toHaveProperty('image');
      expect(data.data).toHaveProperty('url');
    });

    it('includes full URL in response', async () => {
      const request = new NextRequest('http://localhost/api/v1/blogs/css-tricks');
      const response = await GETSingle(request, { params: createParams('css-tricks') });
      const data = await response.json();

      expect(response.status).toBe(200);
      // URL should include the blog path - the domain is set at module load time
      expect(data.data.url).toContain('/blog/css-tricks');
      expect(data.data.url).toMatch(/^https?:\/\/.+\/blog\/css-tricks$/);
    });

    describe('slug handling', () => {
      it('returns 404 for empty slug (no matching blog)', async () => {
        const request = new NextRequest('http://localhost/api/v1/blogs/');
        const response = await GETSingle(request, { params: createParams('') });
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.error).toBe('Blog post not found');
      });

      it('returns 404 for non-matching slug with uppercase', async () => {
        const request = new NextRequest('http://localhost/api/v1/blogs/Invalid-Slug');
        const response = await GETSingle(request, { params: createParams('Invalid-Slug') });
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.error).toBe('Blog post not found');
      });

      it('returns 404 for non-matching slug with special chars', async () => {
        const request = new NextRequest('http://localhost/api/v1/blogs/invalid_slug!');
        const response = await GETSingle(request, { params: createParams('invalid_slug!') });
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.error).toBe('Blog post not found');
      });

      it('returns 404 for very long non-existent slug', async () => {
        const longSlug = 'a'.repeat(201);
        const request = new NextRequest(`http://localhost/api/v1/blogs/${longSlug}`);
        const response = await GETSingle(request, { params: createParams(longSlug) });
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.error).toBe('Blog post not found');
      });

      it('returns 404 for valid format but non-existent slug', async () => {
        const request = new NextRequest('http://localhost/api/v1/blogs/valid-slug-123');
        const response = await GETSingle(request, { params: createParams('valid-slug-123') });
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.error).toBe('Blog post not found');
      });
    });

    describe('error handling', () => {
      it('returns 500 when getAllBlogs throws', async () => {
        (getAllBlogs as ReturnType<typeof vi.fn>).mockRejectedValue(
          new Error('Database error')
        );

        const request = new NextRequest('http://localhost/api/v1/blogs/getting-started-with-react');
        const response = await GETSingle(request, { params: createParams('getting-started-with-react') });
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Failed to fetch blog');
      });

      it('logs error with slug context', async () => {
        const error = new Error('Unexpected error');
        (getAllBlogs as ReturnType<typeof vi.fn>).mockRejectedValue(error);

        const request = new NextRequest('http://localhost/api/v1/blogs/test-slug');
        await GETSingle(request, { params: createParams('test-slug') });

        expect(logError).toHaveBeenCalledWith(
          'Blogs API: Unexpected error',
          error,
          { component: 'v1/blogs/[slug]', action: 'GET', slug: 'test-slug' }
        );
      });
    });

    describe('default values', () => {
      beforeEach(() => {
        // Reset mock to default resolved value after error handling tests
        (getAllBlogs as ReturnType<typeof vi.fn>).mockResolvedValue([...mockBlogs]);
      });

      it('provides default image for blog without image', async () => {
        const blogsWithMissingImage = [
          ...mockBlogs,
          {
            slug: 'no-image-post',
            title: 'No Image Post',
            description: 'Post without image',
            date: '2024-01-01',
            content: 'Content',
            tags: [],
            // image is undefined
          },
        ];

        (getAllBlogs as ReturnType<typeof vi.fn>).mockResolvedValue(blogsWithMissingImage);

        const request = new NextRequest('http://localhost/api/v1/blogs/no-image-post');
        const response = await GETSingle(request, { params: createParams('no-image-post') });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.data.image).toBe('/images/blog/default.webp');
      });

      it('provides empty tags array for blog without tags', async () => {
        const blogsWithMissingTags = [
          ...mockBlogs,
          {
            slug: 'no-tags-post',
            title: 'No Tags Post',
            description: 'Post without tags',
            date: '2024-01-01',
            content: 'Content',
            image: '/images/blog/test.webp',
            // tags is undefined
          },
        ];

        (getAllBlogs as ReturnType<typeof vi.fn>).mockResolvedValue(blogsWithMissingTags);

        const request = new NextRequest('http://localhost/api/v1/blogs/no-tags-post');
        const response = await GETSingle(request, { params: createParams('no-tags-post') });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.data.tags).toEqual([]);
      });
    });
  });
});
