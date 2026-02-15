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
            key: 'X-XSS-Protection',
            value: '1; mode=block',
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
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' pagead2.googlesyndication.com googleads.g.doubleclick.net www.googletagservices.com tpc.googlesyndication.com js.sentry-cdn.com giscus.app",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' https: wss:",
              "frame-src 'self' giscus.app googleads.g.doubleclick.net",
              "media-src 'self'",
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
    minimumCacheTTL: 86400,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  experimental: {
    optimizeCss: true,
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
