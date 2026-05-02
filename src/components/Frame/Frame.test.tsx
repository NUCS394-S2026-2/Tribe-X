import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { User } from '../../shared/types/User';
import { Frame } from './Frame';

describe('Frame', () => {
  const mockUsers: User[] = [
    {
      uid: '1',
      email: 'red1@example.com',
      displayName: 'Red Member 1',
      photoUrl: 'https://example.com/red1.jpg',
      team: 'red',
    },
    {
      uid: '2',
      email: 'blue1@example.com',
      displayName: 'Blue Member 1',
      photoUrl: 'https://example.com/blue1.jpg',
      team: 'blue',
    },
  ];

  it('renders frame header', () => {
    render(<Frame users={mockUsers} />);
    expect(
      screen.getByRole('heading', { level: 1, name: /Tribe X/ }),
    ).toBeInTheDocument();
  });

  it('renders red team section', () => {
    render(<Frame users={mockUsers} />);
    expect(screen.getByText('Red Team')).toBeInTheDocument();
    expect(screen.getByText('Red Member 1')).toBeInTheDocument();
  });

  it('renders blue team section', () => {
    render(<Frame users={mockUsers} />);
    expect(screen.getByText('Blue Team')).toBeInTheDocument();
    expect(screen.getByText('Blue Member 1')).toBeInTheDocument();
  });

  it('given a frame with team members when the frame is rendered then only team members are displayed in their respective section', () => {
    render(<Frame users={mockUsers} />);
    // Red team should only show red members
    const redSection = screen.getByText('Red Team').closest('section');
    expect(redSection).toHaveTextContent('Red Member 1');
    expect(redSection).not.toHaveTextContent('Blue Member 1');

    // Blue team should only show blue members
    const blueSection = screen.getByText('Blue Team').closest('section');
    expect(blueSection).toHaveTextContent('Blue Member 1');
    expect(blueSection).not.toHaveTextContent('Red Member 1');
  });
});
