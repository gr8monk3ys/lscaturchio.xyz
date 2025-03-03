const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Base URL of the website
const BASE_URL = 'https://lscaturchio.xyz';

// Function to get the current date in YYYY-MM-DD format
function getCurrentDate() {
  const date = new Date();
  return date.toISOString().split('T')[0];
}

// Function to generate sitemap XML
async function generateSitemap() {
  // Get all page routes from the app directory
  const pages = glob.sync('src/app/**/page.tsx', {
    ignore: ['src/app/api/**', '**/not-found.tsx', '**/error.tsx', '**/loading.tsx']
  });

  // Transform file paths to URL paths
  const routes = pages.map(page => {
    // Remove src/app/ and page.tsx to get the route
    let route = page.replace('src/app/', '').replace('/page.tsx', '');
    
    // Handle index/home page
    if (route === '') {
      return {
        url: '/',
        priority: 1.0,
        changefreq: 'weekly'
      };
    }
    
    // Handle dynamic routes
    if (route.includes('[') && route.includes(']')) {
      // For dynamic routes, we'll need to handle them specially
      // This is a simplified approach - in a real app, you might need to fetch actual data
      return null;
    }
    
    // Determine priority and change frequency based on route
    let priority = 0.7;
    let changefreq = 'monthly';
    
    if (route === 'blog') {
      priority = 0.9;
      changefreq = 'weekly';
    } else if (['about', 'projects', 'services'].includes(route)) {
      priority = 0.8;
      changefreq = 'monthly';
    } else if (['privacy-policy', 'terms-of-service'].includes(route)) {
      priority = 0.3;
      changefreq = 'yearly';
    }
    
    return {
      url: `/${route}`,
      priority,
      changefreq
    };
  }).filter(Boolean); // Remove null entries (dynamic routes)
  
  // Get all blog posts
  const blogPosts = glob.sync('src/app/blog/*/page.tsx', {
    ignore: ['src/app/blog/page.tsx']
  });
  
  // Add blog posts to routes
  blogPosts.forEach(post => {
    const blogSlug = post.replace('src/app/blog/', '').replace('/page.tsx', '');
    routes.push({
      url: `/blog/${blogSlug}`,
      priority: 0.7,
      changefreq: 'yearly'
    });
  });
  
  // Generate XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(route => `  <url>
    <loc>${BASE_URL}${route.url}</loc>
    <lastmod>${getCurrentDate()}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  // Write sitemap to public directory
  fs.writeFileSync(path.join(process.cwd(), 'public', 'sitemap.xml'), sitemap);
  console.log('Sitemap generated successfully!');
}

// Run the function
generateSitemap().catch(console.error);
