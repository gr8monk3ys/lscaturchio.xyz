import { ImageResponse } from 'next/og';
import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit, RATE_LIMITS } from '@/lib/with-rate-limit';

/* eslint-disable @next/next/no-img-element */

export const runtime = 'nodejs';

function truncate(s: string, max: number): string {
  const t = s.trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

const handleGet = async (request: NextRequest): Promise<NextResponse> => {
  const { searchParams } = new URL(request.url);
  const origin = new URL(request.url).origin;

  const title = searchParams.get('title') || 'Lorenzo Scaturchio';
  const description = searchParams.get('description') || 'Data Scientist & Developer';
  const type = searchParams.get('type') || 'default'; // 'blog', 'project', 'default'
  let cover = searchParams.get('cover');

  // Restrict cover URL to prevent SSRF - only allow this project's domains
  const ALLOWED_COVER_HOSTS = ['lscaturchio.xyz', 'www.lscaturchio.xyz'];
  if (cover) {
    try {
      // Only validate external URLs (absolute); relative paths are resolved to origin below
      if (cover.startsWith('http://') || cover.startsWith('https://')) {
        const coverHost = new URL(cover).hostname;
        if (!ALLOWED_COVER_HOSTS.includes(coverHost)) cover = null;
      }
    } catch {
      cover = null;
    }
  }

  const coverUrl = cover
    ? cover.startsWith('http://') || cover.startsWith('https://')
      ? cover
      : cover.startsWith('/')
        ? `${origin}${cover}`
        : `${origin}/${cover}`
    : null;

  const label =
    type === 'blog' ? 'Blog' : type === 'project' ? 'Project' : 'lscaturchio.xyz';

  // Flat editorial palette — matches the site: warm ivory paper, forest-green
  // ink accent, near-black text, hairline borders. No gradients, no orange.
  const INK = '#1b1b17';
  const MUTED = '#5c574c';
  const GREEN = '#135c34';
  const HAIRLINE = 'rgba(27, 27, 23, 0.14)';
  const PAPER = '#f7f4ed';
  const SERIF = "'Fraunces', Georgia, 'Times New Roman', serif";
  const SANS = "ui-sans-serif, system-ui, sans-serif";

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'space-between',
          backgroundColor: PAPER,
          padding: '64px',
          fontFamily: SANS,
          borderTop: `6px solid ${GREEN}`,
        }}
      >
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            width: '660px',
          }}
        >
          {/* Editorial mark — the same green tick that sits above section titles */}
          <div style={{ display: 'flex', width: '44px', height: '4px', borderRadius: '2px', backgroundColor: GREEN }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 14px',
                borderRadius: '999px',
                border: `1px solid ${GREEN}`,
                color: GREEN,
                fontSize: '16px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1.6px',
              }}
            >
              {label}
            </div>
            <div
              style={{
                padding: '8px 14px',
                borderRadius: '999px',
                border: `1px solid ${HAIRLINE}`,
                color: MUTED,
                fontSize: '16px',
                fontWeight: 600,
              }}
            >
              {type === 'blog' ? 'Essay' : type === 'project' ? 'Case study' : 'Portfolio'}
            </div>
          </div>

          <h1
            style={{
              fontFamily: SERIF,
              fontSize: title.length > 56 ? '56px' : '68px',
              fontWeight: 600,
              color: INK,
              lineHeight: 1.04,
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            {truncate(title, 96)}
          </h1>

          {description && (
            <p
              style={{
                fontSize: '28px',
                color: MUTED,
                lineHeight: 1.35,
                margin: 0,
              }}
            >
              {truncate(description, 140)}
            </p>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              marginTop: 'auto',
              paddingTop: '10px',
            }}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '12px',
                border: `1px solid ${GREEN}`,
                color: GREEN,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: SERIF,
                fontSize: '22px',
                fontWeight: 700,
              }}
            >
              LS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: INK }}>
                Lorenzo Scaturchio
              </div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: MUTED }}>
                lscaturchio.xyz
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            position: 'relative',
            width: '420px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {coverUrl ? (
            <img
              src={coverUrl}
              alt=""
              width={400}
              height={400}
              style={{
                width: '400px',
                height: '400px',
                borderRadius: '16px',
                objectFit: 'cover',
                border: `1px solid ${HAIRLINE}`,
              }}
            />
          ) : (
            <div
              style={{
                width: '400px',
                height: '400px',
                borderRadius: '16px',
                border: `1px solid ${HAIRLINE}`,
                backgroundColor: 'rgba(19, 92, 52, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: SERIF,
                fontSize: '120px',
                fontWeight: 600,
                color: 'rgba(19, 92, 52, 0.22)',
              }}
              aria-hidden
            >
              LS
            </div>
          )}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  ) as unknown as NextResponse;
};

export const GET = withRateLimit(handleGet, RATE_LIMITS.STANDARD);
