import { createRef } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  ListenButton,
  ProgressBar,
  TransportControls,
} from '@/components/blog/audio-player-controls';

describe('ListenButton', () => {
  it('fires its click handler', async () => {
    const onClick = vi.fn();
    render(<ListenButton label="Listen" icon="headphones" onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: 'Listen' }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe('ProgressBar', () => {
  const baseProps = {
    currentTime: 65,
    duration: 130,
    progress: 50,
    progressRef: createRef<HTMLDivElement>(),
    onProgressClick: vi.fn(),
    onProgressKeyDown: vi.fn(),
  };

  it('exposes an accessible slider with the current progress', () => {
    render(<ProgressBar {...baseProps} />);
    const slider = screen.getByRole('slider', { name: 'Audio progress' });
    expect(slider).toHaveAttribute('aria-valuenow', '50');
    expect(slider).toHaveAttribute('aria-valuemin', '0');
    expect(slider).toHaveAttribute('aria-valuemax', '100');
  });

  it('formats current time and duration as m:ss', () => {
    render(<ProgressBar {...baseProps} />);
    expect(screen.getByText('1:05')).toBeInTheDocument();
    expect(screen.getByText('2:10')).toBeInTheDocument();
  });

  it('routes clicks and key presses to the seek handlers', async () => {
    render(<ProgressBar {...baseProps} />);
    const slider = screen.getByRole('slider');
    fireEvent.click(slider);
    expect(baseProps.onProgressClick).toHaveBeenCalled();
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(baseProps.onProgressKeyDown).toHaveBeenCalled();
  });
});

describe('TransportControls', () => {
  const handlers = {
    onChangeSpeed: vi.fn(),
    onSkipBackward: vi.fn(),
    onSkipForward: vi.fn(),
    onToggleMute: vi.fn(),
    onTogglePlay: vi.fn(),
  };
  const baseProps = {
    isLoading: false,
    isMuted: false,
    isPlaying: false,
    speed: 1 as const,
    ...handlers,
  };

  it('labels the main button Play when paused and Pause when playing', () => {
    const { rerender } = render(<TransportControls {...baseProps} />);
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();
    rerender(<TransportControls {...baseProps} isPlaying />);
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
  });

  it('shows a spinner while loading', () => {
    const { container } = render(<TransportControls {...baseProps} isLoading />);
    expect(container.querySelector('.animate-spin')).not.toBeNull();
  });

  it('skips 15 seconds either way', async () => {
    render(<TransportControls {...baseProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Skip back 15 seconds' }));
    fireEvent.click(screen.getByRole('button', { name: 'Skip forward 15 seconds' }));
    expect(handlers.onSkipBackward).toHaveBeenCalledOnce();
    expect(handlers.onSkipForward).toHaveBeenCalledOnce();
  });

  it('cycles speed and toggles mute with the right labels', async () => {
    const { rerender } = render(<TransportControls {...baseProps} />);
    fireEvent.click(
      screen.getByRole('button', { name: 'Playback speed: 1x. Click to change.' })
    );
    expect(handlers.onChangeSpeed).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'Mute' }));
    expect(handlers.onToggleMute).toHaveBeenCalledOnce();
    rerender(<TransportControls {...baseProps} isMuted />);
    expect(screen.getByRole('button', { name: 'Unmute' })).toBeInTheDocument();
  });
});
