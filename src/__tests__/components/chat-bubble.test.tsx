import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  ChatBubble,
  ChatBubbleMessage,
  ChatBubbleAvatar,
} from '@/components/chat/chat-bubble';

describe('ChatBubble', () => {
  it('reverses the row for sent messages', () => {
    const { container } = render(
      <ChatBubble variant="sent">
        <ChatBubbleMessage variant="sent">hi</ChatBubbleMessage>
      </ChatBubble>
    );
    expect(container.firstElementChild).toHaveClass('flex-row-reverse');
  });

  it('does not reverse received messages', () => {
    const { container } = render(
      <ChatBubble>
        <ChatBubbleMessage>hello</ChatBubbleMessage>
      </ChatBubble>
    );
    expect(container.firstElementChild).not.toHaveClass('flex-row-reverse');
  });

  it('styles sent and received message bodies differently', () => {
    render(
      <>
        <ChatBubbleMessage variant="sent">mine</ChatBubbleMessage>
        <ChatBubbleMessage>theirs</ChatBubbleMessage>
      </>
    );
    const sent = screen.getByText('mine');
    const received = screen.getByText('theirs');

    // Distinguishable, and both on paper. The previous assertion pinned
    // `bg-primary` on the sent bubble, which encoded Forest Ink as area — the
    // One Pen Rule's named failure — into the test suite. Assert the rule
    // instead of the class.
    expect(sent.className).not.toEqual(received.className);
    expect(sent).toHaveClass('bg-primary/8');
    expect(received).toHaveClass('bg-card');
    for (const bubble of [sent, received]) {
      expect(bubble).toHaveClass('border');
      expect(bubble.className).not.toMatch(/\bbg-primary\b(?!\/)/);
    }
  });

  it('swaps children for a loading indicator while streaming', () => {
    const { container } = render(
      <ChatBubbleMessage isLoading>should not appear</ChatBubbleMessage>
    );
    expect(screen.queryByText('should not appear')).toBeNull();
    // MessageLoading renders an animated SVG placeholder.
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('renders the avatar fallback initials', () => {
    render(<ChatBubbleAvatar fallback="LS" />);
    expect(screen.getByText('LS')).toBeInTheDocument();
  });
});
