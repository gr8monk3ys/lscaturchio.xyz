import { NextRequest, NextResponse } from 'next/server';

// List of supported locales
const locales = ['en'];
const defaultLocale = 'en';

// Get the preferred locale from the request
function getLocale(request: NextRequest) {
  // Check if there is a cookie with a preferred locale
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale;
  }

  // Check the Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const parsedLocales = acceptLanguage.split(',').map(l => l.split(';')[0].trim());
    const matchedLocale = parsedLocales.find(l => locales.includes(l));
    if (matchedLocale) {
      return matchedLocale;
    }
  }

  // Default to the default locale
  return defaultLocale;
}

export function middleware(request: NextRequest) {
  // Get the locale from the request
  const locale = getLocale(request);

  // Skip if the locale is already set in the pathname
  if (request.nextUrl.pathname.startsWith(`/${locale}/`)) {
    return NextResponse.next();
  }

  // For now, we're not redirecting to localized paths since we only support English
  // This middleware is in place for future internationalization support
  return NextResponse.next();
}

export const config = {
  // Skip static files and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};
