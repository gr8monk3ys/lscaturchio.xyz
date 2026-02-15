import { ImageResponse } from 'next/og';
import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit, RATE_LIMITS } from '@/lib/with-rate-limit';

/* eslint-disable @next/next/no-img-element */

export const runtime = 'edge';

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

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'space-between',
          backgroundColor: '#f7f4ed',
          padding: '56px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'radial-gradient(1200px circle at 8% -12%, rgba(19, 92, 52, 0.18), transparent 60%),' +
              'radial-gradient(900px circle at 96% -8%, rgba(12, 74, 110, 0.14), transparent 55%),' +
              'radial-gradient(700px circle at 60% 98%, rgba(234, 88, 12, 0.12), transparent 60%),' +
              'linear-gradient(135deg, rgba(255, 255, 255, 0.85), rgba(247, 244, 237, 1))',
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-180px',
            width: '520px',
            height: '520px',
            borderRadius: '999px',
            background: 'rgba(234, 88, 12, 0.14)',
            filter: 'blur(0px)',
          }}
          aria-hidden
        />

        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            width: '660px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '999px',
                backgroundColor: 'rgba(19, 92, 52, 0.10)',
                border: '1px solid rgba(19, 92, 52, 0.18)',
                color: '#1f3b2e',
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
                padding: '10px 14px',
                borderRadius: '999px',
                backgroundColor: 'rgba(15, 23, 42, 0.04)',
                border: '1px solid rgba(15, 23, 42, 0.06)',
                color: 'rgba(15, 23, 42, 0.65)',
                fontSize: '16px',
                fontWeight: 600,
              }}
            >
              {type === 'blog' ? 'Essay' : type === 'project' ? 'Case study' : 'Portfolio'}
            </div>
          </div>

          <h1
            style={{
              fontSize: title.length > 56 ? '54px' : '66px',
              fontWeight: 800,
              color: '#0b0f13',
              lineHeight: 1.05,
              margin: 0,
            }}
          >
            {truncate(title, 96)}
          </h1>

          {description && (
            <p
              style={{
                fontSize: '28px',
                color: 'rgba(20, 30, 24, 0.68)',
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
                borderRadius: '18px',
                backgroundColor: 'rgba(19, 92, 52, 0.10)',
                border: '1px solid rgba(19, 92, 52, 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                fontWeight: 900,
                color: '#1f3b2e',
              }}
            >
              LS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#0b0f13' }}>
                Lorenzo Scaturchio
              </div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'rgba(20, 30, 24, 0.55)' }}>
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
          <div
            style={{
              position: 'absolute',
              inset: '-36px',
              borderRadius: '60px',
              background: 'rgba(19, 92, 52, 0.06)',
              border: '1px solid rgba(19, 92, 52, 0.10)',
              transform: 'rotate(2deg)',
            }}
            aria-hidden
          />
          {coverUrl ? (
            <img
              src={coverUrl}
              alt=""
              width={420}
              height={420}
              style={{
                width: '420px',
                height: '420px',
                borderRadius: '48px',
                objectFit: 'cover',
                border: '1px solid rgba(15, 23, 42, 0.10)',
                boxShadow: '0 30px 90px rgba(0,0,0,0.12)',
              }}
            />
          ) : (
            <div
              style={{
                width: '420px',
                height: '420px',
                borderRadius: '48px',
                border: '1px solid rgba(15, 23, 42, 0.10)',
                background:
                  'radial-gradient(420px circle at 35% 25%, rgba(19, 92, 52, 0.20), transparent 60%),' +
                  'radial-gradient(420px circle at 72% 70%, rgba(234, 88, 12, 0.16), transparent 60%),' +
                  'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(247,244,237,1))',
                boxShadow: '0 30px 90px rgba(0,0,0,0.10)',
              }}
              aria-hidden
            />
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
