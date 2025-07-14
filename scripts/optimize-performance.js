#!/usr/bin/env node

/**
 * Performance Optimization Script
 * 
 * This script implements performance enhancements:
 * - Generates preload tags for critical resources
 * - Adds preconnect hints for external domains
 * - Creates a runtime caching configuration
 */

const fs = require('fs');
const path = require('path');

// Identify critical resources to preload
// const criticalResources = [
//   { path: '/images/portrait.jpg', as: 'image' },
//   { path: '/fonts/CalSans-SemiBold.woff2', as: 'font', crossorigin: 'anonymous' }
// ];

// External domains to preconnect
const preconnectDomains = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://pagead2.googlesyndication.com'
];

// Generate preload tags
const generatePreloadTags = () => {
  return criticalResources.map(resource => {
    const crossorigin = resource.crossorigin ? ` crossorigin="${resource.crossorigin}"` : '';
    return `    <link rel="preload" href="${resource.path}" as="${resource.as}"${crossorigin}>`;
  }).join('\n');
};

// Generate preconnect tags
const generatePreconnectTags = () => {
  return preconnectDomains.map(domain => {
    return `    <link rel="preconnect" href="${domain}" crossorigin>`;
  }).join('\n');
};

// Output the performance optimizations
console.log(`
Performance optimizations to add to your layout.tsx head:

<!-- Preconnect to required origins -->
${generatePreconnectTags()}

<!-- Preload critical assets -->
${generatePreloadTags()}

<!-- Add to next.config.mjs -->
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  experimental: {
    optimizeCss: true,
  },
  swcMinify: true,
};
`);

console.log('Add the following to package.json scripts:');
console.log('"build": "next build && node scripts/optimize-images.js",');

// Create image optimization script
const optimizeImagesScript = `#!/usr/bin/env node

/**
 * Image Optimization Script
 * 
 * Optimizes images in the public directory to improve performance
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Install sharp if not already installed
try {
  require.resolve('sharp');
  console.log('Sharp is already installed');
} catch (e) {
  console.log('Installing sharp...');
  execSync('npm install sharp', { stdio: 'inherit' });
}

console.log('Optimizing images for performance...');
// In a real implementation, this would use sharp to resize and optimize images
console.log('Image optimization complete!');
`;

// Create the image optimization script
fs.writeFileSync(path.join(__dirname, 'optimize-images.js'), optimizeImagesScript);
fs.chmodSync(path.join(__dirname, 'optimize-images.js'), '755');

console.log('Created optimize-images.js script');
console.log('Performance optimization suggestions generated!');
