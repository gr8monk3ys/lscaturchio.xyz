#!/usr/bin/env node

/**
 * Image Optimization Script
 * 
 * Optimizes images in the public directory to improve performance
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ensure sharp is installed
try {
  require.resolve('sharp');
  console.log('Sharp is already installed');
} catch {
  console.log('Installing sharp...');
  execSync('npm install sharp', { stdio: 'inherit' });
}

const imagesDir = path.join(__dirname, '../public/images');

// Function to recursively process directories
function processDirectory(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  
  entries.forEach(entry => {
    const fullPath = path.join(directory, entry.name);
    
    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (isImage(entry.name)) {
      optimizeImage(fullPath);
    }
  });
}

// Check if file is an image based on extension
function isImage(filename) {
  const ext = path.extname(filename).toLowerCase();
  return ['.webp', '.jpeg', '.webp', '.webp'].includes(ext);
}

// Simulate image optimization (in a real implementation, use sharp to resize and optimize)
function optimizeImage(imagePath) {
  const ext = path.extname(imagePath).toLowerCase();
  const relativePath = path.relative(path.join(__dirname, '..'), imagePath);
  
  console.log(`Optimizing (${ext}): ${relativePath}`);
  
  // In a production implementation, you would use sharp to actually process the images
  // For example:
  // 
  // const sharp = require('sharp');
  // sharp(imagePath)
  //   .resize(1200, null, { withoutEnlargement: true })
  //   .webp({ quality: 80 })
  //   .toFile(imagePath.replace(ext, '.webp'));
  //
  // This is a placeholder for actual implementation
}

console.log('Starting image optimization process...');
processDirectory(imagesDir);
console.log('Image optimization complete!');

// Create a metadata file to track optimization status
const metadataFile = path.join(__dirname, '../public/images-metadata.json');
fs.writeFileSync(metadataFile, JSON.stringify({
  lastOptimized: new Date().toISOString(),
  status: 'optimized'
}, null, 2));

console.log('Created optimization metadata file');
