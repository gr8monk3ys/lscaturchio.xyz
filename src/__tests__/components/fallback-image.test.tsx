import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FallbackImage } from '@/components/ui/fallback-image';

// next/image is mocked globally in setup.tsx and renders a plain <img>.

describe('FallbackImage', () => {
  it('renders the provided source', () => {
    render(
      <FallbackImage
        src="/images/blog/real.webp"
        alt="A real picture"
        width={100}
        height={100}
        enableBlur={false}
      />
    );
    expect(screen.getByRole('img', { name: 'A real picture' })).toHaveAttribute(
      'src',
      '/images/blog/real.webp'
    );
  });

  it('swaps to the default fallback when the image errors', () => {
    render(
      <FallbackImage
        src="/images/blog/missing.webp"
        alt="A missing picture"
        width={100}
        height={100}
        enableBlur={false}
      />
    );
    const img = screen.getByRole('img', { name: 'A missing picture' });
    fireEvent.error(img);
    expect(img).toHaveAttribute('src', '/images/blog/default.webp');
  });

  it('swaps to a custom fallbackSrc when provided', () => {
    render(
      <FallbackImage
        src="/images/blog/missing.webp"
        fallbackSrc="/images/custom-fallback.webp"
        alt="A missing picture"
        width={100}
        height={100}
        enableBlur={false}
      />
    );
    const img = screen.getByRole('img', { name: 'A missing picture' });
    fireEvent.error(img);
    expect(img).toHaveAttribute('src', '/images/custom-fallback.webp');
  });

  it('invokes onError only once for the same failing source', () => {
    const onError = vi.fn();
    render(
      <FallbackImage
        src="/images/blog/missing.webp"
        alt="A missing picture"
        width={100}
        height={100}
        enableBlur={false}
        onError={onError}
      />
    );
    const img = screen.getByRole('img', { name: 'A missing picture' });
    fireEvent.error(img);
    fireEvent.error(img);
    expect(onError).toHaveBeenCalledTimes(1);
  });
});
