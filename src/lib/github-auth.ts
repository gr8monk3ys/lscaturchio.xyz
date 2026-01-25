/**
 * GitHub OAuth utilities for Guestbook authentication
 *
 * This module provides functions to handle GitHub OAuth flow:
 * 1. Initiate OAuth by redirecting to GitHub
 * 2. Exchange authorization code for access token
 * 3. Fetch user profile from GitHub API
 */

const GITHUB_OAUTH_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_USER_API = 'https://api.github.com/user';

export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
}

/**
 * Get the GitHub OAuth client ID from environment
 */
export function getGitHubClientId(): string | undefined {
  return process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
}

/**
 * Get the GitHub OAuth client secret from environment (server-side only)
 */
function getGitHubClientSecret(): string | undefined {
  return process.env.GITHUB_CLIENT_SECRET;
}

/**
 * Get the OAuth callback URL based on environment
 */
export function getCallbackUrl(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return `${siteUrl}/api/auth/github/callback`;
}

/**
 * Generate the GitHub OAuth authorization URL
 * @param state - CSRF protection state token
 * @returns The full GitHub OAuth URL to redirect the user to
 */
export function getGitHubAuthUrl(state: string): string {
  const clientId = getGitHubClientId();
  if (!clientId) {
    throw new Error('GitHub OAuth client ID not configured');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getCallbackUrl(),
    scope: 'read:user user:email',
    state,
  });

  return `${GITHUB_OAUTH_URL}?${params.toString()}`;
}

/**
 * Exchange an authorization code for an access token
 * @param code - The authorization code from GitHub callback
 * @returns The access token or null if exchange failed
 */
export async function exchangeCodeForToken(code: string): Promise<string | null> {
  const clientId = getGitHubClientId();
  const clientSecret = getGitHubClientSecret();

  if (!clientId || !clientSecret) {
    throw new Error('GitHub OAuth credentials not configured');
  }

  try {
    const response = await fetch(GITHUB_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: getCallbackUrl(),
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.access_token || null;
  } catch {
    return null;
  }
}

/**
 * Fetch the GitHub user profile using an access token
 * @param accessToken - The GitHub OAuth access token
 * @returns The GitHub user profile or null if fetch failed
 */
export async function fetchGitHubUser(accessToken: string): Promise<GitHubUser | null> {
  try {
    const response = await fetch(GITHUB_USER_API, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'lscaturchio.xyz-guestbook',
      },
    });

    if (!response.ok) {
      return null;
    }

    const user = await response.json();
    return {
      id: user.id,
      login: user.login,
      name: user.name,
      email: user.email,
      avatar_url: user.avatar_url,
    };
  } catch {
    return null;
  }
}

/**
 * Validate a GitHub access token by attempting to fetch the user profile
 * @param accessToken - The GitHub OAuth access token to validate
 * @returns The GitHub user if valid, null otherwise
 */
export async function validateGitHubToken(accessToken: string): Promise<GitHubUser | null> {
  return fetchGitHubUser(accessToken);
}
