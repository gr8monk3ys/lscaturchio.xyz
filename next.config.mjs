/** @type {import('next').NextConfig} */
import createMDX from '@next/mdx';
import remarkGfm from 'remark-gfm';
import rehypePrettyCode from 'rehype-pretty-code';

const nextConfig = {
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  images: {
    domains: ['images.unsplash.com'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
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
  // Performance optimizations and Node.js polyfills
  webpack: (config, { dev, isServer }) => {
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
    
    // Handle Node.js modules in client components
    if (!isServer) {
      // For Node.js native modules that can't be used in the browser
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false, 
        'fs/promises': false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        util: false,
        assert: false,
        process: false,
        buffer: false,
        querystring: false,
      };
    }
    
    return config;
  },
};

// Syntax highlighting configuration
const prettyCodeOptions = {
  // Use Shiki theme
  theme: {
    light: 'github-light',
    dark: 'github-dark',
  },
  keepBackground: false, // Remove background to support dark mode
  tokensMap: {
    // Map tokens to specific html attributes
    // to provide more metadata for styling
    fn: 'function',
    objKey: 'property',
  },
  filterMetaString: (string) => string,
  onVisitLine(node) {
    // Prevent lines from collapsing in `display: grid` mode
    if (node.children.length === 0) {
      node.children = [{ type: 'text', value: ' ' }];
    }
  },
  onVisitHighlightedLine(node) {
    // Add line highlighting class
    node.properties.className.push('line--highlighted');
  },
  onVisitHighlightedWord(node) {
    // Add word highlighting class
    node.properties.className = ['word--highlighted'];
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]],
    providerImportSource: "@mdx-js/react",
    mdxOptions: {
      development: process.env.NODE_ENV === 'development',
      jsx: true,
      jsxImportSource: 'react',
    },
  },
});

export default withMDX(nextConfig);
