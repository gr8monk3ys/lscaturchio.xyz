const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to run a command and log the output
function runCommand(command) {
  console.log(`Running: ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error);
    process.exit(1);
  }
}

// Install required dependencies
console.log('Installing SEO optimization dependencies...');
runCommand('npm install glob --save');

// Check if next.config.mjs exists and update it for SEO optimization
const nextConfigPath = path.join(process.cwd(), 'next.config.mjs');
if (fs.existsSync(nextConfigPath)) {
  console.log('Checking next.config.mjs for SEO optimization...');
  
  const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
  
  // Check if config already has SEO optimization
  if (!nextConfig.includes('poweredByHeader') && !nextConfig.includes('compress')) {
    console.log('Creating a backup of the current next.config.mjs...');
    fs.copyFileSync(nextConfigPath, `${nextConfigPath}.backup`);
    
    // Create a new config file with SEO optimizations
    const newConfig = `/** @type {import('next').NextConfig} */
import createMDX from '@next/mdx';
import remarkGfm from 'remark-gfm';
import rehypePrism from '@mapbox/rehype-prism';

const nextConfig = {
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  images: {
    domains: ['images.unsplash.com'],
  },
  poweredByHeader: false,
  compress: true,
  swcMinify: true,
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypePrism],
  },
});

export default withMDX(nextConfig);
`;
    
    fs.writeFileSync(nextConfigPath, newConfig);
    console.log('Successfully updated next.config.mjs with SEO optimizations');
  } else {
    console.log('next.config.mjs already has SEO optimization configuration');
  }
} else {
  console.warn('next.config.mjs not found');
}

// Create a script to generate the sitemap
console.log('Setting up sitemap generation...');

// Add script to package.json if not already present
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Check if scripts already exist
  let modified = false;
  if (!packageJson.scripts.hasOwnProperty('generate-sitemap')) {
    packageJson.scripts['generate-sitemap'] = 'node scripts/generate-sitemap.js';
    modified = true;
  }
  
  if (!packageJson.scripts.hasOwnProperty('postbuild')) {
    packageJson.scripts['postbuild'] = 'npm run generate-sitemap';
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('Updated package.json with sitemap generation scripts');
  } else {
    console.log('Sitemap generation scripts already exist in package.json');
  }
} else {
  console.warn('package.json not found');
}

console.log('\nSEO optimization setup complete!');
console.log('\nNext steps:');
console.log('1. Run "npm run build" to generate the sitemap');
console.log('2. Submit your sitemap to Google Search Console: https://search.google.com/search-console');
console.log('3. Consider adding Google Analytics or other analytics tools');
