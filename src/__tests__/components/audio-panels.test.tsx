import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { AudioPanels } from '@/components/blog/audio-panels';

// The two toggles show and hide a panel. Their on/off state was carried only
// by a pressed-in style, so a screen reader announced "Chapters, button"
// either way (WCAG 4.1.2).

function renderPanels(showChapters: boolean, showTranscript: boolean) {
  render(
    <AudioPanels
      chapters={[]}
      showChapters={showChapters}
      showTranscript={showTranscript}
      transcript="Text"
      onJumpToChapter={vi.fn()}
      onToggleChapters={vi.fn()}
      onToggleTranscript={vi.fn()}
    />
  );
}

describe('AudioPanels toggles', () => {
  it('expose whether their panel is open', () => {
    renderPanels(true, false);

    expect(screen.getByRole('button', { name: 'Chapters' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Transcript' })).toHaveAttribute('aria-expanded', 'false');
  });
});
