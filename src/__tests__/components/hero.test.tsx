import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Hero } from '@/components/home/Hero';

describe('Hero', () => {
  it('renders the name as the masthead heading', () => {
    render(<Hero />);
    expect(
      screen.getByRole('heading', { name: /Lorenzo Scaturchio/ })
    ).toBeInTheDocument();
  });

  it('exposes a labelled ask form that GETs to /chat', () => {
    const { container } = render(<Hero />);
    const input = screen.getByLabelText('Ask my site anything');
    expect(input).toHaveAttribute('name', 'q');
    const form = container.querySelector('form');
    expect(form).toHaveAttribute('action', '/chat');
    expect(form).toHaveAttribute('method', 'get');
  });

  it('renders suggestion links that prefill the chat query', () => {
    render(<Hero />);
    const suggestion = screen.getByRole('link', { name: 'What do you actually do?' });
    expect(suggestion.getAttribute('href')).toContain('/chat?q=');
  });
});
