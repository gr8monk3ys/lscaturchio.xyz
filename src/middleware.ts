import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define assets that should be cached
const CACHE_ASSET_PATTERNS = [
  /\.(jpg|jpeg|png|webp|avif|gif|svg)$/,
  /\.(css)$/,
  /\.(js)$/,
  /\.(woff|woff2|ttf|otf|eot)$/,
];

// Cache configuration by content type
const CACHE_CONTROL_SETTINGS = {
  // Static assets - long cache, with revalidation
  assets: 'public, max-age=31536000, must-revalidate',
  // HTML pages - short cache with frequent revalidation
  html: 'public, max-age=300, must-revalidate, stale-while-revalidate=60',
  // API responses - no client cache
  api: 'no-cache, no-store, must-revalidate',
  // Default for other content types
  default: 'public, max-age=60, stale-while-revalidate=30',
};

export async function middleware(request: NextRequest) {
  // Get the response
  const response = NextResponse.next();
  
  // Get pathname from request
  const { pathname } = request.nextUrl;
  
  // Add security headers to all responses
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Optimize www/non-www redirection
  const host = request.headers.get('host') || '';
  if (host.startsWith('www.')) {
    // Redirect www to non-www
    const newUrl = request.nextUrl.clone();
    newUrl.host = host.replace(/^www\./, '');
    return NextResponse.redirect(newUrl);
  }
  
  // Set appropriate cache headers based on content type
  if (pathname.startsWith('/api/')) {
    // API routes - no caching
    response.headers.set('Cache-Control', CACHE_CONTROL_SETTINGS.api);
  } else if (CACHE_ASSET_PATTERNS.some(pattern => pattern.test(pathname))) {
    // Static assets - long cache
    response.headers.set('Cache-Control', CACHE_CONTROL_SETTINGS.assets);
  } else if (pathname.endsWith('.html') || pathname === '/' || pathname === '') {
    // HTML content - short cache
    response.headers.set('Cache-Control', CACHE_CONTROL_SETTINGS.html);
  } else {
    // Default for other routes
    response.headers.set('Cache-Control', CACHE_CONTROL_SETTINGS.default);
  }
  
  // Add timing allowed origin header for performance metrics
  response.headers.set('Timing-Allow-Origin', '*');
  
  return response;
}

// Only run middleware on specific paths
export const config = {
  matcher: [
    // Apply to all paths except API routes and static assets managed differently
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
