import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const title = searchParams.get('title') || 'Lorenzo Scaturchio';
  const description = searchParams.get('description') || 'Data Scientist & Developer';
  const type = searchParams.get('type') || 'default'; // 'blog', 'project', 'default'

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          backgroundColor: '#0a0a0a',
          padding: '60px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Background gradient */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #1a1a2e 0%, #0a0a0a 50%, #16213e 100%)',
          }}
        />

        {/* Decorative elements */}
        <div
          style={{
            position: 'absolute',
            top: '60px',
            right: '60px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              fontSize: '24px',
              color: '#888',
              textTransform: 'uppercase',
              letterSpacing: '2px',
            }}
          >
            {type === 'blog' ? 'Blog Post' : type === 'project' ? 'Project' : 'lscaturchio.xyz'}
          </div>
        </div>

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            zIndex: 1,
            maxWidth: '900px',
          }}
        >
          <h1
            style={{
              fontSize: title.length > 50 ? '48px' : '64px',
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.2,
              margin: 0,
              textWrap: 'balance',
            }}
          >
            {title}
          </h1>

          {description && (
            <p
              style={{
                fontSize: '28px',
                color: '#a0a0a0',
                lineHeight: 1.4,
                margin: 0,
                maxWidth: '800px',
              }}
            >
              {description.length > 120
                ? description.substring(0, 120) + '...'
                : description}
            </p>
          )}
        </div>

        {/* Author signature */}
        <div
          style={{
            position: 'absolute',
            bottom: '60px',
            right: '60px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 700,
              color: '#fff',
            }}
          >
            LS
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span style={{ fontSize: '20px', color: '#fff', fontWeight: 600 }}>
              Lorenzo Scaturchio
            </span>
            <span style={{ fontSize: '16px', color: '#888' }}>
              Data Scientist & Developer
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
