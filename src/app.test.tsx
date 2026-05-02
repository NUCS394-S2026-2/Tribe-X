import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import App from './App';

describe('App component', () => {
  test('renders the frame with team sections', () => {
    render(<App />);
    expect(screen.getByText(/Tribe X/)).toBeInTheDocument();
    expect(screen.getByText('Red Team')).toBeInTheDocument();
    expect(screen.getByText('Blue Team')).toBeInTheDocument();
  });

  test('renders mock users in their respective teams', () => {
    render(<App />);
    expect(screen.getByText('Cai, Wenpeng')).toBeInTheDocument();
    expect(screen.getByText('Ridad, Christopher')).toBeInTheDocument();
  });

  test('given the app is rendered when a user email link is displayed then it is clickable', () => {
    render(<App />);
    const redEmail = screen.getByRole('link', { name: 'c9v3w5@u.northwestern.edu' });
    const blueEmail = screen.getByRole('link', {
      name: 'christopherridad2027@u.northwestern.edu',
    });
    expect(redEmail).toHaveAttribute('href', 'mailto:c9v3w5@u.northwestern.edu');
    expect(blueEmail).toHaveAttribute(
      'href',
      'mailto:christopherridad2027@u.northwestern.edu',
    );
  });

  test('renders user images with alt text', () => {
    render(<App />);
    expect(screen.getByAltText('Cai, Wenpeng')).toBeInTheDocument();
    expect(screen.getByAltText('Ridad, Christopher')).toBeInTheDocument();
  });

  test('renders user images from URLs', () => {
    render(<App />);
    const redImg = screen.getByAltText('Cai, Wenpeng');
    const blueImg = screen.getByAltText('Ridad, Christopher');
    expect(redImg).toHaveAttribute(
      'src',
      'https://ui-avatars.com/api/?name=Wenpeng+Cai&background=D32F2F&color=FFFFFF',
    );
    expect(blueImg).toHaveAttribute(
      'src',
      'https://ui-avatars.com/api/?name=Christopher+Ridad&background=1565C0&color=FFFFFF',
    );
  });
});
