import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatMessageList } from '@/components/chat/chat-message-list';

const scrollToBottom = vi.fn();
const disableAutoScroll = vi.fn();
let isAtBottom = true;

vi.mock('@/hooks/use-auto-scroll', () => ({
  useAutoScroll: () => ({
    scrollRef: { current: null },
    isAtBottom,
    scrollToBottom,
    disableAutoScroll,
  }),
}));

describe('ChatMessageList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders its messages and no scroll button while at the bottom', () => {
    isAtBottom = true;
    render(
      <ChatMessageList>
        <div>first message</div>
      </ChatMessageList>
    );
    expect(screen.getByText('first message')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Scroll to bottom' })).toBeNull();
  });

  it('offers a scroll-to-bottom button once scrolled up', async () => {
    isAtBottom = false;
    render(
      <ChatMessageList>
        <div>message</div>
      </ChatMessageList>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Scroll to bottom' }));
    expect(scrollToBottom).toHaveBeenCalledOnce();
  });
});
