import { describe, it, expect, vi, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { ConsoleGreeting } from '@/components/layout/console-greeting';

afterEach(() => vi.restoreAllMocks());

describe('ConsoleGreeting', () => {
  it('prints a styled greeting once on mount and renders nothing', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { container } = render(<ConsoleGreeting />);

    // Renders no DOM.
    expect(container).toBeEmptyDOMElement();
    // Logs the head + body (styled with %c).
    expect(log).toHaveBeenCalled();
    expect(log.mock.calls.some(([msg]) => String(msg).includes('%c'))).toBe(true);
    expect(
      log.mock.calls.some(([msg]) => String(msg).includes('opened the console'))
    ).toBe(true);
  });
});
