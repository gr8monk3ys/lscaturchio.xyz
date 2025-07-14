// Rule: TypeScript Usage - Use TypeScript for all code
// Script to add related posts functionality to all blog pages
const fs = require('fs');
const path = require('path');

// Blog directory path
const blogDir = path.resolve(process.cwd(), 'src/app/blog');

// Get all blog directories
const blogDirs = fs.readdirSync(blogDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

// Counter for updated files
let updatedCount = 0;

// Process each blog directory
for (const dir of blogDirs) {
  const pagePath = path.join(blogDir, dir, 'page.tsx');
  
  // Skip if page doesn't exist
  if (!fs.existsSync(pagePath)) continue;
  
  // Read the page content
  let content = fs.readFileSync(pagePath, 'utf8');
  
  // Skip if already updated with useRelatedPosts
  if (content.includes('useRelatedPosts')) {
    console.log(`✓ ${dir} already has related posts`);
    continue;
  }
  
  // Add the import
  content = content.replace(
    /import { BlogLayout } from "@\/components\/blog\/BlogLayout";\s*import { MDXProvider } from "@\/components\/mdx\/MDXProvider";/,
    'import { BlogLayout } from "@/components/blog/BlogLayout";\nimport { MDXProvider } from "@/components/mdx/MDXProvider";\nimport { useRelatedPosts } from "@/components/blog/useRelatedPosts";'
  );
  
  // Update the Page component
  content = content.replace(
    /export default function Page\(\): JSX\.Element {\s*return \(\s*<BlogLayout meta={meta}>/,
    `export default function Page(): JSX.Element {\n  const slug = "${dir}";\n  const { posts: relatedPosts } = useRelatedPosts(slug, meta.tags);\n\n  return (\n    <BlogLayout \n      meta={meta} \n      relatedPosts={relatedPosts}\n      slug={slug}>`
  );
  
  // Save the updated content
  fs.writeFileSync(pagePath, content);
  updatedCount++;
  
  console.log(`✓ Added related posts to ${dir}`);
}

console.log(`\nUpdated ${updatedCount} blog pages with related posts functionality`);
