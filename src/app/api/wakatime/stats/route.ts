import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit, RATE_LIMITS } from '@/lib/with-rate-limit';
import { getWakaTimeStats, getMockWakaTimeStats, isWakaTimeConfigured } from '@/lib/wakatime';
import { logError, logInfo } from '@/lib/logger';

const handleGet = async (request: NextRequest) => {
  try {
    // Check if WakaTime is configured
    if (!isWakaTimeConfigured()) {
      logInfo('WakaTime not configured, returning mock data', {
        component: 'wakatime-api',
        action: 'GET',
      });

      // Return mock data when not configured
      return NextResponse.json(
        {
          data: getMockWakaTimeStats(),
          isMock: true,
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
          },
        }
      );
    }

    // Get range from query params, default to last_7_days
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') as
      | 'last_7_days'
      | 'last_30_days'
      | 'last_6_months'
      | 'last_year'
      | 'all_time'
      | null;

    const validRanges = ['last_7_days', 'last_30_days', 'last_6_months', 'last_year', 'all_time'];
    const selectedRange = range && validRanges.includes(range) ? range : 'last_7_days';

    const stats = await getWakaTimeStats(selectedRange);

    if (!stats) {
      // Return mock data if API call fails
      logInfo('WakaTime API failed, returning mock data', {
        component: 'wakatime-api',
        action: 'GET',
      });

      return NextResponse.json(
        {
          data: getMockWakaTimeStats(),
          isMock: true,
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
          },
        }
      );
    }

    return NextResponse.json(
      {
        data: stats,
        isMock: false,
      },
      {
        headers: {
          // Cache for 1 hour, allow stale for 2 hours while revalidating
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      }
    );
  } catch (error) {
    logError('WakaTime API error', error, {
      component: 'wakatime-api',
      action: 'GET',
    });

    // Return mock data on error for graceful degradation
    return NextResponse.json(
      {
        data: getMockWakaTimeStats(),
        isMock: true,
        error: 'Failed to fetch WakaTime stats',
      },
      {
        status: 200, // Still return 200 with mock data
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  }
};

// Export with rate limiting (30 requests per minute)
export const GET = withRateLimit(handleGet, RATE_LIMITS.STANDARD);
