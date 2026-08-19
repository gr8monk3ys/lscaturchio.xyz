import { createRef } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatInput } from '@/components/chat/chat-input';

describe('ChatInput', () => {
  it('forwards its ref to the textarea', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<ChatInput ref={ref} placeholder="Ask me anything" />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
    expect(screen.getByPlaceholderText('Ask me anything')).toBe(ref.current);
  });

  it('accepts typing and reports changes', async () => {
    const onChange = vi.fn();
    render(<ChatInput onChange={onChange} aria-label="chat" />);
    fireEvent.change(screen.getByLabelText('chat'), { target: { value: 'hey' } });
    expect(onChange).toHaveBeenCalled();
    expect(screen.getByLabelText('chat')).toHaveValue('hey');
  });

  it('can be disabled', () => {
    render(<ChatInput disabled aria-label="chat" />);
    expect(screen.getByLabelText('chat')).toBeDisabled();
  });
});
