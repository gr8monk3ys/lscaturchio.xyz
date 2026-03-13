import type { GitHubRepo } from '@/types/github'
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
    Accept: 'application/vnd.github.mercy-preview+json',
  }

  const token = process.env.GITHUB_TOKEN
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

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

    const portfolioRepos: PortfolioRepo[] = repos.map((repo) => {
      const topics = repo.topics ?? []
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
