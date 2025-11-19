import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/with-rate-limit';
import { RATE_LIMITS } from '@/lib/rate-limit';

const GITHUB_USERNAME = 'lscaturchio'; // Change to your GitHub username

const handleGet = async (request: NextRequest) => {
  try {
    // Fetch GitHub contribution data using GitHub GraphQL API
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
      // Return mock data if no token provided
      return NextResponse.json({
        totalContributions: 847,
        weeks: generateMockData(),
      });
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

    const data = await response.json();

    if (data.errors) {
      throw new Error('GitHub API error');
    }

    const calendar = data.data.user.contributionsCollection.contributionCalendar;

    return NextResponse.json({
      totalContributions: calendar.totalContributions,
      weeks: calendar.weeks,
    });
  } catch (error) {
    console.error('GitHub contributions error:', error);

    // Return mock data on error
    return NextResponse.json({
      totalContributions: 847,
      weeks: generateMockData(),
    });
  }
}

// Generate mock contribution data for the last year
function generateMockData() {
  const weeks = [];
  const today = new Date();

  for (let weekIndex = 0; weekIndex < 52; weekIndex++) {
    const days = [];

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const date = new Date(today);
      date.setDate(date.getDate() - ((51 - weekIndex) * 7 + (6 - dayIndex)));

      const contributionCount = Math.floor(Math.random() * 15);
      let color = '#ebedf0';

      if (contributionCount > 10) color = '#216e39';
      else if (contributionCount > 7) color = '#30a14e';
      else if (contributionCount > 4) color = '#40c463';
      else if (contributionCount > 0) color = '#9be9a8';

      days.push({
        contributionCount,
        date: date.toISOString().split('T')[0],
        color,
      });
    }

    weeks.push({ contributionDays: days });
  }

  return weeks;
}

// Export with rate limiting (30 requests per minute)
export const GET = withRateLimit(handleGet, RATE_LIMITS.STANDARD);
