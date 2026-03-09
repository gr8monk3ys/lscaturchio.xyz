import { NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/with-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';
import { logError } from '@/lib/logger';

const GITHUB_USERNAME = 'gr8monk3ys';
const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=300, s-maxage=1800, stale-while-revalidate=86400',
};

interface ContributionDay {
  contributionCount: number;
  date: string;
  color: string;
}

interface ContributionWeek {
  contributionDays: ContributionDay[];
}

interface GitHubContributionsResponse {
  totalContributions: number;
  weeks: ContributionWeek[];
  degraded: boolean;
  message?: string;
}

function degradedResponse(message: string): NextResponse {
  const payload: GitHubContributionsResponse = {
    totalContributions: 0,
    weeks: [],
    degraded: true,
    message,
  };

  return NextResponse.json(payload, {
    status: 200,
    headers: CACHE_HEADERS,
  });
}

const handleGet = async () => {
  try {
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
      return degradedResponse('GitHub contribution data is temporarily unavailable.');
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
    `;

    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`GitHub API request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (data.errors || !data.data?.user?.contributionsCollection?.contributionCalendar) {
      throw new Error('GitHub API returned an invalid contribution payload');
    }

    const calendar = data.data.user.contributionsCollection.contributionCalendar as {
      totalContributions: number;
      weeks: ContributionWeek[];
    };

    const payload: GitHubContributionsResponse = {
      totalContributions: calendar.totalContributions,
      weeks: calendar.weeks,
      degraded: false,
    };

    return NextResponse.json(payload, {
      status: 200,
      headers: CACHE_HEADERS,
    });
  } catch (error) {
    logError('GitHub Contributions: API error', error, { component: 'github-contributions', action: 'GET' });
    return degradedResponse('GitHub contribution data is temporarily unavailable.');
  }
}

// Export with rate limiting (30 requests per minute)
export const GET = withRateLimit(handleGet, RATE_LIMITS.STANDARD);
