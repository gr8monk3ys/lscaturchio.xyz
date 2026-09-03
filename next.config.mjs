/** @type {import('next').NextConfig} */
import createMDX from '@next/mdx';
import { withSentryConfig } from '@sentry/nextjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  outputFileTracingRoot: __dirname,
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  async redirects() {
    return [
      // The eight engineering-shaped topic hubs were replaced by five themes
      // derived from the real tag distribution. These URLs were live and
      // indexed, so they get a real 308 rather than a soft 404.
      { source: '/topics/rag-llms', destination: '/topics/technology-attention', permanent: true },
      { source: '/topics/ai-society', destination: '/topics/technology-attention', permanent: true },
      { source: '/topics/systems-craft', destination: '/topics/technology-attention', permanent: true },
      { source: '/topics/work-economy', destination: '/topics/money-work', permanent: true },
      { source: '/topics/places-infrastructure', destination: '/topics/place-climate', permanent: true },
      { source: '/topics/open-source-tools', destination: '/topics/technology-attention', permanent: true },
      {
        source: '/services',
        destination: '/work-with-me#services',
        permanent: true,
      },
      {
        source: '/testimonials',
        destination: '/work-with-me#testimonials',
        permanent: true,
      },
      {
        source: '/roadmap',
        destination: '/changelog#roadmap',
        permanent: true,
      },
      {
        source: '/til',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/til/:path*',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/snippets',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/snippets/:path*',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/analytics',
        destination: '/stats',
        permanent: true,
      },
      {
        source: '/start-here',
        destination: '/',
        permanent: true,
      },
      // Projects retired from the catalogue in July 2026. The [slug] route
      // soft-redirects unknown slugs, but these URLs were live and indexed, so
      // they get a real 308 instead.
      {
        source: '/projects/leetcode-solver-bot',
        destination: '/projects',
        permanent: true,
      },
      {
        source: '/projects/find-my-doggo',
        destination: '/projects',
        permanent: true,
      },
      {
        source: '/projects/linkflame',
        destination: '/projects',
        permanent: true,
      },
      {
        source: '/projects/eyebook-pdf-reader',
        destination: '/projects',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000',
          },
          {
            key: 'Content-Security-Policy',
            // Every third-party grant names its consumer — when a feature is
            // removed, delete its lines here in the same pass. Consumers today:
            //  - giscus.app             guestbook + blog comments (script + iframe)
            //  - va.vercel-scripts.com  Vercel Analytics / Speed Insights loader
            //  - translate.google.com / translate.googleapis.com / www.gstatic.com /
            //    translate-pa.googleapis.com  Google Translate widget
            //    (src/components/i18n/google-translate.tsx)
            //  - *.ingest{.us,}.sentry.io  Sentry error beacons (DSN host)
            //  - vitals.vercel-insights.com  Speed Insights beacon (dev/preview)
            //  - static.cloudflareinsights.com / cloudflareinsights.com  Cloudflare
            //    Web Analytics — the beacon is injected by Cloudflare's proxy at the
            //    edge, so it has no reference anywhere in this repo (verified live
            //    2026-08-17; do not remove as "unused")
            //  - translate-pa.googleapis.com appears in script-src because the
            //    widget fetches it via JSONP (<script>), not XHR
            //  - ekldxpd3mp5h44qj.public.blob.vercel-storage.com  blog audio
            //    (Vercel Blob; the origin behind NEXT_PUBLIC_AUDIO_CDN_URL)
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' blob: giscus.app va.vercel-scripts.com translate.google.com translate.googleapis.com translate-pa.googleapis.com www.gstatic.com static.cloudflareinsights.com",
              "style-src 'self' 'unsafe-inline' www.gstatic.com translate.googleapis.com",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data: fonts.gstatic.com",
              "connect-src 'self' https://*.ingest.sentry.io https://*.ingest.us.sentry.io https://vitals.vercel-insights.com https://cloudflareinsights.com https://translate.googleapis.com https://translate-pa.googleapis.com https://translate.google.com",
              "frame-src 'self' giscus.app translate.google.com",
              "media-src 'self' https://ekldxpd3mp5h44qj.public.blob.vercel-storage.com",
              "worker-src 'self' blob:",
            ].join('; '),
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images-na.ssl-images-amazon.com',
      },
      {
        protocol: 'https',
        hostname: '*.ssl-images-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'a.ltrbxd.com',
      },
      {
        protocol: 'https',
        hostname: '*.ltrbxd.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    qualities: [65, 75, 85],
    minimumCacheTTL: 86400,
    deviceSizes: [360, 420, 560, 640, 750, 828, 1080, 1200, 1536, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  // The kit's `import` condition points at its TypeScript source, so Next has
  // to compile it like first-party code.
  transpilePackages: ['@gr8monk3ys/next-kit'],
  experimental: {
    // optimizeCss removed: it needs the `critters`/`beasties` package (not a
    // dependency here), so Next silently ignores it — a no-op that implied
    // critical-CSS inlining that never happened.
    scrollRestoration: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Performance optimizations
  webpack: (config, { dev, isServer }) => {
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /@opentelemetry\/instrumentation/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
    ];

    // Only run in production client-side builds
    if (!dev && !isServer) {
      // Enable tree shaking and purging
      config.optimization.usedExports = true;
      
      // Split chunks optimization
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 20000,
      };
    }
    
    return config;
  },
};

const withMDX = createMDX({
  options: {
    // Use string paths instead of function imports for Turbopack compatibility
    remarkPlugins: ['remark-gfm'],
    rehypePlugins: ['rehype-prism-plus'],
  },
});

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // Suppress source map upload logs in CI
  silent: true,
  // Upload source maps only if Sentry is configured
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Only upload source maps in production builds with auth token
  authToken: process.env.SENTRY_AUTH_TOKEN,
  // Disable source map upload if not configured
  disableServerWebpackPlugin: !process.env.SENTRY_AUTH_TOKEN,
  disableClientWebpackPlugin: !process.env.SENTRY_AUTH_TOKEN,
  // Hide source maps from clients
  hideSourceMaps: true,
  // Tree-shake Sentry debug logging in production
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
};

// Wrap with Sentry if DSN is configured, otherwise just use MDX
const configWithMDX = withMDX(nextConfig);
export default process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(configWithMDX, sentryWebpackPluginOptions)
  : configWithMDX;
