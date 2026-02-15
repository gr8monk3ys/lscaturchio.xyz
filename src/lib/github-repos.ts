import type { GitHubRepo, GitHubTopicsResponse } from '@/types/github'
import type { PortfolioRepo } from '@/types/github'
import { logError } from '@/lib/logger'

const GITHUB_USERNAME = 'gr8monk3ys'

function normalizeSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-')
}

function getProjectLogoPath(slug: string): string {
  return `/images/projects/logos/${slug}.svg`
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  }

  const token = process.env.GITHUB_TOKEN
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

/**
 * Fetch GitHub repos and transform them into PortfolioRepo format.
 * Shared between the API route and server-side callers (e.g. page.tsx).
 *
 * Uses Next.js fetch caching with a 1-hour revalidation window when called
 * from a Server Component, so repeated renders don't hit GitHub again.
 */
export async function getGithubPortfolioRepos(): Promise<PortfolioRepo[]> {
  try {
    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`,
      {
        headers: getAuthHeaders(),
        next: { revalidate: 3600 },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch repositories: ${response.status}`)
    }

    const allRepos: GitHubRepo[] = await response.json()
    const repos = allRepos.filter((repo) => !repo.fork)

    // Fetch all topics in parallel (single batch)
    const topicsResults = await Promise.allSettled(
      repos.map(async (repo) => {
        const topicsResponse = await fetch(
          `https://api.github.com/repos/${GITHUB_USERNAME}/${repo.name}/topics`,
          {
            headers: {
              ...getAuthHeaders(),
              Accept: 'application/vnd.github.mercy-preview+json',
            },
            next: { revalidate: 3600 },
          }
        )

        if (!topicsResponse.ok) {
          return { name: repo.name, topics: [] as string[] }
        }

        const data: GitHubTopicsResponse = await topicsResponse.json()
        return { name: repo.name, topics: data.names || [] }
      })
    )

    const topicsMap = new Map<string, string[]>()
    for (const result of topicsResults) {
      if (result.status === 'fulfilled') {
        topicsMap.set(result.value.name, result.value.topics)
      }
    }

    const portfolioRepos: PortfolioRepo[] = repos.map((repo) => {
      const topics = topicsMap.get(repo.name) || []
      return {
        title: repo.name,
        description: repo.description || 'No description available',
        href: repo.html_url,
        slug: normalizeSlug(repo.name),
        stack: [repo.language, ...topics].filter(Boolean) as string[],
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        lastUpdated: new Date(repo.updated_at).toLocaleDateString(),
        logo: getProjectLogoPath(normalizeSlug(repo.name)),
      }
    })

    return portfolioRepos.sort((a, b) => b.stars - a.stars)
  } catch (error) {
    logError('GitHub repos: fetch failed', error, {
      component: 'github-repos',
      action: 'getGithubPortfolioRepos',
    })
    return []
  }
}
