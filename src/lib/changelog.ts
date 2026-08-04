import { logError } from './logger';

export interface ShippedPr {
  number: number;
  title: string;
  mergedAt: string; // YYYY-MM-DD
  url: string;
  /** Conventional-commit type parsed from the title, e.g. `feat`, `fix`. */
  kind: string;
}

const REPO = 'gr8monk3ys/lscaturchio.xyz';

interface GitHubPull {
  number: number;
  title: string;
  merged_at: string | null;
  html_url: string;
}

/** `feat(blog): declare series` → kind "feat", subject "declare series". */
function parseTitle(title: string): { kind: string; subject: string } {
  const match = title.match(/^([a-z]+)(?:\([^)]*\))?!?:\s*(.+)$/);
  if (!match) return { kind: 'change', subject: title };
  return { kind: match[1], subject: match[2] };
}

/**
 * Merged pull requests, newest first, fetched live from the public GitHub API.
 *
 * This is what keeps the changelog from rotting: every change to this site
 * lands as a PR, so the shipped feed derives from the repo instead of a
 * hand-maintained list. No token needed on a public repo, and the daily ISR
 * window keeps us far under the unauthenticated rate limit. Returns [] on any
 * failure so the page degrades to the hand-written milestones.
 */
export async function getShippedPrs(limit: number = 30): Promise<ShippedPr[]> {
  try {
    const res = await fetch(
      // per_page=40: this repo's PR objects run ~43KB each (loop-authored PRs
      // carry long bodies), and Next.js refuses to ISR-cache fetch responses
      // over 2MB — going over silently loses the daily cache and hits GitHub
      // on every revalidation. Verified: 50 → 2.17MB (over), 40 → ~1.7MB.
      `https://api.github.com/repos/${REPO}/pulls?state=closed&base=main&sort=updated&direction=desc&per_page=40`,
      {
        headers: { Accept: 'application/vnd.github+json' },
        next: { revalidate: 86400 },
        signal: AbortSignal.timeout(5000),
      },
    );
    if (!res.ok) return [];

    const pulls = (await res.json()) as GitHubPull[];

    return pulls
      .filter((pr): pr is GitHubPull & { merged_at: string } => Boolean(pr.merged_at))
      .sort((a, b) => b.merged_at.localeCompare(a.merged_at))
      .slice(0, limit)
      .map((pr) => {
        const { kind, subject } = parseTitle(pr.title);
        return {
          number: pr.number,
          title: subject,
          mergedAt: pr.merged_at.slice(0, 10),
          url: pr.html_url,
          kind,
        };
      });
  } catch (error) {
    logError('Error fetching merged PRs for changelog', error, { module: 'changelog' });
    return [];
  }
}
