/**
 * WakaTime API integration utilities
 * Fetches coding stats from WakaTime API
 */

import { logError, logInfo } from './logger';

export interface WakaTimeLanguage {
  name: string;
  percent: number;
  total_seconds: number;
  text: string;
  hours: number;
  minutes: number;
}

export interface WakaTimeEditor {
  name: string;
  percent: number;
  total_seconds: number;
  text: string;
}

export interface WakaTimeProject {
  name: string;
  percent: number;
  total_seconds: number;
  text: string;
}

export interface WakaTimeStats {
  total_seconds: number;
  human_readable_total: string;
  daily_average: number;
  human_readable_daily_average: string;
  languages: WakaTimeLanguage[];
  editors: WakaTimeEditor[];
  projects: WakaTimeProject[];
  range: {
    start: string;
    end: string;
    text: string;
  };
  is_up_to_date: boolean;
}

interface WakaTimeAPIResponse {
  data: {
    total_seconds: number;
    human_readable_total: string;
    daily_average: number;
    human_readable_daily_average: string;
    languages: Array<{
      name: string;
      percent: number;
      total_seconds: number;
      text: string;
      hours: number;
      minutes: number;
    }>;
    editors: Array<{
      name: string;
      percent: number;
      total_seconds: number;
      text: string;
    }>;
    projects: Array<{
      name: string;
      percent: number;
      total_seconds: number;
      text: string;
    }>;
    range: {
      start: string;
      end: string;
      text: string;
    };
    is_up_to_date: boolean;
  };
}

/**
 * Check if WakaTime API is configured
 */
export function isWakaTimeConfigured(): boolean {
  return !!process.env.WAKATIME_API_KEY;
}

/**
 * Fetch coding stats from WakaTime API
 * @param range - Time range: 'last_7_days', 'last_30_days', 'last_6_months', 'last_year', 'all_time'
 */
export async function getWakaTimeStats(
  range: 'last_7_days' | 'last_30_days' | 'last_6_months' | 'last_year' | 'all_time' = 'last_7_days'
): Promise<WakaTimeStats | null> {
  const apiKey = process.env.WAKATIME_API_KEY;

  if (!apiKey) {
    logInfo('WakaTime API key not configured', { component: 'wakatime' });
    return null;
  }

  try {
    // WakaTime expects the API key to be base64 encoded
    // The user should provide the already base64-encoded key
    const response = await fetch(
      `https://wakatime.com/api/v1/users/current/stats/${range}`,
      {
        headers: {
          Authorization: `Basic ${apiKey}`,
        },
        next: {
          // Cache for 1 hour - stats don't change frequently
          revalidate: 3600,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        logError('WakaTime API authentication failed', new Error('Unauthorized'), {
          component: 'wakatime',
          action: 'getStats',
        });
      } else {
        logError('WakaTime API request failed', new Error(`Status: ${response.status}`), {
          component: 'wakatime',
          action: 'getStats',
          status: response.status,
        });
      }
      return null;
    }

    const data: WakaTimeAPIResponse = await response.json();

    return {
      total_seconds: data.data.total_seconds,
      human_readable_total: data.data.human_readable_total,
      daily_average: data.data.daily_average,
      human_readable_daily_average: data.data.human_readable_daily_average,
      languages: data.data.languages.slice(0, 10).map((lang) => ({
        name: lang.name,
        percent: lang.percent,
        total_seconds: lang.total_seconds,
        text: lang.text,
        hours: lang.hours,
        minutes: lang.minutes,
      })),
      editors: data.data.editors.slice(0, 5).map((editor) => ({
        name: editor.name,
        percent: editor.percent,
        total_seconds: editor.total_seconds,
        text: editor.text,
      })),
      projects: data.data.projects.slice(0, 5).map((project) => ({
        name: project.name,
        percent: project.percent,
        total_seconds: project.total_seconds,
        text: project.text,
      })),
      range: data.data.range,
      is_up_to_date: data.data.is_up_to_date,
    };
  } catch (error) {
    logError('Failed to fetch WakaTime stats', error, {
      component: 'wakatime',
      action: 'getStats',
    });
    return null;
  }
}

/**
 * Format seconds to human readable string
 */
export function formatCodingTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours === 0) {
    return `${minutes}m`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

/**
 * Get color for language (commonly used languages)
 */
export function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f7df1e',
    Python: '#3776ab',
    Rust: '#dea584',
    Go: '#00add8',
    Java: '#b07219',
    'C++': '#f34b7d',
    C: '#555555',
    'C#': '#178600',
    Ruby: '#701516',
    PHP: '#4F5D95',
    Swift: '#ffac45',
    Kotlin: '#A97BFF',
    Dart: '#00B4AB',
    HTML: '#e34c26',
    CSS: '#563d7c',
    SCSS: '#c6538c',
    Vue: '#4fc08d',
    Svelte: '#ff3e00',
    JSON: '#292929',
    YAML: '#cb171e',
    Markdown: '#083fa1',
    SQL: '#e38c00',
    Shell: '#89e051',
    Bash: '#89e051',
    Docker: '#384d54',
    GraphQL: '#e10098',
  };

  return colors[language] || '#6e7681';
}

/**
 * Generate mock data for development/fallback
 */
export function getMockWakaTimeStats(): WakaTimeStats {
  return {
    total_seconds: 117000, // ~32.5 hours
    human_readable_total: '32 hrs 30 mins',
    daily_average: 16714,
    human_readable_daily_average: '4 hrs 38 mins',
    languages: [
      { name: 'TypeScript', percent: 65.5, total_seconds: 76635, text: '21 hrs 17 mins', hours: 21, minutes: 17 },
      { name: 'Python', percent: 18.2, total_seconds: 21294, text: '5 hrs 54 mins', hours: 5, minutes: 54 },
      { name: 'JavaScript', percent: 8.3, total_seconds: 9711, text: '2 hrs 41 mins', hours: 2, minutes: 41 },
      { name: 'CSS', percent: 4.1, total_seconds: 4797, text: '1 hr 19 mins', hours: 1, minutes: 19 },
      { name: 'JSON', percent: 2.4, total_seconds: 2808, text: '46 mins', hours: 0, minutes: 46 },
      { name: 'Markdown', percent: 1.5, total_seconds: 1755, text: '29 mins', hours: 0, minutes: 29 },
    ],
    editors: [
      { name: 'VS Code', percent: 85.0, total_seconds: 99450, text: '27 hrs 37 mins' },
      { name: 'Cursor', percent: 15.0, total_seconds: 17550, text: '4 hrs 52 mins' },
    ],
    projects: [
      { name: 'lscaturchio.xyz', percent: 45.0, total_seconds: 52650, text: '14 hrs 37 mins' },
      { name: 'ai-research', percent: 30.0, total_seconds: 35100, text: '9 hrs 45 mins' },
      { name: 'side-project', percent: 25.0, total_seconds: 29250, text: '8 hrs 7 mins' },
    ],
    range: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString(),
      text: 'Last 7 Days',
    },
    is_up_to_date: true,
  };
}
