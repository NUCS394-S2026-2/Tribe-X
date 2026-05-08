import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import App from './App';

describe('App component', () => {
  test('renders the AudioTagger', () => {
    render(<App />);
    expect(screen.getByLabelText(/select audio file/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /analyze/i })).toBeInTheDocument();
    expect(screen.getByText(/music tags/i)).toBeInTheDocument();
  });
});
