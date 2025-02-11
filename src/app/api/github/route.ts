import { NextResponse } from 'next/server';

async function getGithubRepos() {
  const response = await fetch('https://api.github.com/users/gr8monk3ys/repos', {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch repositories');
  }
  
  const repos = await response.json();
  // Filter out forked repositories
  return repos.filter((repo: any) => !repo.fork);
}

async function getRepoTopics(repoName: string) {
  const response = await fetch(`https://api.github.com/repos/gr8monk3ys/${repoName}/topics`, {
    headers: {
      'Accept': 'application/vnd.github.mercy-preview+json',
    },
  });
  
  if (!response.ok) {
    return []; // Return empty array if topics can't be fetched
  }
  
  const data = await response.json();
  return data.names || [];
}

export async function GET() {
  try {
    const repos = await getGithubRepos();
    
    // Fetch topics for all repositories in parallel
    const reposWithTopics = await Promise.all(
      repos.map(async (repo: any) => {
        const topics = await getRepoTopics(repo.name);
        return {
          title: repo.name,
          description: repo.description || 'No description available',
          href: repo.html_url,
          slug: repo.name.toLowerCase().replace(/\s+/g, '-'),
          stack: [repo.language, ...topics].filter(Boolean), // Combine language with topics
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          lastUpdated: new Date(repo.updated_at).toLocaleDateString(),
        };
      })
    );
    
    // Sort repositories by number of stars (descending)
    const sortedRepos = reposWithTopics.sort((a, b) => b.stars - a.stars);
    
    return NextResponse.json(sortedRepos);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch repositories' },
      { status: 500 }
    );
  }
}
