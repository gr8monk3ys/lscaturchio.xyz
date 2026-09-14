import { logError } from '@/lib/logger'

const GITHUB_USERNAME = 'gr8monk3ys'
const UNAVAILABLE_MESSAGE = 'GitHub contribution data is temporarily unavailable.'

export interface ContributionDay {
  contributionCount: number
  date: string
  /** GitHub's own green. Kept because the API sends it; the site does not paint it. */
  color: string
}

export interface ContributionWeek {
  contributionDays: ContributionDay[]
}

export interface ContributionCalendar {
  totalContributions: number
  weeks: ContributionWeek[]
  degraded: boolean
  message?: string
}

/**
 * A calendar that says so when it has nothing.
 *
 * `degraded` is not an error channel — it is a renderable state. Every caller
 * gets a calendar back, and a caller that cannot tell "no contributions" from
 * "no answer" would have to invent one of them.
 */
function degradedCalendar(): ContributionCalendar {
  return {
    totalContributions: 0,
    weeks: [],
    degraded: true,
    message: UNAVAILABLE_MESSAGE,
  }
}

/**
 * The contribution calendar, fetched once for both callers.
 *
 * This lived inside `app/api/github/contributions/route.ts`, which meant the
 * only way to render the heatmap was for the browser to call the site back
 * after paint. `/stats` therefore shipped a skeleton in its HTML and filled it
 * in later — or never, with JS off. The implementation moved here so a Server
 * Component can await it directly and the route can stay a thin wrapper over
 * the same code.
 *
 * `revalidate: 1800` matches the `s-maxage` the route already advertised, so
 * moving the call did not quietly change how often GitHub is asked.
 */
export async function getGithubContributions(): Promise<ContributionCalendar> {
  const token = process.env.GITHUB_TOKEN

  if (!token) {
    return degradedCalendar()
  }

  const query = `
    query {
      user(login: "${GITHUB_USERNAME}") {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
                color
              }
            }
          }
        }
      }
    }
  `

  try {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
      next: { revalidate: 1800 },
    })

    if (!response.ok) {
      throw new Error(`GitHub API request failed with status ${response.status}`)
    }

    const data = await response.json()

    if (data.errors || !data.data?.user?.contributionsCollection?.contributionCalendar) {
      throw new Error('GitHub API returned an invalid contribution payload')
    }

    const calendar = data.data.user.contributionsCollection.contributionCalendar as {
      totalContributions: number
      weeks: ContributionWeek[]
    }

    return {
      totalContributions: calendar.totalContributions,
      weeks: calendar.weeks,
      degraded: false,
    }
  } catch (error) {
    logError('GitHub Contributions: API error', error, {
      component: 'github-contributions',
      action: 'GET',
    })
    return degradedCalendar()
  }
}
