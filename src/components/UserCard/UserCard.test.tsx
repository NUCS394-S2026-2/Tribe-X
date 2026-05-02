import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { User } from '../../shared/types/User';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  const mockUser: User = {
    uid: '1',
    email: 'test@example.com',
    displayName: 'Test User',
    photoUrl: 'https://example.com/photo.jpg',
    team: 'red',
  };

  it('renders user picture with alt text', () => {
    render(<UserCard user={mockUser} />);
    const image = screen.getByAltText('Test User');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/photo.jpg');
  });

  it('renders user display name', () => {
    render(<UserCard user={mockUser} />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('renders email as mailto link', () => {
    render(<UserCard user={mockUser} />);
    const link = screen.getByRole('link', { name: 'test@example.com' });
    expect(link).toHaveAttribute('href', 'mailto:test@example.com');
  });

  it('given a user is displayed when the email link is clicked then it opens the user email client', () => {
    // This test verifies that the mailto link is properly rendered
    // Actual email client opening is browser behavior and cannot be tested in jsdom
    render(<UserCard user={mockUser} />);
    const link = screen.getByRole('link', { name: 'test@example.com' });
    expect(link).toHaveAttribute('href', 'mailto:test@example.com');
  });
});
